import axios, { AxiosResponse } from "axios";
import { ipcMain } from "electron/main";
import { mainWindow } from "./main";

const urlOW = "https://www.ovwritt.com/ritt-ajax.php?action=get-live-ritt-data";
const testUrl = "https://www.ovwritt.com/ritt-ajax.php?action=get-result-data"

//update every 2 seconds
const timer = setInterval(update, 2000);

//update on request from user
ipcMain.on("refresh", (event, specifiedLocation: Locations) => update(specifiedLocation));

async function update(specifiedLocation?: Locations) {
    console.log("\nRetrieving Data...")
    //gets location and data from api
	var resProm = axios.get(testUrl);
	let [location, res] = specifiedLocation
		? [specifiedLocation, await resProm]
		: await Promise.all([getLocation(), resProm]);

	const data = res.data.data as ResultEntry[];

    console.log("Location: " + location)

    // filters the top 5
	let topFive = data
        //if the race is finished then exclude who has not finished all locations
		.filter((v) => location != "ende" 
            || Object.values(dict).every((l) => (v as any)["platz" + l]))
        //filters out the right location for any team
		.map((v) => ({
			team: v.team,
			platz: Number.parseInt((v as any)["platz" + dict[location]]),
			zeit: location != "ende" ? (v as any)["zeit" + dict[location]] : v.total,
			diff: (v as any)["diff" + dict[location]],
			strafe: (v as any)["strafe" + dict[location]],
			total: v.total,
		}as FilteredResult))
		.filter((v) => v.platz <= 5)
        .sort((a,b) => a.platz - b.platz);

    mainWindow?.webContents.send("top-five-update", topFive)
}

function getLocation() {
	return new Promise<Locations>(function (resolve, reject) {
		mainWindow?.webContents.send("location-request");
		ipcMain.once("location-reply", (event, location) => {
			resolve(location as Locations);
		});
	});
}

//TODO: ende scoreboard zeigt undefined

const dict = {
	kastelruth: "K",
	seis: "S",
	weiher: "W",
	proesels: "P",
	ende: "",
};

type Locations = "kastelruth" | "seis" | "weiher" | "proesels" | "ende";



interface ResultEntry {
	jahr: string;
	platz: string;
	reiter1: string;
	reiter2: string;
	reiter3: string;
	reiter4: string;
	team: string;
	total: string;
	diff: string;
	platzK: string;
	zeitK: string;
	diffK: string;
	strafe: string;
	strafeK: string;
	platzS: string;
	zeitS: string;
	diffS: string;
	strafeS: string;
	platzW: string;
	zeitW: string;
	diffW: string;
	strafeW: string;
	platzP: string;
	zeitP: string;
	diffP: string;
	strafeP: string;
}

export interface FilteredResult {
    team: string,
    platz: number,
    zeit:string,
    strafe:string,
    total:string,
    diff:string
}

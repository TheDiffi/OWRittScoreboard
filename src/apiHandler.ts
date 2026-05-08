import axios from "axios";
import { ipcMain } from "electron/main";
import { mainWindow, getCurrentLocation } from "./main";

const urlOW = "https://www.ovwritt.com/ritt-ajax.php?action=get-live-ritt-data";

const timer = setInterval(update, 2000);

ipcMain.on("refresh", (_, specifiedLocation?: Locations) => update(specifiedLocation));

async function update(specifiedLocation?: Locations) {
	console.log("\nRetrieving Data...");
	const location: Locations = specifiedLocation ?? (getCurrentLocation() as Locations);
	const res = await axios.get(urlOW);
	const data = res.data.data as ResultEntry[];

	let topFive = data
		.filter(
			(v) =>
				location !== "ende" ||
				Object.values(dict).every((l) => (v as any)["platz" + l])
		)
		.map(
			(v) =>
				({
					team: v.team,
					platz: Number.parseInt((v as any)["platz" + dict[location]]),
					zeit: location !== "ende" ? (v as any)["zeit" + dict[location]] : v.total,
					diff: (v as any)["diff" + dict[location]],
					strafe: (v as any)["strafe" + dict[location]],
					total: v.total,
				} as FilteredResult)
		)
		.filter((v) => v.platz > 0 && v.platz <= 5)
		.sort((a, b) => a.platz - b.platz);

	mainWindow?.webContents.send("top-five-update", topFive);
}

const dict: Record<Locations, string> = {
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
	team: string;
	platz: number;
	zeit: string;
	strafe: string;
	total: string;
	diff: string;
}

import { ipcRenderer } from "electron/renderer";
import { FilteredResult } from "./apiHandler";

document.getElementById("location-select")?.addEventListener("click", refresh);
document.getElementById("btn-exit")?.addEventListener("click", () => ipcRenderer.send("exit"));
document.getElementById("btn-update")?.addEventListener("click", refresh);
document
	.getElementById("btn-fullscreen-toggle")
	?.addEventListener("click", toggleFullscreen);

function toggleFullscreen() {
	let checkbox = document.getElementById("btn-fullscreen-toggle") as HTMLInputElement;
	ipcRenderer.send("toggle-fullscreen", checkbox.checked);
}


ipcRenderer.on("location-request", () => {
	ipcRenderer.send("location-reply", getSelectedRadioValue("location"));
});
ipcRenderer.on("top-five-update", (event, topFive: FilteredResult[]) => updateScoreboard(topFive));

function refresh() {
	console.log("send refresh request");
	updateTitle();
	let location = getSelectedRadioValue("location");
	ipcRenderer.send("refresh", location);
}

function updateScoreboard(topFive: FilteredResult[]) {
	console.log("updating scorebord...");
	topFive.sort((a, b) => a.platz - b.platz).reverse();

	const fields = document.querySelectorAll("#scoreboard div.score-content");
	for (const field of fields) {
		let team = topFive.pop();
		let placeNode = createScoreNode("place", team?.platz.toString() + ". " ?? "---");
		let teamNode = createScoreNode("team", team?.team ?? "-----");
		let timeNode = createScoreNode("time", team?.zeit ?? "-----");

		field.innerHTML = ""; //clears Node
		field.appendChild(placeNode);
		field.appendChild(teamNode);
		field.appendChild(timeNode);
	}

	function createScoreNode(type: "time" | "team" | "place", value: string) {
		console.log(value);
		if (value.indexOf("undefined.") != -1) value = value.replace("undefined.", "");
		if (value.indexOf("undefined") != -1) value = value.replace("undefined", "");
		let newScoreNode = document.createElement("div");
		newScoreNode.setAttribute("class", `score-${type}`);
		newScoreNode.innerHTML = value;
		return newScoreNode;
	}
}

function getSelectedRadioValue(radioName: string) {
	const elems = document.getElementsByName(radioName) as any;
	for (const ele of elems) {
		if (ele.checked!) return ele.value as string;
	}
}
function updateTitle() {
	const elem = document.getElementById("title");
	let text = convertRadioValueToText(getSelectedRadioValue("location")?? "");
    elem!.innerHTML = text;
}

function convertRadioValueToText(value: string) {
	switch (value) {
		case "kastelruth":
			return "Kastelruth";
		case "seis":
			return "Seis";
		case "weiher":
			return "Weiher";
		case "proesels":
			return "Prösels";
		case "ende":
			return "Total";
		default:
			return "";
	}
}

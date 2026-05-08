import { ipcRenderer } from "electron/renderer";
import { FilteredResult } from "./apiHandler";

document.getElementById("open-menu-btn")?.addEventListener("click", () => {
	ipcRenderer.send("open-menu-window");
});

ipcRenderer.on("top-five-update", (_, topFive: FilteredResult[]) => updateScoreboard(topFive));

ipcRenderer.on("update-title", (_, location: string) => {
	const elem = document.getElementById("title");
	if (elem) elem.innerHTML = convertRadioValueToText(location);
});

ipcRenderer.on("set-banner", (_, filePath: string) => {
	const bannerImg = document.querySelector("#banner .banner") as HTMLImageElement | null;
	if (bannerImg) bannerImg.src = `file://${filePath}`;
});

function updateScoreboard(topFive: FilteredResult[]) {
	console.log("updating scoreboard...");
	topFive.sort((a, b) => a.platz - b.platz).reverse();

	const fields = document.querySelectorAll("#scoreboard div.score-content");
	for (const field of fields) {
		let team = topFive.pop();
		let placeNode = createScoreNode("place", team ? team.platz.toString() + ". " : "---");
		let teamNode = createScoreNode("team", team ? team.team : "-----");
		let timeNode = createScoreNode("time", team ? team.zeit : "-----");

		field.innerHTML = "";
		field.appendChild(placeNode);
		field.appendChild(teamNode);
		field.appendChild(timeNode);
	}
}

function createScoreNode(type: "time" | "team" | "place", value: string) {
	if (value.indexOf("undefined.") !== -1) value = value.replace("undefined.", "");
	if (value.indexOf("undefined") !== -1) value = value.replace("undefined", "");
	let newScoreNode = document.createElement("div");
	newScoreNode.setAttribute("class", `score-${type}`);
	newScoreNode.innerHTML = value;
	return newScoreNode;
}

function convertRadioValueToText(value: string) {
	switch (value) {
		case "kastelruth": return "Kastelruth";
		case "seis": return "Seis";
		case "weiher": return "Weiher";
		case "proesels": return "Prösels";
		case "ende": return "Total";
		default: return "";
	}
}

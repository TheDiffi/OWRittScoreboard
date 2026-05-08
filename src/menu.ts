import { ipcRenderer } from "electron/renderer";

document.addEventListener("DOMContentLoaded", () => {
	document.getElementById("location-select")?.addEventListener("change", () => {
		const location = getSelectedRadioValue("location");
		if (location) ipcRenderer.send("menu-set-location", location);
	});

	const fullscreenBtn = document.getElementById("btn-fullscreen-toggle") as HTMLInputElement | null;
	fullscreenBtn?.addEventListener("change", function () {
		ipcRenderer.send("menu-toggle-fullscreen", this.checked);
	});

	document.getElementById("btn-update")?.addEventListener("click", () => {
		ipcRenderer.send("refresh");
	});

	document.getElementById("btn-banner")?.addEventListener("click", () => {
		ipcRenderer.send("menu-open-banner-dialog");
	});

	document.getElementById("btn-exit")?.addEventListener("click", () => {
		ipcRenderer.send("menu-exit");
	});

	ipcRenderer.on("menu-init-state", (_, state: { location: string }) => {
		const radio = document.querySelector(
			`input[name="location"][value="${state.location}"]`
		) as HTMLInputElement | null;
		if (radio) radio.checked = true;
	});
});

function getSelectedRadioValue(radioName: string): string | undefined {
	const elems = document.getElementsByName(radioName);
	for (const ele of elems) {
		if ((ele as HTMLInputElement).checked) return (ele as HTMLInputElement).value;
	}
	return undefined;
}


import { ipcRenderer } from "electron/renderer";
import { FilteredResult } from "./apiHandler";

document.getElementById("location-select")?.addEventListener("click", refresh)
document.getElementById("btn-update")?.addEventListener("click", refresh)
//update every 2 seconds
//const timer = setInterval(refresh, 2000);


ipcRenderer.on("location-request", () => {
    ipcRenderer.send("location-reply", getSelectedRadioValue("location"))
})
ipcRenderer.on("top-five-update", (event, topFive:FilteredResult[]) => updateScoreboard(topFive))

function refresh(){
    console.log("send refresh request")
    let location = getSelectedRadioValue("location")
    ipcRenderer.send("refresh", location)
}

function updateScoreboard(topFive: FilteredResult[]){
    console.log("updating scorebord...")
    topFive.sort((a,b) => a.platz - b.platz).reverse()
    const fields = document.querySelectorAll("#scoreboard div.item")
    for (const field of fields) {
        let team = topFive.pop();
        field.innerHTML = `${team?.platz}. ${team?.team}: ${team?.zeit}` 
    }
}

function getSelectedRadioValue(radioName: string){
    const elems = document.getElementsByName(radioName) as any;
    for (const ele of elems) {
        if(ele.checked!) return ele.value as string;
    }
}


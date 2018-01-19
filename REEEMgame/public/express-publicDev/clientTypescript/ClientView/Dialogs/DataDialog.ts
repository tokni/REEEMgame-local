declare var $: any;
import { Dialog } from "./Dialog"
export class DataDialog extends Dialog{
    constructor() {
        super();
        this.m_id = "dataDialog";
        console.log("Creating dialog");
        var mainDiv: HTMLDivElement = document.createElement("div");
        $('body').append(mainDiv);
        mainDiv.id = this.m_id;
        mainDiv.title = "Data";
        var headerDiv: HTMLDivElement = document.createElement("div");
        mainDiv.appendChild(headerDiv);
        headerDiv.innerHTML = "This is the default dialog which is useful for displaying information. The dialog window can be moved, resized and closed with the 'x' icon.";
        headerDiv.classList.add("header");
        var imgDiv: HTMLDivElement = document.createElement("div");
        mainDiv.appendChild(imgDiv);
        var img: HTMLImageElement = document.createElement("img");
        imgDiv.appendChild(img);
        img.setAttribute("src", "/express-publicDev/clientTypescript/data.png");
        img.setAttribute("width", "90%");
        img.setAttribute("height", "90%");

        $("#dataDialog").dialog({
            modal: true,
            width: 500,
            height: 500,
        });
        $("#DataDialog").hide();
    }
    public open(): void {
        console.log("open dialog");
        
        $("#dataDialog").dialog("open");
    }
    public getID(): string {
        return this.m_id;
    }
    public update() {

    }
}
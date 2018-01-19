declare var $: any;
import { Dialog } from "./Dialog"

export class ErrorDialog extends Dialog {
    private m_mainDiv: HTMLDivElement;
    private m_variableName: string = "Variable";
    constructor() {
        super();
        console.log("Created error dialog");
        this.m_id = "errorDialg";
        this.m_mainDiv = document.createElement("div");
        $('body').append(this.m_mainDiv);
        this.m_mainDiv.id = this.m_id;

        var headerDiv: HTMLDivElement = document.createElement("div");
        this.m_mainDiv.appendChild(headerDiv);
        headerDiv.innerHTML = "Something went wrong";
        headerDiv.classList.add("header");
        var contentDiv: HTMLElement = document.createElement("div");
        contentDiv.id = "errorMsg";
        contentDiv.style.paddingBottom = "10px";
        this.m_mainDiv.appendChild(contentDiv);
        $("#errorDialg").hide();
    }
    public open(p_data: { msg: string }): void {
        $("#errorDialg").text(p_data.msg);
        $("#errorDialg").dialog({
            modal: false,
            resizable: true,
            draggable: true,
            width: 600,
            height: 300,
        });

    }
    public update(p_data: any[][]): void {
       //nothing to update
    }
}
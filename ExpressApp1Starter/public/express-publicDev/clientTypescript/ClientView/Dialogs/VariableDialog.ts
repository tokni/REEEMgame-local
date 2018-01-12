declare var $: any;
import { Dialog } from "./Dialog"

export class VariableDialog extends Dialog {
    private m_mainDiv: HTMLDivElement;
    private m_variableName: string = "Variable";
    constructor() {
        super();
        this.m_id = "variableDialog";
        this.m_mainDiv = document.createElement("div");
        $('body').append(this.m_mainDiv);
        this.m_mainDiv.id = this.m_id;

        var headerDiv: HTMLDivElement = document.createElement("div");
        this.m_mainDiv.appendChild(headerDiv);
        headerDiv.id = "variableDialogHeader"
        headerDiv.innerHTML = "";
        headerDiv.classList.add("header");

        var variableChartDiv: HTMLDivElement = document.createElement("div");
        variableChartDiv.id = "variableChartDiv";
        this.m_mainDiv.appendChild(variableChartDiv);

        var msgDiv: HTMLDivElement = document.createElement("div");
        this.m_mainDiv.appendChild(msgDiv);
        msgDiv.id = "msgVariableDiv";
        msgDiv.innerHTML = "There is no variable to show";

        var closeButton: HTMLButtonElement = document.createElement("button");
        this.m_mainDiv.appendChild(closeButton);
        closeButton.id = "closeVariableDialogButton";
        closeButton.innerHTML = "Ok, close";
        closeButton.classList.add("dialogButton")
        $("#closeVariableDialogButton").on('click', this.close);
        $("#variableDialog").hide();
    }
    public open(p_data: any[][]): void {
        this.update(p_data);
        $("#variableDialog").dialog({
            modal: false,
            resizable: true,
            draggable: true,
            width: 1000,
            height: 600,
        });

    }
    public close(): void {
        console.log("close dialog");
        $("#variableDialog").dialog("close");
    }
    public getID(): string {
        return this.m_id;
    }
    public update(p_data: any[][]): void {
        console.log("VariableDialog update");
        if (!p_data) {
            $("#msgVariableDiv").show();
            $("#variableChartDiv").hide();
        } else {
            $("#msgVariableDiv").hide();
            $("#variableChartDiv").show();
            $("#variableDialogHeader").html(p_data[0][2] + " in " + p_data[0][3]);
            var variableChartOptions: google.visualization.PieChartOptions = {
                title: p_data[0][0] + " " + p_data[0][1],
                chartArea: { left: '15%', top: '15%', width: '65%', height: '70%' },
                height: 400,
                width: 900,
                is3D: true,
                tooltip: { isHtml: true }
            }
            p_data.splice(0, 1);
            var variableChart: google.visualization.LineChart = new google.visualization.PieChart(document.getElementById("variableChartDiv"));
            var variableChartData = google.visualization.arrayToDataTable(p_data);
            variableChart.draw(variableChartData, variableChartOptions);
        }
    }
    public setVariableName(p_name) {
        this.m_variableName = p_name;
    }

}
declare var $: any;
import { Dialog } from "./Dialog"

export class InviteDialog extends Dialog {
    private m_mainDiv: HTMLDivElement;
    private m_variableName: string = "Variable";
    constructor(p_worldID, p_path) {
        super();
        console.log("C InviteDialog");
        this.m_id = "inviteDialog";
        this.m_mainDiv = document.createElement("div");
        $('body').append(this.m_mainDiv);
        this.m_mainDiv.id = this.m_id;

        var headerDiv: HTMLDivElement = document.createElement("div");
        this.m_mainDiv.appendChild(headerDiv);
        headerDiv.id = "Invite"
        headerDiv.innerHTML = "Invite participant";
        headerDiv.classList.add("header");
        var contentDiv: HTMLElement = document.createElement("div");
        contentDiv.innerHTML = "Copy/paste this link, and send it to a person you would like to play ReeemGame with";
        contentDiv.style.paddingBottom = "10px";
        this.m_mainDiv.appendChild(contentDiv);


        var link = document.createElement("a");
        link.href = p_path + '/?worldPassword=' + p_worldID;
        link.innerHTML = location.host + p_path + '/?worldPassword=' + p_worldID;
        this.m_mainDiv.appendChild(link);

        var button = document.createElement("button");
        button.id = "copyLink";
        button.setAttribute("data-copytarget", "#website " +p_worldID);
        button.innerHTML = "Copy link to clipboard";
        button.classList.add("pull-right");
        button.classList.add("btn-xs");
        

        
        this.m_mainDiv.appendChild(button);
        

        var closeButton: HTMLButtonElement = document.createElement("button");
        this.m_mainDiv.appendChild(closeButton);
        closeButton.id = "closeInviteDialogButton";
        closeButton.innerHTML = "Ok, close";
        closeButton.classList.add("dialogButton")
        $("#closeInviteDialogButton").on('click', this.close);
        $("#inviteDialog").hide();

        $("#copyLink").on('click', { worldID: p_worldID, link: (location.host + p_path + '/?worldPassword=' + p_worldID) }, this.copyLink);

    }
    private copyLink = (event): void => {
        var link: string = event.data.link;
        console.log("copy " + link);
        //Create temporary input for link
        var $temp = $("<input>");
        $("body").append($temp);
        $temp.val(link).select();
        document.execCommand("copy");
        $temp.remove(); //remove temp input again
    }
    public open(p_data: any[][]): void {
        this.update(p_data);
        $("#inviteDialog").dialog({
            modal: false,
            resizable: true,
            draggable: true,
            width: 600,
            height: 300,
        });

    }
    public close(): void {
        console.log("close dialog");
        $("#inviteDialog").dialog("close");
    }
    public getID(): string {
        return this.m_id;
    }
    public update(p_data: any[][]): void {
        //console.log("VariableDialog update");
        //if (!p_data) {
        //    $("#msgVariableDiv").show();
        //    $("#variableChartDiv").hide();
        //} else {
        //    $("#msgVariableDiv").hide();
        //    $("#variableChartDiv").show();
        //    $("#variableDialogHeader").html(p_data[0][2] + " in " + p_data[0][3]);
        //    var variableChartOptions: google.visualization.PieChartOptions = {
        //        title: p_data[0][0] + " " + p_data[0][1],
        //        chartArea: { left: '15%', top: '15%', width: '65%', height: '70%' },
        //        height: 400,
        //        width: 900,
        //        is3D: true,
        //        tooltip: { isHtml: true }
        //    }
        //    p_data.splice(0, 1);
        //    var variableChart: google.visualization.LineChart = new google.visualization.PieChart(document.getElementById("variableChartDiv"));
        //    var variableChartData = google.visualization.arrayToDataTable(p_data);
        //    variableChart.draw(variableChartData, variableChartOptions);
        //}
    }
    public setVariableName(p_name) {
        this.m_variableName = p_name;
    }
    

}
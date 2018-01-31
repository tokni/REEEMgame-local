declare var $: any;
import { Dialog } from "./Dialog"

export class ScoreDialog extends Dialog {
    private m_mainDiv: HTMLDivElement;
    constructor() {
        super();
        this.m_id = "scoreDialog";
        this.m_mainDiv = document.createElement("div");
        $('body').append(this.m_mainDiv);
        this.m_mainDiv.id = this.m_id;

        var headerDiv: HTMLDivElement = document.createElement("div");
        this.m_mainDiv.appendChild(headerDiv);
        headerDiv.innerHTML = "Score History";
        headerDiv.classList.add("header");

        var chartDiv: HTMLDivElement = document.createElement("div");
        chartDiv.id = "chartDiv";
        this.m_mainDiv.appendChild(chartDiv);

        var msgDiv: HTMLDivElement = document.createElement("div");
        this.m_mainDiv.appendChild(msgDiv);
        msgDiv.style.margin = "auto";
        msgDiv.style.width = "50%";
        msgDiv.style.textAlign = "center";
        msgDiv.style.marginTop = "10%";
        msgDiv.id = "msgDiv";
        msgDiv.innerHTML = "There is no history to show";

        var closeButton: HTMLButtonElement = document.createElement("button");
        this.m_mainDiv.appendChild(closeButton);
        closeButton.id = "closeScoreDialogButton";
        closeButton.innerHTML = "Ok, close";
        closeButton.classList.add("dialogButton")
        $("#closeScoreDialogButton").on('click', this.close);
        $("#scoreDialog").hide();
    }
    public open(p_data: any[][]): void {
        this.update(p_data);
        $("#scoreDialog").dialog({
            dialogClass: 'dialogNoTitle',
            modal: false,
            resizable: false,
            draggable: false,
            width: 1000,
            height: 600,
        });

    }
    public close(): void {
        console.log("close dialog");
        $("#scoreDialog").dialog("close");
    }
    public getID(): string {
        return this.m_id;
    }
    public update(p_data: any[][]): void {
        if (!p_data || p_data.length < 3) {
            $("#msgDiv").show();
            $("#chartDiv").hide();
        } else {
            $("#msgDiv").hide();
            $("#chartDiv").show();
            var scoreChart: google.visualization.LineChart = new google.visualization.LineChart(document.getElementById("chartDiv"));
            var scoreChartData = google.visualization.arrayToDataTable(p_data);

            var scoreChartOptions: google.visualization.LineChartOptions = {
                hAxis: {
                    title: 'Time'
                },
                vAxis: {
                    title: 'Scores'
                },
                explorer: { axis: 'horizontal', keepInBounds: true },
                chartArea: { left: '15%', top: '15%', width: '65%', height: '70%' },
                lineWidth: 1,
                height: 400,
                width: 900,

                tooltip: { isHtml: true }
            }
            scoreChart.draw(scoreChartData, scoreChartOptions);
        }
    }
}
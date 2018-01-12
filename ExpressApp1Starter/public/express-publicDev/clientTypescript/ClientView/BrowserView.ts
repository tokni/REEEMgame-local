import { ClientView } from "./ClientView"
import { BrowserMenuView } from "./BrowserMenuView"
import { OutputVariable } from "../clientModel/OutputVariable"

declare var $: any;

export class BrowserView extends ClientView{
    private m_browserMenuView: BrowserMenuView;
    private m_outputVariable: OutputVariable;

    constructor(p_connection, p_roles, p_model, p_profile, p_profiles){
        super(p_connection, p_roles, p_model);
        this.m_browserMenuView = new BrowserMenuView();
    }
    updateButtons() {

    }
    public drawChart(p_data) {
        var tableData = google.visualization.arrayToDataTable(p_data);
        var options = {
            title: 'Company Performancex',
            hAxis: { title: 'Year', titleTextStyle: { color: '#333' } },
            vAxis: { minValue: 0 },
            isStacked: true
        };
        var chart = new google.visualization.AreaChart(document.getElementById('areaChart'));
        chart.draw(tableData, options);
    }
    createButtonsForVariables(p_variableList: string[]) {
        $("#indicatorButtons").empty();
        var indicatorButtons = document.getElementById('indicatorButtons');
        for (var indicator of p_variableList) {
            var ul: HTMLUListElement = document.createElement("ul");
            indicatorButtons.appendChild(ul);
            var li: HTMLLIElement = document.createElement("li");
            ul.appendChild(li);

            var btn: HTMLButtonElement = document.createElement("button");
            li.appendChild(btn);
            var id = indicator.replace(/\s+|\@|\./g, '');
            btn.id = "indicator" + id;
            btn.innerHTML = indicator;
            btn.classList.add('menuButton');
            //btn.setAttribute('title', indicator.m_description);
        }
    }
    getOutputVariable(): OutputVariable {
        return this.m_outputVariable;
    }
    setOutputVariable(p_out: OutputVariable) {
        this.m_outputVariable = p_out
    }
}
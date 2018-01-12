import { Connection } from "./ClientControl/Connection"
import { TKN_Map } from "./leaflet/TKN_map"
import { ClientGameStatus } from "./clientModel/GameStatus"
import { OutputVariable } from "./clientModel/OutputVariable"
import { BrowserModel } from "./clientModel/BrowserModel"
import { BrowserView } from "./ClientView/BrowserView"
import { BrowserController } from "./ClientControl/BrowserController"

export class ReeemBrowser {
    private m_connection: Connection;
    private m_currentRole;
    private m_browserView;
    private m_browserController;
    private m_browserModel;
    private m_pathways;
    private m_indicators;
    private m_o: OutputVariable;
    private m_scenario: {
        duration: number, time: number, roles: {
            m_decisions:
            { m_id: string, m_name: string, m_value: number, m_minValue: number, m_maxValue: number, m_unit: string, m_description: string }[],
            m_name: string, m_indicators: {}
        }[], status: ClientGameStatus
    };

    //private m_map: TKN_Map;

    constructor(p_connection, p_pathways, p_indicators) {
        console.log("pathways: " + JSON.stringify(p_pathways));
        this.m_connection = p_connection;
        this.m_pathways = p_pathways;
        this.m_indicators = p_indicators;
        //this.m_map = new TKN_Map();
        //this.m_o = new OutputVariable('test');
        //var data: any[] = this.m_o.createAreaChartArray("TECHNOLOGY");
        //var tableData = google.visualization.arrayToDataTable(data);
        //this.drawChart(tableData);
        if (this.m_connection.isConnectionReady()) {
            console.log("Connection is ready");
            this.onConnectionReady(this.m_connection.getConnectionReadyData());
        }
        else {
            console.log("Participant listing to connection ready event");
            this.m_connection.listenToConnectionReadyEvent(this.onConnectionReady);
        }
        this.m_scenario = { duration: 100, time: 100, roles: [], status: ClientGameStatus.paused };
        }
    private onConnectionReady = (p_data) => {
        if (!this.m_browserModel) {
            var crole;
            this.m_scenario = p_data.scenario;
            for (var role of this.m_scenario.roles) {
                if (role.m_name == 'browser') {
                    crole = role;
                }
            }
            this.m_browserModel = new BrowserModel(null, this.m_scenario, null, []);
            this.m_browserView = new BrowserView(this.m_connection, null, this.m_browserModel, null, null);
            this.m_browserController = new BrowserController(this.m_connection, this.m_pathways, this.m_indicators, this.m_browserView, this.m_browserModel, ClientGameStatus.paused, crole);
            //this.m_map.setController(this.m_browserController);
            //this.m_map.setConnection(this.m_connection);
        }
    }
    private data = google.visualization.arrayToDataTable([
    ['Year', 'Sales', 'Expenses'],
    ['2013', 1000, 400],
    ['2014', 1170, 460],
    ['2015', 660, 1120],
    ['2016', 1030, 540]
]);
    
}
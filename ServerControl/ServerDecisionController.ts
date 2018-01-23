//declare var $: any;
import DataBaseHandler from '../ServerControl/DataBaseHandler';

export default class ServerDecisionController {
    private m_serverSocket;
    private m_worldID;
    private m_model;
    private m_dataBaseHandler:DataBaseHandler;

    constructor(p_serverSocket, p_worldID, p_model, p_databaseHandler: DataBaseHandler) {
        this.m_serverSocket = p_serverSocket;
        this.m_worldID = p_worldID;
        this.m_model = p_model;
        this.m_dataBaseHandler = p_databaseHandler;
        this.m_serverSocket.sockets.on('connection', (clientSocket) => {
            clientSocket.on('decisionChangeFromClient' + this.m_worldID, this.onDecisionChange);
        });
    }

    private onDecisionChange = (data) => { //data: {dec:string, role:string, value: number}
        console.log("DecCgnd: " + JSON.stringify(data));
        this.m_model.updateDecisions(data.role, data.dec, data.value);// r, d, v
    }
    public onDecSub = (data) => { // data: {value: number, role: string } 
        this.m_model.updateDecisions(data, "Sub");
        this.m_serverSocket.emit('updateDecisions' + this.m_worldID, this.m_model.getDecisions());
    }
    public onDecRes = (data) => {
        this.m_model.updateDecisions(data, "Res");
        this.m_serverSocket.emit('updateDecisions' + this.m_worldID, this.m_model.getDecisions());
    }  
}
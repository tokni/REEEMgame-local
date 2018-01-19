import ModelDev from "../ServerModel/ModelDev";

export class RoleChangeController {
    private m_serverSocket;
    private m_worldID;
    private m_model: ModelDev;

    constructor(p_serverSocket, p_worldID, p_model) {
        this.m_serverSocket = p_serverSocket;
        this.m_worldID = p_worldID;
        this.m_model = p_model;
        this.m_serverSocket.sockets.on('connection', (clientSocket) => {
            clientSocket.on('roleChangeFromClient' + this.m_worldID, this.onRoleChange);
        });
    }
    private onRoleChange = (p_data) => {
        console.log("Received RoleChange: " + JSON.stringify(p_data));
        this.m_model.changeRoleOfProfile(p_data.newRole, p_data.profile);
    }
}
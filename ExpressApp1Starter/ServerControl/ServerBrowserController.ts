class ServerBrowserController {
    private m_serverSocket;
    private m_browserModel;
    private m_browserView;

    constructor(p_serverSocket) {
        this.m_serverSocket = p_serverSocket;
        this.m_serverSocket.sockets.on('connection', (clientSocket) => {
            clientSocket.on('getPathway', this.onGetPathway);
        });
    }
    private onGetPathway(p_data) {
        this.m_browserView.emitPathwayToClient(this.m_browserModel.getPathway(p_data.pathway));
    }
}
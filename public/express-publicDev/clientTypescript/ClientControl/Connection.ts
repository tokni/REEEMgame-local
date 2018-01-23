import { ClientGameStatus } from "../clientModel/GameStatus"
//declare var ClientGameStatus: any;
declare var io: any;
export class Connection {
    private m_worldID;
    private m_path;
    private m_connectionToServer;
    private m_connectionReady: boolean = false;
    private m_connectionReadyData;

    constructor(p_worldID, p_path) {
        this.m_worldID = p_worldID;
        this.m_path = p_path;
        var q = "wid=" + this.m_worldID;
        this.m_connectionToServer = io({ path: p_path + "/socket.io", query: q });
        this.m_connectionToServer.on('connect', this.onConnection);
        this.m_connectionToServer.on('disconnect', this.onDisconnect);
        this.m_connectionToServer.on('connectionReady' + this.m_worldID, this.onConnectionReady);
        
    }                                   
    private onConnection = () => {
        
    }
    public getPath() {
        return this.m_path;
    }
    public getWorldID() {
        return this.m_worldID;
    }
    private onDisconnect = () => {
        this.m_connectionReady = false;
    }
    private onConnectionReady = (p_data) => {
        this.m_connectionReadyData = p_data;
        this.m_connectionReady = true;
    }
    public isConnectionReady(): boolean {
        return this.m_connectionReady;
    }
    public sendDecisionToServer(p_decision) {
        this.m_connectionToServer.emit("decisionChangeFromClient" + this.m_worldID, p_decision);
    }
    public sendTimeToServer(p_time) {
        var newTime = {status: -1, speed: 0};
        if (p_time == 0) {
            newTime.status = ClientGameStatus.paused;
            newTime.speed = p_time;
        }
        else if (p_time == -1) {
            newTime.status = ClientGameStatus.oneTick;
        }
        else if (p_time == -10) {
            newTime.status = ClientGameStatus.reset;
        }
        else {
            newTime.status = ClientGameStatus.running;
            newTime.speed = p_time;
        }
        this.m_connectionToServer.emit("timeChangeFromClient" + this.m_worldID, newTime);
    }
    public sendInitToServer(p_initData) {
        this.m_connectionToServer.emit("initFromClient" + this.m_worldID, p_initData);
    }
    public sendRoleChangeToServer(p_roleChange) {
        this.m_connectionToServer.emit("roleChangeFromClient" + this.m_worldID, p_roleChange); 
    }
    public listenToTickEvent(p_callBack) {
        this.m_connectionToServer.on('tickFromServer' + this.m_worldID, p_callBack );
    }
    public sendTickReceivedToServer(p_time) {
        this.m_connectionToServer.emit("tickReceivedFromClient" + this.m_worldID, p_time);
    }
    public listenToProfileEvent(p_callBack) {
        this.m_connectionToServer.on('updateProfileFromServer' + this.m_worldID, p_callBack);
    }
    public listenToConnectionReadyEvent(p_callBack) {
        this.m_connectionToServer.on('connectionReady' + this.m_worldID, p_callBack);
    }
    public listenToTimeEvent(p_callBack) {
        this.m_connectionToServer.on('timeChangeFromServer' + this.m_worldID, p_callBack);
    }
    public getConnectionReadyData() {
        return this.m_connectionReadyData;
    }
    public listenToParticipantEnterEvent(p_callBack) {
        this.m_connectionToServer.on('participantEnteredFromServer' + this.m_worldID, p_callBack);
    }
    public listenToParticipantLeftEvent(p_callBack) {
        this.m_connectionToServer.on('participantLeftFromServer' + this.m_worldID, p_callBack);
    }
    public listenToParticipantLeftGameEvent(p_callBack) {
        this.m_connectionToServer.on('participantLeftGameFromServer' + this.m_worldID, p_callBack);
    }
    public listenToFinishEvent(p_callback) {
        this.m_connectionToServer.on('simulationFinishedFromServer' + this.m_worldID, p_callback);
    }
    public listenToProfileChangeEvent(p_callBack) {
        this.m_connectionToServer.on('profileChangeFromServer' + this.m_worldID, p_callBack);
    }
    public listenToScenarioEvent(p_callback) {
        this.m_connectionToServer.on('scenarioChangeFromServer' + this.m_worldID, p_callback);
    }
    public listenToPathwayChangeEvent(p_callback) {
        this.m_connectionToServer.on('pathwayChangeFromServer', p_callback);
    }
    public listenToVariableChangeEvent(p_callback) {
        this.m_connectionToServer.on('variableChangeFromServer', p_callback);
    }
    public sendClickOnFeature(p_featureData) {
        this.m_connectionToServer.emit("clickOnFeature" + this.m_worldID, p_featureData);
    }
    public listenToClickOnFeatureEvent(p_callback) {
        this.m_connectionToServer.on('clickOnFeatureFromServer', p_callback);
    }

}
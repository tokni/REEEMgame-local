
declare var io: any;
import { ClientGameStatus } from "../clientModel/GameStatus"

export class MainScreenConnection {
    private m_connectionToServer;

    private m_connectionReadyData: Map<number, any> = new Map<number, any>();
    private m_connectionReady: Map<number, boolean> = new Map<number, boolean>();

    constructor(p_path: string, p_worldIDs: string[]) {
        this.m_connectionToServer = io({ path: p_path, query: "wid=main" });
        for (var i = 0; i < p_worldIDs.length; i++) {
            var id = p_worldIDs[i];
            this.m_connectionToServer.on('connect'+id, this.onConnection);
            this.m_connectionToServer.on('disconnect' + id, this.onDisconnect);
            this.m_connectionToServer.on('connectionReady' + id, this.onConnectionReady);
        }
    }
    private onConnection = () => {

    }
    private onDisconnect = () => {
    }
    private onConnectionReady = (p_data) => {
        this.m_connectionReadyData.set(p_data.worldID, p_data);
        this.m_connectionReady.set(p_data.worldID, true);
    }
    public isConnectionReady(p_worldID: number): boolean {
        return this.m_connectionReady.get(p_worldID);
    }

    public sendTimeToServer(p_time:number, p_worldID: number) {
        var newTime = { status: -1, speed: 0 };
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
        this.m_connectionToServer.emit("timeChangeFromClient" + p_worldID, newTime);
    }
    public listenToTickEvent(p_callBack, p_worldID: number) {
        this.m_connectionToServer.on('tickFromServer' + p_worldID, p_callBack);
    }
    public sendTickReceivedToServer(p_time) {
        this.m_connectionToServer.emit("tickReceivedFromClient" + p_time.w, p_time);
    }

    public listenToConnectionReadyEvent(p_callBack, p_worldID: number) {
        this.m_connectionToServer.on('connectionReady' + p_worldID, p_callBack);
    }
    public listenToTimeEvent(p_callBack, p_worldID: number) {
        this.m_connectionToServer.on('timeChangeFromServer' + p_worldID, p_callBack);
    }
    public getConnectionReadyData(p_worldID: number) {
        return this.m_connectionReadyData.get(p_worldID);
    }
    public listenToFinishEvent(p_callback, p_worldID: number) {
        this.m_connectionToServer.on('simulationFinishedFromServer' + p_worldID, p_callback);
    }
    public listenToHighscoreEvent(p_callback, p_worldID: number) {
        this.m_connectionToServer.on('highscoreFromServer' + p_worldID, p_callback);
    }
    public sendScenarioChangeToServer(p_worldID: number, p_scenarioID: string) {
        this.m_connectionToServer.emit("scenarioChangeFromClient" + p_worldID, p_scenarioID);
    }
    public listenToScenarioEvent(p_callback, p_worldID: number) {
        this.m_connectionToServer.on('scenarioChangeFromServer' + p_worldID, p_callback);
    }
    public listenToLastActiveEvent(p_callback, p_worldID: number) {
        this.m_connectionToServer.on('lastActiveChangedFromServer' + p_worldID, p_callback);
    }
}
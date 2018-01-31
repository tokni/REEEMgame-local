declare var io: any;
declare var $: any;
import { ClientGameStatus } from "../clientModel/GameStatus"
import { MainScreenConnection } from "./MainScreenConnection"

export class ListOfWorldsUpdater {
    private m_socket;
    private m_monthNames: String[] = ["June", "July", "August", "September", "October", "November", "December", "January", "February", "March", "April", "May"];
    private m_worldIds: number[];
    private m_startYear: number;;
    private m_connection: MainScreenConnection;
    public constructor(p_connection, p_worlds: { name: string, idcode: string, status: number, time: number, score: number, highscore: number }[]) {
        this.m_connection = p_connection;
        for (var w of p_worlds) {
            if (this.m_connection.isConnectionReady(parseInt(w.idcode))) {
                this.onConnectionReady(this.m_connection.getConnectionReadyData(parseInt(w.idcode)));
            }
            else {
                this.m_connection.listenToConnectionReadyEvent(this.onConnectionReady, parseInt(w.idcode));
            }
        }
    }
    private onConnectionReady = (p_data: { scenario: { roles: any[], duration: number, start: number, time: number, status: ClientGameStatus, score: { c: number, s: number, v: number, o: number }, highscore: number }, history: any, prevSimulations: any[], worldID: number }) => {
        this.m_startYear = p_data.scenario.start;
        this.m_connection.listenToTickEvent(this.tick, p_data.worldID);
        this.m_connection.listenToFinishEvent(this.onFinish, p_data.worldID);
        this.m_connection.listenToHighscoreEvent(this.handleHighScore, p_data.worldID);
        this.m_connection.listenToTimeEvent(this.onTimeChangedFromServer, p_data.worldID);
        this.m_connection.listenToLastActiveEvent(this.onLastActiveChanged, p_data.worldID);
    }
    private onLastActiveChanged = (p_data: { worldID: number, date: Date }) => {
        var lastActive = new Date(p_data.date);
        var lastActiveString = lastActive.getDate() + "/" + (lastActive.getMonth() + 1) + "/" + lastActive.getFullYear();
        $('#lastActive' + p_data.worldID).html(lastActiveString);
    }
    private onTimeChangedFromServer = (p_data: { status: ClientGameStatus, worldID: number, data: any }) => {
        switch (p_data.status) {
            case ClientGameStatus.paused:
                this.updateStatus(p_data.worldID, ClientGameStatus.paused);
                break;
            case ClientGameStatus.running:
                this.updateStatus(p_data.worldID, ClientGameStatus.running);
                break;
            case ClientGameStatus.finished:
                this.onFinish({ worldID: p_data.worldID });
                break;
            case ClientGameStatus.reset:
                this.updateStatus(p_data.worldID, ClientGameStatus.paused);
                this.updateTime(p_data.worldID, p_data.data.t);
                this.updateScore(p_data.worldID, p_data.data.s.c);
                break;
        }
        this.registerUpdates();
    }
    private onFinish = (p_data: { worldID: number }) => {
        this.updateStatus(p_data.worldID, ClientGameStatus.finished);
        this.registerUpdates();
    }
    private handleHighScore = (data: { worldID: number, score: number }): void => {
        this.updateHighScore(data.worldID, data.score);
        this.registerUpdates();
    }
    private tick = (data) => {
        this.updateTime(data.w, data.t);
        this.updateScore(data.w, data.s.c);
        this.registerUpdates();
    }
    public updateTime(p_id, p_time) {
        var year = this.m_startYear + Math.floor(p_time / 12);
        var month = Math.floor((p_time % 12));
        var monthName = this.m_monthNames[month];
        $('#month' + p_id).html(monthName);
        $('#year' + p_id).html(year);
    }
    public updateScore(p_id, p_score): void {
        $("#score" + p_id).text(Math.round(p_score));
    }
    public updateStatus(p_id, p_status): void {
        var status: String;
        switch (p_status) {
            case ClientGameStatus.running:
                status = "Running";
                break;
            case ClientGameStatus.finished:
                status = "Finished";
                break;
            default:
                status = "Paused";
                break;
        }
        $("#status" + p_id).text(status);
    }
    public updateHighScore(p_id, p_score): void {
        $("#highscore" + p_id).text(Math.round(p_score));
    }
    private registerUpdates() {
        $("#worldsTable").trigger("update");
        $("#worldsTable").trigger("appendCache");
    }
}
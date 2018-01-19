declare var io: any;
declare var $: any;
import { ClientGameStatus } from "../clientModel/GameStatus"
import { MainScreenConnection } from "./MainScreenConnection"

export class ListOfWorldsUpdater {
    private m_socket;
    private m_monthNames: String[] = ["June", "July", "August", "September", "October", "November", "December", "January", "February", "March", "April", "May"];
    private m_worldIds: number[];
    private m_startYear: number = 2017;
    private m_connection: MainScreenConnection;
    public constructor(p_connection, p_worlds: { name: string, idcode: string, status: number, time: number, score: number, highscore: number }[]) {
        this.m_connection = p_connection;
        console.log("creating facilitatorMainScreenController");
        for (var w of p_worlds) {
            if (this.m_connection.isConnectionReady(parseInt(w.idcode))) {
                console.log("Connection is ready");
                this.onConnectionReady(this.m_connection.getConnectionReadyData(parseInt(w.idcode)));
            }
            else {
                console.log("listening to connection ready event");
                this.m_connection.listenToConnectionReadyEvent(this.onConnectionReady, parseInt(w.idcode));
            }
        }
    }
    private onConnectionReady = (p_data: { scenario: { roles: any[], duration: number, time: number, status: ClientGameStatus, score: { c: number, s: number, v: number, o: number }, highscore: number }, history: any, prevSimulations: any[], worldID: number }) => {
        this.m_connection.listenToTickEvent(this.tick, p_data.worldID);
        this.m_connection.listenToFinishEvent(this.onFinish, p_data.worldID);
        this.m_connection.listenToHighscoreEvent(this.handleHighScore, p_data.worldID);
        this.m_connection.listenToTimeEvent(this.onTimeChangedFromServer, p_data.worldID);
        this.m_connection.listenToLastActiveEvent(this.onLastActiveChanged, p_data.worldID);
        //this.updateTime(p_data.worldID, p_data.scenario.time);
        //this.updateStatus(p_data.worldID, p_data.scenario.status);
        //this.updateScore(p_data.worldID, p_data.scenario.score.com);
        //this.updateHighScore(p_data.worldID, p_data.scenario.highscore);
        //this.registerUpdates();
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
        console.log("tick-time: " + data.t + "  tick-WID: " + data.w);
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
        console.log("up score" + p_score);
        $("#score" + p_id).text(Math.round(p_score));
    }
    public updateStatus(p_id, p_status): void {
        var status: String;
        switch (p_status) {
            case ClientGameStatus.running:
                status = "Running";
                break;
            case ClientGameStatus.finished:
                status= "Finished";
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
       // $("#worldsTable").trigger('destroyPager');
        $("#worldsTable").trigger("update");
        $("#worldsTable").trigger("appendCache");
        //$("#worldsTable").tablesorterPager({container: $("#pager") });

        
    }
}
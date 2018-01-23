declare var io: any;
declare var $: any;
import { ClientGameStatus } from "../clientModel/GameStatus"

export class MainFacilitatorScreenUpdater {
    private m_socket;
    private m_monthNames: String[] = ["June", "July", "August", "September", "October", "November", "December", "January", "February", "March", "April", "May"];
    private m_worldIds: number[];
    private m_startYear: number = 2017;
    private m_startMonth: number = 6;
    public constructor(p_socket, p_startYear?, p_startMonth?) {
        console.log("C MainFacilitatorScreenUpdater");
        this.m_socket = p_socket;
        this.m_socket.on('highScore', this.handleHighScore);
        this.m_startYear = p_startYear;
        this.m_startMonth = p_startMonth;
    }

    public addWorld = (id: number) => {
        this.m_socket.on('tick' + id, this.tick);
        console.log("Catching: " + "coordinatorMainInit" + id);
        this.m_socket.on("coordinatorMainInit" + id, this.handleFacilitatorMainInit);
        this.m_socket.emit("connectData" + id, { origin: "FacilitatorMainScreenHandler", id: this.m_socket.id });
    }
    private handleHighScore =(data: { id: string, score: number }):void => {
        this.updateHighScore(data.id, data.score);
    }
    handleFacilitatorMainInit = (data) => { //data.worldID data.time data.status data.score
        this.updateTime(data.worldID, data.time);
        this.updateButtons(data.worldID, data.status);
        this.updateScore(data.worldID, data.score);
        this.updateStatus(data.worldID, data.status);
        this.updateHighScore(data.worldID, data.highscore)
    }
    private tick = (data) => {
        console.log("tick-time: " + data.time + "  tick-WID: " + data.id);
        this.updateTime(data.id, data.time);
        this.updateScore(data.id, data.score);
    }
    private mainInit = (data) => {  // data.time data.id
        console.log("Init-time: " + data.time + "  tick-WID: " + data.id);
        this.updateTime(data.time, data.id);
    }
    public updateTime(p_id, p_time) {
        var year = this.m_startYear + Math.floor(p_time + this.m_startMonth-1 / 12);
        var month = Math.floor((p_time % 12));
        var monthName = this.m_monthNames[month];
        $('#month' + p_id).html(monthName);
        $('#year' + p_id).html(year);
    }

    public updateButtons(p_id, p_status) {
        if (p_status == ClientGameStatus.paused ) {
            $("#startButton" + p_id).show();
            $("#stopButton" + p_id).hide();
            $("#fast" + p_id).hide();
            $("#fullspeed" + p_id).show();
        } else if (p_status == ClientGameStatus.finished) {
            $("#startButton" + p_id).hide();
            $("#stopButton" + p_id).hide();
            $("#fast" + p_id).hide();
            $("#fullspeed" + p_id).hide();
        }
        else {
            $("#startButton" + p_id).hide();
            $("#stopButton" + p_id).show();
            $("#fast" + p_id).show();
            $("#fullspeed" + p_id).show();
        }
        $("#reset" + p_id).show();
        //Update text on fast forward button
        switch (p_status) {
        }
    }
    public updateScore(p_id, p_score):void {
        console.log("up score" + p_score);
        $("#score" + p_id).text("Score: "+Math.round(p_score));
    }
    public updateStatus(p_id, p_status): void {
        var status:String;
        switch (p_status) {
        }
        $("#status" + p_id).text(status);
    }
    public updateHighScore(p_id, p_score): void {
        $("#highscore" + p_id).text("Highscore: " + Math.round(p_score));
    }
}
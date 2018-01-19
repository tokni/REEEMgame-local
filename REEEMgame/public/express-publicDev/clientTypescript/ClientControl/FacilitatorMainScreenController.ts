import { TimeController } from "./TimeController"
import { FacilitatorMainScreenView } from "../ClientView/FacilitatorMainScreenView"
import { MainScreenConnection } from "./MainScreenConnection"
import { ClientGameStatus } from "../clientModel/GameStatus"

declare var $: any;

export enum Speed { x0, x1, x2, x4, x8, x16 }
export class FacilitatorMainScreenController {

    private m_timeController: TimeController;
    private m_worldIDs: number[];
    private m_path: string;
    private m_view: FacilitatorMainScreenView;
    private m_connection: MainScreenConnection;
    private m_currentSpeeds: Map<number, Speed> = new Map<number, Speed>();
    private m_scenarios: { id: string, name: string }[];
    constructor(p_connection, p_worlds: { name: string, idcode: string, status: number, time: number, score: number, highscore: number, speed: Speed }[], p_path: string, p_scenarios: {id: string, name:string}[]) {
        this.m_path = p_path;
        this.m_view = new FacilitatorMainScreenView(p_scenarios);
        this.m_connection = p_connection;
        this.m_worldIDs = [];
        this.m_scenarios = p_scenarios;
        console.log("creating facilitatorMainScreenController");
        for (var i = 0; i < p_worlds.length; i++) {
            var w = p_worlds[i];
            this.m_worldIDs.push(parseInt( w.idcode));
            if (this.m_connection.isConnectionReady(parseInt(w.idcode))) {
                console.log("Connection is ready");
                this.onConnectionReady(this.m_connection.getConnectionReadyData(parseInt(w.idcode)));
            }
            else {
                console.log("listening to connection ready event");
                this.m_connection.listenToConnectionReadyEvent(this.onConnectionReady, parseInt(w.idcode));
            }
        }
        this.addHandlersToControls();
    }

    protected onConnectionReady = (p_data: { scenario: { roles: any[], duration: number, time: number, status: ClientGameStatus, score: { c: number, s: number, v: number, o: number }, highscore: number}, history: any, prevSimulations: any[], worldID: number, speed: Speed }) => {
        this.m_connection.listenToTickEvent(this.onTick, p_data.worldID);
        this.m_connection.listenToFinishEvent(this.onFinish, p_data.worldID);
        this.m_connection.listenToHighscoreEvent(this.onNewHighscore, p_data.worldID);
        this.m_connection.listenToTimeEvent(this.onTimeChangedFromServer, p_data.worldID);
        this.m_connection.listenToScenarioEvent(this.onScenarioChange, p_data.worldID);
        this.setSpeed(p_data.worldID, p_data.speed);
        this.m_view.updateTime(p_data.worldID, p_data.scenario.time);
        this.m_view.updateStatus(p_data.worldID, p_data.scenario.status);
        this.m_view.updateButtons(p_data.worldID, p_data.scenario.status);
        this.m_view.updateScore(p_data.worldID, p_data.scenario.score.c);
        this.m_view.updateHighscore(p_data.worldID, p_data.scenario.highscore);
    }
    addHandlersToControls() {
        for (var i = 0; i < this.m_worldIDs.length; i++) {
            var id = this.m_worldIDs[i];
            //time buttons
            for (var j = 0; j < this.m_scenarios.length; j++) {
                var s = this.m_scenarios[j];
                $("#" + s.id + id).on('click', { id: id, scenario: s.id }, this.scenarioBtnPress);
            }
            $("#startButton" + id).on('click', { id: id },this.startButtonPress);
            $("#stopButton" + id).on('click', { id: id },this.stopButtonPress);
            $("#fastButton"+id).on('click', {id: id }, this.fastButtonPress);
            $("#fullspeed"+id).on('click', { speed: 24, id:id }, this.speedButtonPress);
            $("#reset" + id).on('click', { id: id }, this.resetButtonPress);
            //Copy link button
            $("#copyLink" +id).on('click', { worldID: id, link:(location.host + this.m_path+ 'enterWorld?worldPassword='+id) }, this.copyLink);

        }
    }
    private onScenarioChange = (p_data: { worldID: number, scenarioID: string  }) => {
        this.m_view.updateScenarioButton(p_data.scenarioID, p_data.worldID);
    }
    private scenarioBtnPress = (evt: { data: { id: number, scenario: string } }) =>{
        this.m_connection.sendScenarioChangeToServer(evt.data.id, evt.data.scenario);
    }
    private onTimeChangedFromServer = (p_data: { status: ClientGameStatus, worldID: number,data: any })=> {
        switch (p_data.status) {
            case ClientGameStatus.paused:
                this.stop(p_data.worldID);
                break;
            case ClientGameStatus.running:
                this.start(p_data.worldID);
                break;
            case ClientGameStatus.finished:
                this.onFinish({ worldID: p_data.worldID });
                break;
            case ClientGameStatus.reset:
                this.reset(p_data);
                break;
        }
    }
    protected reset(p_data: { worldID: number, data: {
        t: number,
        s: { c: number, s: number, v: number, o: number }, i: { },
        o: { e: number, h: number, a: number, g: number }[], d: { }
    } }) {
        this.m_view.updateTime(p_data.worldID, p_data.data.t);
        this.m_view.updateScore(p_data.worldID, p_data.data.s.c);
        this.stop(p_data.worldID);
    }
    private onNewHighscore=(p_data: { worldID: number, score: number })=> {
        this.m_view.updateHighscore(p_data.worldID, p_data.score);
    }
    private onFinish = (p_data: { worldID: number }) => {
        this.m_view.updateButtons(p_data.worldID, ClientGameStatus.finished);
        this.m_view.updateStatus(p_data.worldID,ClientGameStatus.finished);
    }
    private stop(p_worldID:number) {
        this.m_currentSpeeds.set(p_worldID, Speed.x0);
        this.m_view.updateButtons(p_worldID, ClientGameStatus.paused);
        this.m_view.updateStatus(p_worldID, ClientGameStatus.paused);
        this.m_view.updateSpeedButton(Speed.x0, p_worldID);
    }
    private start(p_worldID: number) {
        this.m_view.updateButtons(p_worldID, ClientGameStatus.running);
        this.m_view.updateStatus(p_worldID, ClientGameStatus.running);
    }
    private onTick = (p_data: {
        w: string, t: number, s: { c: number, s: number, v: number, o: number }, i: {},
        o: { e: number, h: number, a: number, g: number }[], d:
        { role: string, type: string, value: number }[], dt: number
    }) => {
        console.log("Tick Rec: " );
        this.m_view.updateTime(p_data.w, p_data.t);
        this.m_view.updateScore(p_data.w, p_data.s.c);
        if (p_data.w == '35598' || p_data.w == '95112' || p_data.w == '65640')
            this.m_connection.sendTickReceivedToServer(p_data.dt);
        //this.m_connection.sendTickReceivedToServer({ t: p_data.t, w: p_data.w });

    }
    private setSpeed(p_worldID: number, p_speed: number) {
        var newSpeed: Speed;
        switch (p_speed) {
            case 0:
                newSpeed=  Speed.x0;
                break;
            case 1:
                newSpeed = Speed.x1;
                break;
            case 2:
                newSpeed = Speed.x2;
                break;
            case 4:
                newSpeed = Speed.x4;
                break;
            case 8:
                newSpeed = Speed.x8;
                break;
            case 16:
                newSpeed = Speed.x16;
                break;
        }
        this.m_currentSpeeds.set(p_worldID, newSpeed);
        this.m_view.updateSpeedButton(newSpeed, p_worldID);
    }
    private fastButtonPress = (p_data: { data: { id: number } })=> {
        var newSpeed: Speed;
        var speedNumber;
        var t = this.m_currentSpeeds.get(p_data.data.id);
        switch (this.m_currentSpeeds.get(p_data.data.id)) {
            case Speed.x0://If game is paused, the speed button should jumpt to x2
                newSpeed = Speed.x2;
                speedNumber = 2;
                break;
            case Speed.x1:
                newSpeed = Speed.x2;
                speedNumber = 2;
                break;
            case Speed.x2:
                newSpeed = Speed.x4;
                speedNumber = 4;
                break;
            case Speed.x4:
                newSpeed = Speed.x8;
                speedNumber =8;
                break;
            case Speed.x8:
                newSpeed = Speed.x16;
                speedNumber = 16;
                break;
            case Speed.x16:
                newSpeed = Speed.x1;
                speedNumber = 1;
                break;
        }
        this.m_currentSpeeds.set(p_data.data.id, newSpeed);
        this.start(p_data.data.id);
        this.m_view.updateSpeedButton(newSpeed, p_data.data.id);
        this.m_connection.sendTimeToServer(speedNumber, p_data.data.id);
    }
    private resetButtonPress = (p_event: { data: { id: number }}) => {
        console.log("ResetButtonPress");
        this.stop(p_event.data.id);
        this.m_connection.sendTimeToServer(-10, p_event.data.id);
    }
    private startButtonPress = (p_event: { data: { id: number } }) => {
        console.log("StartButtonPress");
        this.start(p_event.data.id);
        this.m_connection.sendTimeToServer(1, p_event.data.id);
    }
    private stopButtonPress = (p_event: { data: { id: number } }) => {
        console.log("StopButtonPress");
        this.stop(p_event.data.id);
        this.m_connection.sendTimeToServer(0, p_event.data.id);
    }
    private speedButtonPress = (p_event: { data: { id: number, speed:number } }) => {
        console.log("SpeedButtonPress");
        this.start(p_event.data.id);
        this.m_connection.sendTimeToServer(p_event.data.speed, p_event.data.id);
    }
    private copyLink = (event): void => {
        var link: string = event.data.link;
        console.log("copy " + link);
        //Create temporary input for link
        var $temp = $("<input>");
        $("body").append($temp);
        $temp.val(link).select();
        document.execCommand("copy");
        $temp.remove(); //remove temp input again
    }
}
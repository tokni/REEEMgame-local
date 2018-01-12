import { ClientGameStatus } from "../clientModel/GameStatus"
import { Speed } from "../ClientControl/FacilitatorMainScreenController"
declare var $: any;

export class FacilitatorMainScreenView{
    private m_monthNames: String[] = ["June", "July", "August", "September", "October", "November", "December", "January", "February", "March", "April", "May"];
    private m_startYear = 2017;
    private m_scenarios: { id: string, name: string }[];h = 6;
    private m_startMonth = 6;
    constructor(p_scenarios: { id: string, name: string }[]) {
        console.log("C FacilitatorMainScreenView");
        this.m_scenarios = p_scenarios;

    }
    public updateButtons(p_worldID: number, p_status: ClientGameStatus) {
        switch (p_status) {
            case ClientGameStatus.paused: {
                $('#startButton'+p_worldID).show();
                $('#stopButton' + p_worldID).hide();
                $("#fullspeed" + p_worldID).show();
                $("#fastButton" + p_worldID).show();
            }; break;
            case ClientGameStatus.running: {
                $('#stopButton' + p_worldID).show();
                $('#startButton' + p_worldID).hide();
            }; break;
            case ClientGameStatus.finished: {
                $('#startButton' + p_worldID).hide();
                $("#stopButton" + p_worldID).hide();
                $("#fullspeed" + p_worldID).hide();
                $("#fastButton" + p_worldID).hide();
            }; break;
            case ClientGameStatus.oneTick: { }; break;
        }
    }
    public updateSpeedButton(p_currentSpeed: Speed, p_worldID: number) {
        var speed: string;
        switch (p_currentSpeed) {
            case Speed.x0://If game is paused, the speed button should jumpt to x2
                speed = "x2";
                break;
            case Speed.x1:
                speed = "x2";
                break;
            case Speed.x2:
                speed = "x4";
                break;
            case Speed.x4:
                speed = "x8";
                break;
            case Speed.x8:
                speed = "x16";
                break;
            case Speed.x16:
                speed = "x1";
                break;
        }
        $("#fastButton" + p_worldID).text(speed);
    }
    public updateTime(p_id, p_time) {
        var year = this.m_startYear + Math.floor((p_time + this.m_startMonth - 1) / 12);
        var month = Math.floor((p_time % 12));
        var monthName = this.m_monthNames[month];
        $('#month' + p_id).html(monthName);
        $('#year' + p_id).html(year);
    }
    public updateScore(p_id, p_score): void {
        $("#score" + p_id).text(Math.round(p_score));
    }
    public updateHighscore(p_id, p_score): void {
        $("#highscore" + p_id).text( Math.round(p_score));
    }
    public updateScenarioButton(p_scenarioID: string, p_worldID: number) {
        for (var s of this.m_scenarios) {
            if (s.id != p_scenarioID) {
                $("#" + s.id + p_worldID).show();
            } else {
                $("#" + s.id + p_worldID).hide();
                $("#scenario" + p_worldID).text(s.name);
            }
        }
    }
    public updateStatus(p_id, p_status: ClientGameStatus) {
        var status: string;
        if (p_status == ClientGameStatus.running) {
            status = "Running";
        } else if (p_status == ClientGameStatus.finished) {
            status = "Finished"
        } else {
            status = "Paused";
        }
        $("#status" + p_id).text(status);
    }
}
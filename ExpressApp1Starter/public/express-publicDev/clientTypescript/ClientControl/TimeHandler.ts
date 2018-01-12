declare var io: any;
declare var $: any;
//enum GameStatus { paused, x1, x2, x4, x8, x16, finished, fullspeed };
import { MainFacilitatorScreenUpdater } from "../ClientView/MainFacilitatorScreenUpdater"
import { ClientGameStatus } from "../clientModel/GameStatus"

export class TimeHandler {
    private m_socket;
    private m_facilitatorMainScreenUpdater: MainFacilitatorScreenUpdater;
    private m_worldID;
    private m_status: ClientGameStatus;
    public constructor(p_worldID: number, p_status: ClientGameStatus, p_socket, p_facilitatorMainScreenUpdater: MainFacilitatorScreenUpdater) {
        console.log("TimeHandler for "+p_worldID + " created");
        this.m_worldID = p_worldID;
        this.m_facilitatorMainScreenUpdater = p_facilitatorMainScreenUpdater;
        this.m_socket = p_socket;
        this.m_socket.on('end' + this.m_worldID, this.end);
        this.m_socket.on('restart' + this.m_worldID, this.restart);
        this.m_socket.on('start' + this.m_worldID, this.start);
        this.m_socket.on('stop' + this.m_worldID, this.stop);
    }
    public startTime = () => {
        console.log("emit start time from Timehandler");
        var data = 'startE';
        this.m_socket.emit('startTime' + this.m_worldID, data);
    }
    public stopTime = () => {
        this.updateStatus(ClientGameStatus.paused);
        console.log("emit stop time");
        var data = 'stopE';
        this.m_socket.emit('stopTime' + this.m_worldID, data);
    }
    public resetTime = () => {
        this.updateStatus(ClientGameStatus.paused);
        console.log("emit reset");
        this.m_socket.emit('reset' + this.m_worldID);
    }
    public fastForward = () => {
        
    }
    public fullspeed = ():void => {
        this.m_socket.emit('fullspeed' + this.m_worldID);
    }
    public x1 = () => {
        this.m_socket.emit('x1' + this.m_worldID);
    }
    public x2 = () => {
        this.m_socket.emit('x2' + this.m_worldID);
    }
    public x4 = () => {
        this.m_socket.emit('x4' + this.m_worldID);
    }
    public x8 = () => {
        this.m_socket.emit('x8' + this.m_worldID);
    }
    public x16 = () => {
        this.m_socket.emit('x16' + this.m_worldID);
    }
    public start = () => {
    }
    public stop = () => {
        this.updateStatus(ClientGameStatus.paused);
    }
    public end = () => {
        console.log("end");
        this.updateStatus(ClientGameStatus.finished);
    }
    public restart = (data) => {
        console.log("restart");
        this.updateStatus(ClientGameStatus.paused);
        this.m_facilitatorMainScreenUpdater.updateTime(data.id, data.time);
        this.m_facilitatorMainScreenUpdater.updateScore(data.id, data.comb);
    }
    private updateStatus(p_status) {
        this.m_status = p_status;
        this.m_facilitatorMainScreenUpdater.updateStatus(this.m_worldID, p_status);
        this.m_facilitatorMainScreenUpdater.updateButtons(this.m_worldID, p_status);
    }
}
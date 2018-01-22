import { Scenario } from '../ServerModel/Scenario'
import { GameView } from '../ServerView/GameView'
import ModelDev from "../ServerModel/ModelDev";
import DataBaseHandler from '../ServerControl/DataBaseHandler';
var io = require('socket.io');

export enum GameStatus { paused, running, finished, oneTick, reset };
export enum Speed { x0, x1, x2, x4, x8, x16}
export default class ServerTimeController {
    private m_serverSocket;
    private m_delayPerTick;
    private m_model: ModelDev;
    private m_worldID;
    private m_currentSpeed: Speed = Speed.x0;
    private m_dataBaseHandler: DataBaseHandler;
    private m_lastTickTime: number = 0;
    private m_simulationSpeed: number;
    private m_tickTimeOut;

    constructor(p_serverSocket, p_worldID, p_model,p_dataBaseHandler) {
        this.m_model = p_model;
        this.m_serverSocket = p_serverSocket;
        this.m_worldID = p_worldID;
        this.m_dataBaseHandler = p_dataBaseHandler;
        this.m_delayPerTick = this.m_model.getScenario().getDefaultDelay();
        this.m_serverSocket.sockets.on('connection', (clientSocket) => {
            if (clientSocket.handshake.query["wid"] == this.m_worldID || clientSocket.handshake.query["wid"] == "main") {
                console.log("Listening to: " + 'timeChange ' + this.m_worldID + " owner: " + this.m_serverSocket.name);
                clientSocket.on('timeChangeFromClient' + this.m_worldID, this.onTimeChange);
            }
        });
    }
    public setSimulationSpeed(p_speed: number) {
        this.m_simulationSpeed = p_speed;
    }
    public getTimeDelay() {
        return this.m_delayPerTick;
    }
    private onTimeChange = (data) => { //paused, x1, x2, x4, x8, x16, finished, fullspeed, oneTick, reset
        setImmediate(() => { 
            data.worldID = this.m_worldID;
            switch (data.status) {
                case GameStatus.paused: { this.pause(data)}; break;
                case GameStatus.running: { this.run(data) }; break;
                case GameStatus.finished: { this.end(data)}; break;
                case GameStatus.oneTick: { this.oneTick(data) }; break;
                case GameStatus.reset: {
                    this.reset(data)};
                    break;
            }
            this.m_dataBaseHandler.updateLastActiveInDatabase();
        });
    }

    private run(data) {
        switch (data.speed) {
            case 1:
                this.m_currentSpeed = Speed.x1;
                break;
            case 2:
                this.m_currentSpeed = Speed.x2;
                break;
            case 4:
                this.m_currentSpeed = Speed.x4;
                break;
            case 8:
                this.m_currentSpeed = Speed.x8;
                break;
            case 16:
                this.m_currentSpeed = Speed.x16;
                break;
        }
        this.m_model.getView().setStatus(GameStatus.running);
        this.setSimulationSpeed(data.speed);
        this.tick();
        this.m_serverSocket.emit("timeChangeFromServer" + this.m_worldID, data);
    }
    private pause(data) {
        this.m_model.getView().setStatus(GameStatus.paused);
        this.m_serverSocket.emit("timeChangeFromServer" + this.m_worldID, data);
    }
    private end(data) {
        this.m_model.getView().setStatus(GameStatus.finished);
        this.m_serverSocket.emit("timeChangeFromServer" + this.m_worldID, data);
    }
    private oneTick(data) {
        console.log("one tick on server");
        this.executeOneTick();
        this.m_serverSocket.emit("timeChangeFromServer" + this.m_worldID, data);
    }
    public reset(data) {
        setImmediate(() => { 
            this.m_model.getView().setStatus(GameStatus.paused);
            this.m_model.resetTime();
            //Send data to client to update view
            data.data = this.m_model.getView().createTickData();
            data.data.d = this.m_model.getView().createDecisionData();
            this.m_model.tickWasSent();
            this.setSimulationSpeed(1);
            this.m_serverSocket.emit("timeChangeFromServer" + this.m_worldID, data);
        });
    }
    public tick = () => {
        if (this.m_tickTimeOut) {
            clearTimeout(this.m_tickTimeOut);
            this.executeTick();
        } else {
            this.executeTick();
        }
    }
    private finishGame = () => {
        this.m_model.getView().setStatus(GameStatus.finished);
        var highscore: number = this.m_model.end();
        var data;
        if (highscore) {
            var scoredata = { worldID: this.m_worldID, score: highscore };
            this.m_dataBaseHandler.updateHighScore(highscore);//Update the highscore in the database
            this.m_serverSocket.emit('highscoreFromServer' + this.m_worldID, scoredata);
        }
        data = { worldID: this.m_worldID };
        this.m_serverSocket.emit('simulationFinishedFromServer' + this.m_worldID, data);
    }
    private executeOneTick = () => {
        if (this.m_model.getTime() >= this.m_model.getDuration()) {
            this.finishGame();
        } else {
            this.m_model.tick();
            this.m_lastTickTime = Date.now();
        }
    }
    private executeTick = () => {
        var startTime = Date.now();
        //If we are ready for next tick
        if (startTime - this.m_lastTickTime > this.m_model.getScenario().getDefaultDelay() / this.m_simulationSpeed) {
            //If game is finished
            if (this.m_model.getTime() >= this.m_model.getDuration()) {
                this.finishGame();
            } else if (this.m_model.getView().getStatus() != GameStatus.paused) {
                this.m_model.tick();
                //Schedule next tick
                this.m_tickTimeOut = setTimeout(this.tick, this.m_model.getScenario().getDefaultDelay() / this.m_simulationSpeed);
                this.m_lastTickTime = Date.now();
            }
        } else {
            //Delay next tick
            this.m_tickTimeOut = setTimeout(this.tick, (this.m_model.getScenario().getDefaultDelay() / this.m_simulationSpeed - (startTime - this.m_lastTickTime)));
        }
    }
    public getCurrentSpeed(): Speed {
        return this.m_currentSpeed;
    }
}
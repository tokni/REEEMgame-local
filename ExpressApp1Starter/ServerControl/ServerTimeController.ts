import { Scenario } from '../ServerModel/Scenario'
import { GameView } from '../ServerView/GameView'
import ModelDev from "../ServerModel/ModelDev";
import DataBaseHandler from '../ServerControl/DataBaseHandler';
var io = require('socket.io');


const pgPool = require('pg-pool');//for managing connections to the postgres reeem database
var pgPoolConfig = {
    user: 'reeem_game',
    password: 'P3xaq5B3QXX88rjE',
    host: '130.226.55.43',
    port: '5432',
    database: 'reeem',
    ssl: false,
    idleTimeoutMillis: 500,
    min: 2,
    max: 50
}
//export var poolBo = new pgPool(pgPoolConfigForbo_laerke);
//var pool = new pgPool(pgPoolConfig);

class TimeData {

}
export enum GameStatus { paused, running, finished, oneTick, reset };
export enum Speed { x0, x1, x2, x4, x8, x16}
export default class ServerTimeController {
    private m_serverSocket;
    private m_setIntervalTimer;
    private m_delayPerTick;
    private m_model: ModelDev;
    private m_worldID;
    private m_currentSpeed: Speed = Speed.x0;
    private m_dataBaseHandler: DataBaseHandler;
    private m_lastTickTime: number = 0;
    private m_simulationSpeed: number;
    private m_tickTimeOut;
    //private m_tickRef;

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
            //console.log("TimeChange: " + JSON.stringify(data));
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
        //clearInterval(this.m_setIntervalTimer);
        //this.m_setIntervalTimer = setInterval(this.tick, this.m_delayPerTick / data.speed);
        this.setSimulationSpeed(data.speed);
        this.tick();
        this.m_serverSocket.emit("timeChangeFromServer" + this.m_worldID, data);
    }
    private pause(data) {
        this.m_model.getView().setStatus(GameStatus.paused);
        //clearInterval(this.m_setIntervalTimer);
        this.m_serverSocket.emit("timeChangeFromServer" + this.m_worldID, data);
    }
    private end(data) {
        this.m_model.getView().setStatus(GameStatus.finished);
        this.m_serverSocket.emit("timeChangeFromServer" + this.m_worldID, data);
    }
    private oneTick(data) {
        this.tick();
        this.m_serverSocket.emit("timeChangeFromServer" + this.m_worldID, data);
    }
    public reset(data) {
        setImmediate(() => { 
            this.m_model.getView().setStatus(GameStatus.paused);
            clearInterval(this.m_setIntervalTimer);
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
        // console.log("ModelDev Tick: " + this.m_time);
        if (this.m_tickTimeOut) {
            clearTimeout(this.m_tickTimeOut);
            this.executeTick();
        } else {
            this.executeTick();
        }

    }
    private executeTick = () => {

        var startTime = Date.now();
        if (startTime - this.m_lastTickTime > this.m_model.getScenario().getDefaultDelay() / this.m_simulationSpeed) {
            var d = Date.now();
            if (this.m_worldID == 35598 || this.m_worldID == 95112) {
                //setImmediate(() => { console.log("Lag: " + (Date.now() - d)) });
                //console.log("tick " + this.m_model.getTime() + " from serverTimeController " + this.m_worldID);
            }

            if (this.m_model.getTime() >= this.m_model.getDuration()) {
                this.m_model.getView().setStatus(GameStatus.finished);
                var highscore: number = this.m_model.end();
                var data;
                if (highscore) {
                    var scoredata = { worldID: this.m_worldID, score: highscore };
                    this.m_dataBaseHandler.updateHighScore(highscore);//Update the highscore in the database
                    this.m_serverSocket.emit('highscoreFromServer' + this.m_worldID, scoredata);
                }
                clearInterval(this.m_setIntervalTimer);
                data = { worldID: this.m_worldID };
                this.m_serverSocket.emit('simulationFinishedFromServer' + this.m_worldID, data);
            } else {
                if (this.m_model.getView().getStatus() != GameStatus.paused) {
                    this.m_model.tick();
                    var t = this.m_model.getScenario().getDefaultDelay() / this.m_simulationSpeed;
                    if (this.m_model.getView().getStatus() != GameStatus.paused) {
                        this.m_tickTimeOut = setTimeout(this.tick, this.m_model.getScenario().getDefaultDelay() / this.m_simulationSpeed);
                        this.m_lastTickTime = Date.now();
                    }
                }
            }
        } else {
            this.m_tickTimeOut = setTimeout(this.tick, (this.m_model.getScenario().getDefaultDelay() / this.m_simulationSpeed - (startTime - this.m_lastTickTime)));
        }
    }
    public getCurrentSpeed(): Speed {
        return this.m_currentSpeed;
    }
}
import ModelDev from '../ServerModel/ModelDev'
import DecisionController from './ServerDecisionController'
import TimeController, { GameStatus } from './ServerTimeController'
import Role from "../ServerModel/Role";
import { RoleChangeController } from './RoleChangeController'
import SimulationHistory from "../ServerModel/SimulationHistory";
import { ScenarioChangeController } from "./ScenarioChangeController";
import { Profile } from "../ServerModel/Profile";
import { Speed } from "./ServerTimeController"
import DataBaseHandler from '../ServerControl/DataBaseHandler'
import { overlayInit } from '../ServerModel/Overlay'
var csv = require("fast-csv");

export default class GameControllerDev {
    private m_serverSocket;
    private m_worldID: number;
    private m_decisonController: DecisionController;
    private m_timeController: TimeController;
    private m_scenarioChangeController: ScenarioChangeController;
    private m_roleChangeController;
    private m_filePath = "C:/Users/bl_000/Documents/reeemgame/ExpressApp1Starter/routes/Tiny4.csv";
    private m_filePathOnServer = "/home/ubuntu/ReeemGame/ReeemGameSprint7/routes/smallMatrixFakeData.csv";
    private m_currentPathway: string;
    private m_currentVariable: string;
    private m_model: ModelDev;
    private m_dataBaseHandler: DataBaseHandler;

    constructor(p_serverSocket, p_worldID, p_model, p_usersDB, p_worldsDB) {
        this.m_dataBaseHandler = new DataBaseHandler(p_serverSocket, p_worldID, p_usersDB, p_worldsDB);
        this.m_serverSocket = p_serverSocket;
        this.m_worldID = p_worldID;
        this.m_model = p_model;
        this.m_decisonController = new DecisionController(this.m_serverSocket, this.m_worldID, this.m_model, this.m_dataBaseHandler);
        this.m_timeController = new TimeController(this.m_serverSocket, this.m_worldID, this.m_model, this.m_dataBaseHandler);
        this.m_roleChangeController = new RoleChangeController(this.m_serverSocket, this.m_worldID, this.m_model);
        this.m_scenarioChangeController = new ScenarioChangeController(this.m_serverSocket, this.m_worldID, this.m_model, this.m_roleChangeController, this.m_timeController);
        this.m_serverSocket.sockets.on('connect', this.onConnectToClient);
    }
    private onConnectToClient = (clientSocket) => {
        clientSocket.on("disconnect", () => {
            if (this.m_worldID === clientSocket.worldID) {
                this.onDisconnect(clientSocket);
            }
        });
        clientSocket.on("initFromClient" + this.m_worldID, (data) => {
            console.log("init " + data.nickName + " clientSocketID: " + clientSocket.id);
            clientSocket.nickname = data.name;
            clientSocket.worldID = this.m_worldID;
            clientSocket.permissions = data.permissions;
            this.handleInit(data, clientSocket);
        });
        if (clientSocket.handshake.query["wid"] == this.m_worldID || clientSocket.handshake.query["wid"] == "main") {
            var initData;
            if (this.m_worldID) {
                if (clientSocket.handshake.query["wid"] != "main")
                    initData = this.createInitData();
                else {
                    initData = this.createMainInitData();
                }
            }
            console.log("emiting connection ready " + this.m_worldID);
            this.m_serverSocket.emit('connectionReady' + this.m_worldID, initData);
        }
        clientSocket.on("tickReceivedFromClient" + this.m_worldID, (data) => {
            if (data.t == this.m_model.getTime()) {
                this.m_model.tickWasSent();
            }
        });
    }
    private onDisconnect = (clientSocket) => {
        console.log("onDisconnect " + clientSocket.nickname);
        var participant: { nickName: string, pin: string, currentRole: string } = { nickName: clientSocket.nickname, pin: clientSocket.pin, currentRole: undefined };
        var profile: Profile = this.m_model.removeOnlineParticipant(participant.nickName);
        if (profile) {
            this.m_model.addOfflineParticipant(profile);
        }
        this.m_serverSocket.emit('participantLeftFromServer' + this.m_worldID, participant);
    }
    private createInitData() {
        //goto model and get the data
        //send scenario details
        var scenario: { roles: Role[], duration: number, time: number, status: GameStatus, score: { c: number, s: number, v: number, o: number } } = this.m_model.getClientScenario();
        var history: SimulationHistory = this.m_model.getHistory();
        var prevSimulations: SimulationHistory[] = this.m_model.getPrevSimulations();
        var speed: Speed = this.m_timeController.getCurrentSpeed();
        var indicatorData = overlayInit;
        return { initData: "data for Init", scenario: scenario, history: history, prevSimulations: prevSimulations, worldID: this.m_worldID, speed: speed, indicatorData: indicatorData };
    }
    private createMainInitData() {
        var scenario: { roles: Role[], duration: number, time: number, status: GameStatus, score: { c: number, s: number, v: number, o: number } } = this.m_model.getClientScenario();
        var speed: Speed = this.m_timeController.getCurrentSpeed();
        return { initData: "data for Init", scenario: scenario, worldID: this.m_worldID, speed: speed };
    }

    public getModel() {
        return this.m_model;
    }
    private handleInit = (p_data: { name: string, currentRole: string, permissions: { player: boolean, controller: boolean } }, p_clientSocket) => {
        console.log("initDataxx: " + JSON.stringify(p_data) + "  From: " + p_clientSocket.id);
        this.m_serverSocket.emit('participantEnteredFromServer' + this.m_worldID, p_data);
        this.m_model.getView().tick();
    }
    public getTimeController(): TimeController {
        return this.m_timeController;
    }
    
    public playerLeaveGame = (p_worldID, p_player) => {
        this.getModel().removeOnlineParticipant(p_player);
        this.getModel().removeOfflineParticipant(p_player);
        this.m_serverSocket.emit('participantLeftGameFromServer' + p_worldID, { nickname: p_player });
    }
}
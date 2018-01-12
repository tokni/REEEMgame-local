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
import { pool } from "../routes/index"
var csv = require("fast-csv");

export default class GameControllerDev {
    private m_serverSocket;
    private m_worldID: number;
    private m_decisonController: DecisionController;
    private m_timeController: TimeController;
    private m_scenarioChangeController: ScenarioChangeController;
    private m_roleChangeController;
    //private m_filePath = "C:/Users/bl_000/Documents/reeemgame/ExpressApp1Starter/routes/smallMatrixFakeData.csv";
    //private m_filePath = "C:/Users/bl_000/Documents/reeemgame/ExpressApp1Starter/routes/28RegTiny3.csv";
    private m_filePath = "C:/Users/bl_000/Documents/reeemgame/ExpressApp1Starter/routes/Tiny4.csv";
    private m_filePathOnServer = "/home/ubuntu/ReeemGame/ReeemGameSprint7/routes/smallMatrixFakeData.csv";
    //private m_filePath = "C:/Users/bl_000/Documents/reeemgame/ExpressApp1Starter/routes/fullMatrix.csv";
    private m_currentPathway: string;
    private m_currentVariable: string;
    
    private m_model: ModelDev;
    private m_dataBaseHandler: DataBaseHandler;
    private csvTmp = [];

    constructor(p_serverSocket, p_worldID, p_model, p_usersDB, p_worldsDB) {
        this.m_dataBaseHandler = new DataBaseHandler(p_serverSocket, p_worldID, p_usersDB, p_worldsDB);
        this.m_serverSocket = p_serverSocket;
        this.m_worldID = p_worldID;
        this.m_model = p_model; //new ModelDev(p_scenario, p_view);
        this.m_decisonController = new DecisionController(this.m_serverSocket, this.m_worldID, this.m_model, this.m_dataBaseHandler);
        this.m_timeController = new TimeController(this.m_serverSocket, this.m_worldID, this.m_model, this.m_dataBaseHandler);
        //profileChange
        this.m_roleChangeController = new RoleChangeController(this.m_serverSocket, this.m_worldID, this.m_model);
        this.m_scenarioChangeController = new ScenarioChangeController(this.m_serverSocket, this.m_worldID, this.m_model,this.m_roleChangeController,this.m_timeController);
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
            //if (data.userType == "participant") {
                clientSocket.nickname = data.name;
                clientSocket.worldID = this.m_worldID;
                clientSocket.permissions = data.permissions;
                //clientSocket.userType = data.userType;
                //clientSocket.pin = data.pin;
            //}
            this.handleInit(data, clientSocket);
        });
        var t = clientSocket.handshake.query["wid"];
        //var t2 = clientSocket.handshake.query["wids"];
        if (clientSocket.handshake.query["wid"] == this.m_worldID || clientSocket.handshake.query["wid"] == "main") {
            var initData;
            if (this.m_worldID)
                if (clientSocket.handshake.query["wid"] != "main")
                    initData = this.createInitData();
                else {
                    initData = this.createMainInitData();
                }
            else
                initData = this.createBrowserInitData();
            console.log("emiting connection ready " + this.m_worldID);
            this.m_serverSocket.emit('connectionReady' + this.m_worldID, initData);
        }
        if (this.m_worldID == 0) {
            clientSocket.on('pathwayChangeFromBrowser', (data) => {
                this.onPathwayChangeDB(data, clientSocket);
            });
            clientSocket.on('variableChangeFromBrowser', (data) => {
                this.onVariableChangeDB(data, clientSocket);
            });
            clientSocket.on('clickOnFeature' + this.m_worldID, (data) => {
                this.onClickFeature(data, clientSocket);
            });
        }
        clientSocket.on("tickReceivedFromClient" + this.m_worldID, (data) => {
            //console.log("TickRecived, deltaTime: " + (Date.now() - data.dt) + " from: " + this.m_worldID);
            if (data.t == this.m_model.getTime()) {
                //console.log("xxxTickRecived, time: " + this.m_model.getTime());
                this.m_model.tickWasSent();
            }
        });
    }
    private onDisconnect = (clientSocket) => {
        console.log("onDisconnect " + clientSocket.nickname);
        var participant: { nickName: string, pin: string, currentRole: string } = { nickName: clientSocket.nickname, pin: clientSocket.pin, currentRole: undefined };
        //if (clientSocket.userType == "participant") {//If this is a participant leaving
            var profile: Profile = this.m_model.removeOnlineParticipant(participant.nickName);
            if (profile) {
                this.m_model.addOfflineParticipant(profile);
            }
            this.m_serverSocket.emit('participantLeftFromServer' + this.m_worldID, participant);
        //}
    }
    private createInitData() {
        //goto model and get the data
        //send scenario details
        var scenario: { roles: Role[], duration: number, time: number, status: GameStatus, score: { c: number, s: number, v: number, o: number } }= this.m_model.getClientScenario();
        var history:SimulationHistory  = this.m_model.getHistory();
        var prevSimulations: SimulationHistory[] = this.m_model.getPrevSimulations();
        var speed: Speed = this.m_timeController.getCurrentSpeed();
        return { initData: "data for Init", scenario: scenario, history: history, prevSimulations:prevSimulations, worldID: this.m_worldID, speed: speed};
    }
    private createMainInitData()
    {
        var scenario: { roles: Role[], duration: number, time: number, status: GameStatus, score: { c: number, s: number, v: number, o: number } } = this.m_model.getClientScenario();
        var speed: Speed = this.m_timeController.getCurrentSpeed();
        return { initData: "data for Init", scenario: scenario, worldID: this.m_worldID, speed: speed };
    }
    private createBrowserInitData() {
        var scenario = this.m_model.getClientScenario();
        var history = this.m_model.getHistory();
        return { initData: "browser", scenario: scenario, history: history };
    }
    public getModel() {
        return this.m_model;
    }
    //private handleInit = (p_data: { nickName: string, pin: any, userType: any, currentRole: string}, p_clientSocket) => {
    private handleInit = (p_data: { name: string, currentRole: string, permissions: { player: boolean, controller: boolean } }, p_clientSocket) => {
        console.log("initDataxx: " + JSON.stringify(p_data) + "  From: " + p_clientSocket.id);
        //if (p_data.userType == "participant") {//If this is a participant
            this.m_serverSocket.emit('participantEnteredFromServer' + this.m_worldID, p_data);
            this.m_model.getView().tick();
        //}
    }
    public getTimeController(): TimeController {
        return this.m_timeController;
    }

    onVariableChange = (p_variableName, p_clientSocket) => {
        console.log(p_variableName);
        var csvRes = [];
        var header = true;
        var removeIndex = [];
        var duration = 0;
        var csvChange = [];
        csv
            //.fromPath("C:/Users/bl_000/Documents/reeemgame/ExpressApp1Starter/routes/smallMatrixFakeData.csv")
            .fromPath(this.m_filePath)
            .on("data", (data) => {
                var row = [];
                var rowChange = [];
                var parsedvalue;
                
                
                var firstColumn = true;
                for (var value of data) {
                    if (header == true) {
                        if (firstColumn == false) {
                            parsedvalue = parseFloat(value);
                            if (isNaN(parsedvalue)) {
                                rowChange.push(value);
                                row.push(value);
                            }
                            else {
                                duration++;
                                row.push(parsedvalue);
                                //row.push(parsedvalue + 4);
                            }
                        }
                    }
                    else {
                        if (firstColumn == false) {
                            parsedvalue = parseFloat(value);
                            if (isNaN(parsedvalue)) {
                                if (data[0] == p_variableName)
                                    row.push(value);
                            }
                            else {
                                if (data[0] == p_variableName)
                                    row.push(parsedvalue);
                            }
                        }
                    }
                    
                    firstColumn = false;
                }
                header = false;
                //this.csvTmp.push(row);
                if (row.length !== 0) {
                    csvRes.push(row);

                }
                //console.log(data);
            })
            .on("end", () => {
                console.log("csv done");
                for (var elm in csvRes[1]) {
                    if (csvRes[1][elm] === "") {
                        removeIndex.unshift(elm);
                    }
                }
                for (var rem of removeIndex) {
                    for (var i in csvRes) {
                        csvRes[i].splice(rem, 1);
                    }
                }

                this.m_model.setDuration(duration);
                this.m_serverSocket.sockets.sockets[p_clientSocket.id].emit('variableChangeFromServer', { name: p_variableName, data: csvRes });
            }).on('error', (err) => {
                var tmp = err;
            });
        
        
    }
    onPathwayChange = (data) => {
        console.log(data);
        switch (data) {
            case "Pathway_1": this.m_filePath = "C:/Users/bl_000/Documents/reeemgame/ExpressApp1Starter/routes/Tiny4.csv"; break;
            case "Pathway_2": this.m_filePath = "C:/Users/bl_000/Documents/reeemgame/ExpressApp1Starter/routes/28RegTiny3.csv"; break;
            case "Pathway_3": this.m_filePath = ""; break;
        }
        var variableList = [];
        var head = true;
        var header = true;
        var parsedvalue;
        
        var csvRes = [];
        csv
            .fromPath(this.m_filePath)
            .on("data", (data) => {
                var row = [];
                var firstColumn = true;
                for (var value of data) {
                    if (header == true) {
                        parsedvalue = parseFloat(value);
                        if (isNaN(parsedvalue)) {
                            row.push(value);
                        }
                        else {                               
                            row.push(parsedvalue);
                        }
                    }
                    else {  
                        parsedvalue = parseFloat(value);
                        if (isNaN(parsedvalue)) {
                            
                                row.push(value);
                        }
                        else {
                            
                                row.push(parsedvalue+5);
                        }
                    }
                }
                if (row.length !== 0) {
                    csvRes.push(row);
                }   
                
                var varIndex = variableList.indexOf(data[0]);
                if (varIndex == -1 && !head)
                    variableList.push(data[0]);
                header = false;
                head = false;
            }).on("end", () => {
                //console.log("csv done: " + JSON.stringify(csvRes));
                this.m_serverSocket.emit('pathwayChangeFromServer', { vars: variableList, pathway_name: data });

                });
        
    }
    onModelChangeDB = (modelData) => {

    }
    onVariableChangeDB = (p_variableName, p_clientSocket) => {
        console.log("Variable: " + p_variableName);
        this.m_currentVariable = p_variableName;
        var data = [];
        data[0] = ['REGION', "NAME", 2010, 2015, 2020, 2025, 2030, 2035, 2040, 2045, 2050];
        pool.connect().then(client => {
            var qs = 'SELECT * FROM crosstab($$SELECT  ("region", "name") AS row_name, "year", "value" FROM model_draft.times_paneu_input_pilot' +
                ' WHERE "table" = ' + "'" + p_variableName + "' AND region != 'EU28' ORDER BY 1, 2$$," +
                '$$ SELECT DISTINCT year FROM model_draft.times_paneu_service ORDER BY 1$$ )' +
                'AS(mix text, "2010" float8, "2015" float8, "2020" float8, "2025" float8, "2030" float8, "2035" float8, "2040" float8, "2045" float8, "2050" float8);';
            ;
            //var qs = 'SELECT * FROM crosstab($$SELECT  ("region", "name") AS row_name, "year", "value" FROM model_draft.times_paneu_input_pilot' +
            //    ' WHERE "table" = ' + "'" + p_variableName + "' AND region != 'EU28' ORDER BY 1, 2$$," +
            //    '$$ SELECT DISTINCT year FROM model_draft.times_paneu_input_pilot ORDER BY 1$$ )' +
            //    'AS(mix text, "2010" float8, "2015" float8, "2020" float8, "2025" float8, "2030" float8, "2035" float8, "2040" float8, "2045" float8, "2050" float8);';
            //;
            //var qs = 'SELECT * FROM crosstab($$SELECT  ("region", "name") AS row_name, "year", "value" FROM game.times_paneu_input_pilot1' +
            //    ' WHERE "table" = ' + "'" + p_variableName + "' AND region != 'EU28' ORDER BY 1, 2$$," +
            //    '$$ SELECT DISTINCT year FROM game.times_paneu_input_pilot1 ORDER BY 1$$ )' +
            //    'AS(mix text, "2010" float8, "2015" float8, "2020" float8, "2025" float8, "2030" float8, "2035" float8, "2040" float8, "2045" float8, "2050" float8);';
            //;
            var q = client.query(qs);
            q.on("row", row => {
                //console.log("row: " + JSON.stringify(row));
                var dataRow = [];
                row.mix = row.mix.replace(/"+/g, '');
                dataRow[0] = row.mix.substring(1, 3);
                dataRow[1] = row.mix.substring(4, row.mix.length-1);
                dataRow[2] = row['2010'];
                dataRow[3] = row['2015'];
                dataRow[4] = row['2020'];
                dataRow[5] = row['2025'];
                dataRow[6] = row['2030'];
                dataRow[7] = row['2035'];
                dataRow[8] = row['2040'];
                dataRow[9] = row['2045'];
                dataRow[10] = row['2050'];
                data.push(dataRow);
            });
            q.on('end', (res) => {
                var varUnit;
                //var tmp45 = "SELECT DISTINCT unit FROM model_draft.times_paneu_input_pilot WHERE " + '"table"' + " = '" + p_variableName + "' AND region = 'AT' ORDER BY 1";
                //var q2 = client.query("SELECT DISTINCT unit FROM model_draft.times_paneu_input_pilot WHERE " + '"table"' + " = '" + p_variableName + "' AND region = 'AT' ORDER BY 1");
                var tmp45 = "SELECT DISTINCT unit FROM model_draft.times_paneu_service WHERE " + '"table"' + " = '" + p_variableName + "' AND region = 'AT' ORDER BY 1";
                var q2 = client.query("SELECT DISTINCT unit FROM model_draft.times_paneu_service WHERE " + '"table"' + " = '" + p_variableName + "' AND region = 'AT' ORDER BY 1");

                q2.on("row", (row) => { varUnit = row.unit });
                q2.on("end", () => {
                    client.release();
                    console.log("End: " + p_variableName);
                    this.m_serverSocket.sockets.sockets[p_clientSocket.id].emit('variableChangeFromServer', { name: p_variableName, data: data, unit: varUnit });

                });
            });
        });
    }
    onPathwayChangeDB = (pathwayData, p_clientSocket) => {
        var controller = this;
        console.log("PathWayChange: " + pathwayData);
        pool.connect().then(client => {
            var variableList = [];
            //var queryString = 'SELECT DISTINCT "table" FROM model_draft.times_paneu_input_pilot  WHERE region = ' + "'EU28'" + ' ORDER BY 1';
            //var queryString = 'SELECT DISTINCT "table" FROM game.times_paneu_service  WHERE region = ' + "'EU28'" + ' ORDER BY 1';
            var queryString = 'SELECT DISTINCT "table" FROM model_draft.times_paneu_service  WHERE region = ' + "'EU28'" + ' ORDER BY 1';

            console.log(queryString);
            var q = client.query(queryString);
            q.on('row', (row) => {
                if (row.table != null)
                    variableList.push(row.table);
            });
            
            q.on('end', function () {
                client.release();
                console.log("End: " + pathwayData);
                controller.m_serverSocket.sockets.sockets[p_clientSocket.id].emit('pathwayChangeFromServer', { pathway_name: pathwayData, vars: variableList });
            });
        });
    }
    onClickFeature = (featureData, p_clientSocket) => {
        console.log("fc: " + featureData);
        this.m_serverSocket.sockets.sockets[p_clientSocket.id].emit('clickOnFeatureFromServer', { region: featureData.id, var: this.m_currentVariable, regionName: featureData.name });
    }
    public playerLeaveGame = (p_worldID,p_player) => {
        this.getModel().removeOnlineParticipant(p_player);
        this.getModel().removeOfflineParticipant(p_player);        
        this.m_serverSocket.emit('participantLeftGameFromServer' + p_worldID, {nickname: p_player });
    }
    
} 
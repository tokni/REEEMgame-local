import ModelDev from "../ServerModel/ModelDev";
import Role from "../ServerModel/Role";
import { RoleChangeController } from "./RoleChangeController";
import SimulationHistory from "../ServerModel/SimulationHistory";
import TimeController, { GameStatus } from './ServerTimeController'

export class ScenarioChangeController {

    private m_serverSocket;
    private m_worldID;
    private m_model: ModelDev;
    private m_roleChangeController: RoleChangeController;
    private m_timeController: TimeController;

    constructor(p_serverSocket, p_worldID, p_model:ModelDev, p_roleChangeController: RoleChangeController,p_timeController: TimeController) {
        this.m_serverSocket = p_serverSocket;
        this.m_worldID = p_worldID;
        this.m_model = p_model;
        this.m_timeController = p_timeController;
        this.m_roleChangeController = p_roleChangeController;
        this.m_serverSocket.sockets.on('connection', (clientSocket) => {
            clientSocket.on('scenarioChangeFromClient' + this.m_worldID, this.onScenarioChange);
        });
    }
    private onScenarioChange = (p_scenarioID: string) => {
        var data: { scenarioData: { roles: Role[], duration: number, time: number, status: GameStatus, score: { c: number, s: number, v: number, o: number } }, historyData: SimulationHistory }
            = this.m_model.changeScenario(p_scenarioID);
        this.m_serverSocket.emit('scenarioChangeFromServer'+this.m_worldID, { worldID: this.m_worldID, scenarioID: p_scenarioID, data: data });
        this.m_model.assignAllNewRoles();
        this.m_timeController.reset({ status: GameStatus.reset, worldID:this.m_worldID});
    }
}

import GameControllerDev from '../ServerControl/GameControllerDev'

import { GameLogic } from '../ServerModel/gamelogic/mainGameLogic'
import ModelDev from "../ServerModel/ModelDev";

export default class MainController {
    private m_gameControllers: Map<number, GameControllerDev>;
    private static ms_instance: MainController;
    constructor() {
        this.m_gameControllers = new Map<number, GameControllerDev>();
    }
    public static getInstance(): MainController {
        if (MainController.ms_instance)
            return MainController.ms_instance;
        else {
            MainController.ms_instance = new MainController();
            return MainController.ms_instance;
        }
    }
    public createGameController(p_socket: any, worldId: number, p_model: ModelDev, p_usersDB, p_worldsDB): GameControllerDev {
        var t = typeof worldId;
        if (typeof worldId == 'string') {
            console.log("NUMBER ");
        }
        var gameController: GameControllerDev = new GameControllerDev(p_socket, worldId, p_model, p_usersDB, p_worldsDB);
        this.m_gameControllers.set(worldId, gameController);
        return gameController;
    }
    public getGameController(p_worldID: number): GameControllerDev {
        return this.m_gameControllers.get(p_worldID);
    }
    public allgc() {
        this.m_gameControllers.keys
    }
}
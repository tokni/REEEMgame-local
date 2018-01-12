import { ClientGameModel } from "./clientModel/ClientGameModel"
import { TKN_Map } from "./leaflet/TKN_map"
import { ParticipantView } from "./ClientView/ParticipantView"
import { ClientGameStatus } from "./clientModel/GameStatus"
import { Connection } from "./ClientControl/Connection"
import { ParticipantController } from "./ClientControl/ParticipantController"

export class Participant {
    private m_connection: Connection;
    private m_participantView: ParticipantView;
    private m_participantController: ParticipantController;
    private m_clientScenario: {
        start: number,
        step: number,
        duration: number, time: number, roles: {
            m_decisions:
            { m_id: string, m_name: string, m_value: number, m_minValue: number, m_maxValue: number, m_unit: string, m_description: string }[],
            m_name: string, m_indicators: {}
        }[], status: ClientGameStatus
    };
    private m_model: ClientGameModel;
    private m_map: TKN_Map;
    private m_currentRole;
    private m_participant: {
        name: string, currentRole: string, permissions: { player: boolean, controller: boolean }
    };
    private m_newParticipant: boolean;
    //private m_roles;

    constructor(p_connection: Connection, p_currentRole, p_participant, p_newParticipant: boolean) {
        console.log("PartCondtruct");
        this.m_connection = p_connection;
        this.m_currentRole = p_currentRole;
        this.m_participant = p_participant;
        this.m_newParticipant = p_newParticipant;
        if (this.m_connection.isConnectionReady()) {
            console.log("Connection is ready");
            this.onConnectionReady(this.m_connection.getConnectionReadyData());
        }
        else {
            console.log("Participant listing to connection ready event");
            this.m_connection.listenToConnectionReadyEvent(this.onConnectionReady);
        }

        //this.m_map = new TKN_Map();
    }
    private onConnectionReady = (p_data) => {
        if (!this.m_model) {
            var crole;
            this.m_clientScenario = p_data.scenario;
            for (var role of this.m_clientScenario.roles) {
                if (role.m_name == this.m_currentRole.m_name) {
                    crole = role;
                }
            }
            this.m_model = new ClientGameModel(this.m_clientScenario, this.m_participant, this.m_clientScenario.status, p_data.history, p_data.prevSimulations);
            this.m_participantView = new ParticipantView(this.m_connection, this.m_clientScenario.roles, this.m_currentRole, this.m_model, this.m_participant, this.m_newParticipant, undefined);
            this.m_participantController = new ParticipantController(this.m_connection, this.m_participantView, crole, this.m_model, this.m_clientScenario.status);
        }
    }
}
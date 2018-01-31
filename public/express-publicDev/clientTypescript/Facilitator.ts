import {FacilitatorView} from "./ClientView/FacilitatorView"
import { FacilitatorController } from "./ClientControl/FacilitatorController"
import { Connection } from "./ClientControl/Connection"
import { ClientModel } from "./clientModel/ClientModel"
import { TKN_Map } from "./leaflet/TKN_map"
import { ClientGameStatus } from "./clientModel/GameStatus"
import { FacilitatorModel } from "./clientModel/FacilitatorModel"

export class Facilitator {
    private m_connection: Connection;
    private m_facilitatorView: FacilitatorView;
    private m_facilitatorController: FacilitatorController;
    private m_model: ClientModel;
    private m_offlineParticipants: { nickName: string, pin: string } [] = [];
    private m_scenario: {
        start: number,
        step: number,
        duration: number, time: number, roles: {
            m_decisions:
            { m_id: string, m_name: string, m_value: number, m_minValue: number, m_maxValue: number, m_unit: string, m_description: string }[],
            m_name: string, m_indicators: {}
        }[], status: ClientGameStatus
    };
    private m_participant;
    private m_profiles: { nickName: string, pin: string, currentRole: string }[] = [];
    private m_currentRole: string;
    private m_new: boolean;

    constructor(p_connection: Connection, p_participant, p_profiles, p_allProfiles, p_currentRole, p_new) {
        this.m_connection = p_connection;
        this.m_participant = p_participant;
        this.m_currentRole = p_currentRole;
        this.m_new = p_new;
        var profiles: { m_currentRole: string, m_nickName: string, m_pin: string }[] = JSON.parse(p_profiles);
        for (var i = 0; i < profiles.length; i++) {
            var p = profiles[i];
            this.m_profiles.push({ nickName: p.m_nickName, pin: p.m_pin, currentRole: p.m_currentRole});
        }
        var allProfiles: { m_nickName: string, m_pin: string }[] = (p_allProfiles);
        for (var i = 0; i < allProfiles.length; i++) {
            var profile = allProfiles[i];
            var online = false;
            for (var j = 0; j < profiles.length; j++) {
                var p = profiles[j];
                if (p.m_nickName == profile.m_nickName) {
                    online = true;
                    break;
                }
            }
            if (!online) {
                this.m_offlineParticipants.push({ nickName: profile.m_nickName, pin: profile.m_pin });
            }
        }
        if (this.m_connection.isConnectionReady()) {
            this.onConnectionReady(this.m_connection.getConnectionReadyData());
        } 
        else {
            this.m_connection.listenToConnectionReadyEvent(this.onConnectionReady);
        }
    }
    private onConnectionReady = (p_data) => {
        if (!this.m_model) {
            var indicatorData = p_data.indicatorData;
            this.m_scenario = p_data.scenario ;
            this.m_model = new FacilitatorModel(this.m_participant, this.m_scenario, p_data.history, p_data.prevSimulations,this.m_profiles, this.m_offlineParticipants);
            this.m_facilitatorView = new FacilitatorView(this.m_connection, this.m_scenario.roles, this.m_model, this.m_participant, this.m_profiles, this.m_currentRole, this.m_new, indicatorData);
            this.m_facilitatorController = new FacilitatorController(this.m_connection, this.m_facilitatorView, this.m_model, this.m_scenario.status, this.m_participant, this.m_currentRole);
        }
    }
}
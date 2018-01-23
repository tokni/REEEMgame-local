import { ClientGameModel } from "./ClientGameModel"
import { ClientGameStatus } from "../clientModel/GameStatus"

export class FacilitatorModel extends ClientGameModel {

    private m_onlineProfiles: { nickName: string, pin: string, currentRole: string }[] = [];
    private m_offlineProfiles: { nickName: string, pin: string}[] = [];

    public constructor(p_profile: {
        name: string, currentRole: string, permissions: { player: boolean, controller: boolean }
    }
        , p_scenario: {
        start: number,
        step: number,
        duration: number, time: number, roles: {
            m_decisions:
            { m_id: string, m_name: string, m_value: number, m_minValue: number, m_maxValue: number, m_unit: string, m_description: string }[],
            m_name: string, m_indicators: {}
        }[], status: ClientGameStatus
    }, p_history: {
        m_scoreHistory: { combined: number[], social: number[], economic: number[], environmental: number[] },
        m_indicatorHistory: {}[],
        m_decisionHistory: {}[],
        m_decisionsMadeHistory: { role: string, type: string, value: number }[][],
        m_overlayHistory: { e: number, h: number, a: number, g: number }[][];
    }, p_prevSimulations: {
        m_scoreHistory: { combined: number[], social: number[], economic: number[], environmental: number[] },
        m_indicatorHistory: {}[],
        m_decisionHistory: {}[],
        m_decisionsMadeHistory: { role: string, type: string, value: number }[][],
        m_overlayHistory: { e: number, h: number, a: number, g: number }[][];
    }[], p_onlineParticipants: { nickName: string, pin: string, currentRole: string }[],
        p_offlineParticipants: { nickName: string, pin: string }[]) {
        //super(p_profile, p_scenario, p_history, p_prevSimulations);
        super(p_scenario, p_profile, p_scenario.status, p_history, p_prevSimulations);
        this.m_onlineProfiles = p_onlineParticipants;
        this.m_offlineProfiles = p_offlineParticipants;
        console.log("C FModel");
    }

    public getOnlineProfiles(): { nickName: string, pin: string, currentRole: string }[] {
        return this.m_onlineProfiles;
    }
    public getOfflineProfiles(): { nickName: string, pin: string}[] {
        return this.m_offlineProfiles;
    }
    public addOnlineParticipant(p_profile: { nickName: string, pin: string, currentRole: string }) {
        this.m_onlineProfiles.push(p_profile);
    }
    public getOnlineProfileByNickName(p_nickName): { nickName: string, pin: string, currentRole: string } {
        for (var profile of this.m_onlineProfiles) {
            if (profile.nickName == p_nickName)
                return profile;
        }
        return undefined;
    }

    public removeOnlineProfile(p_nickname: string) {
        var index: number;
        for (var i = 0; i < this.m_onlineProfiles.length; i++) {
            
            if (this.m_onlineProfiles[i].nickName === p_nickname) {
                index = i;
                break;
            }
        }
        if (index!= undefined) {
            this.m_onlineProfiles.splice(index, 1);
        }
    }

    public addOfflineProfile(p_profile: { nickName: string, pin: string}) {
        this.m_offlineProfiles.push(p_profile);
    }

    public removeOfflineProfile(p_nickname: string) {
        var index: number;
        for (var i = 0; i < this.m_offlineProfiles.length; i++) {
            if (this.m_offlineProfiles[i].nickName === p_nickname) {
                index = i;
                break;
            }
        }
        if (index != undefined) {
            this.m_offlineProfiles.splice(index, 1);
        }
    }
}
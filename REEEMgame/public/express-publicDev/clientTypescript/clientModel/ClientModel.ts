import { ClientSimulationHistory } from "./ClientSimulationHistory"
import { ClientGameStatus } from "../clientModel/GameStatus"

export class ClientModel {
    protected m_time: number = 0;
    protected m_scenario: {
        start: number,
        step: number,
        duration: number,
        time: number,
        roles: {
            m_decisions:
            { m_id: string, m_name: string, m_value: number, m_minValue: number, m_maxValue: number, m_unit: string, m_description: string }[],
            m_name: string,
            m_indicators: {}
        }[]
    };
    
    
    protected m_history: ClientSimulationHistory;
    

    public constructor(p_scenario: {
        start: number,
        step: number,
        duration: number, time: number, roles: {
            m_decisions:
            { m_id: string, m_name: string, m_value: number, m_minValue: number, m_maxValue: number, m_unit: string, m_description: string }[],
            m_name: string, m_indicators: {}
        }[]
    }, p_history: {
        m_scoreHistory: { combined: number[], social: number[], economic: number[], environmental: number[] },
        m_indicatorHistory: {}[],
        m_decisionHistory: {}[],
        m_decisionsMadeHistory: { role: string, type: string, value: number }[][],
        m_overlayHistory: { e: number, h: number, a: number, g: number }[][];
    }) {
        this.m_scenario = p_scenario;
        this.m_time = p_scenario.time;
        
        this.m_history = new ClientSimulationHistory(p_history);
        
        
    }
    public changeScenario(p_scenario: {
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
    }) {
        this.m_scenario = p_scenario;
        this.m_time = p_scenario.time;
        var ret = {};
        for (var role of this.m_scenario.roles) {
            ret[role.m_name] = {};
            for (var decision of role.m_decisions) {
                var roleName = role.m_name;
                var decName = decision.m_id;
                ret[roleName][decName] = decision.m_value;
            }
        }
        this.m_history = new ClientSimulationHistory(p_history);
    }
    public getScenario(): {
        duration: number, time: number, roles: {
            m_decisions:
            { m_id: string, m_name: string, m_value: number, m_minValue: number, m_maxValue: number, m_unit: string, m_description: string }[],
            m_name: string, m_indicators: {}
        }[]
    } {
        return this.m_scenario;
    }
    public getHistory(): {
        score: number[], social: number[], economic: number[], environmental: number[],
        indicators: any[],
        decisions: {}[],
        decisionsMade: { role: string, type: string, value: number }[][],
        overlays: { e: number, h: number, a: number, g: number }[][]
    } {
        return this.m_history.getHistory();
    }
    public getDuration(): number {
        return this.m_scenario.duration;
    }
    public getTime(): number {
        return this.m_time;
    }
    public tick(p_time: number, p_data: {
        t: number, s: { c: number, s: number, v: number, o: number }, i: {},
        o: { e: number, h: number, a: number, g: number }[], d:
        { role: string, type: string, value: number }[]
    }): void {
        if (this.m_time != p_time) {//Prevent same tick being added multiple times to history (this especially happens when creating the model)
            this.m_time = p_time;
            this.addToHistory(p_data);
        }
    }
    public addToHistory(p_data: {
        t: number, s: { c: number, s: number, v: number, o: number }, i: {},
        o: { e: number, h: number, a: number, g: number }[], d:
        { role: string, type: string, value: number }[]
    }) {
        this.m_history.addToScoreHistory(p_data.s);
        this.m_history.addToIndicatorHistory(p_data.i);
        this.m_history.addToOverlayHistory(p_data.o);
    }
    public getDataFromHistory(p_time: number): {
        s: { c: number, s: number, o: number, v: number },
        i: any,
        d: {},
        o: { e: number, h: number, a: number, g: number }[]
    } {
        return this.m_history.getDataFromHistory(p_time);
    }
    
    
    
    

}
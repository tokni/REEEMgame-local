import { ClientGameStatus } from "../clientModel/GameStatus"
import { ClientModel } from "./ClientModel"
import { ClientSimulationHistory} from "./ClientSimulationHistory"

export class ClientGameModel extends ClientModel {
    //private m_profile: { nickName: string, pin: string, userType: "participant" | "facilitator", currentRole: string };
    private m_profile: { name: string, currentRole: string, permissions: { player: boolean, controller: boolean } };
    private m_status: ClientGameStatus;
    private m_prevSimulations: ClientSimulationHistory[];
    private m_currentDecisions: {};
    private m_currentHistoryHolder: ClientSimulationHistory;

    constructor(p_scenario: {
        start: number,
        step: number,
        duration: number, time: number, roles: {
            m_decisions:
            { m_id: string, m_name: string, m_value: number, m_minValue: number, m_maxValue: number, m_unit: string, m_description: string }[],
            m_name: string, m_indicators: {}
        }[]
    },
        p_profile: {
            name: string, currentRole: string, permissions: { player: boolean, controller: boolean }
    },
        p_status,
        p_history: {
        m_scoreHistory: { combined: number[], social: number[], economic: number[], environmental: number[], newScore: number[] },
        m_indicatorHistory: {}[],
        m_decisionHistory: {}[],
        m_decisionsMadeHistory: { role: string, type: string, value: number }[][],
        m_overlayHistory: { e: number, h: number, a: number, g: number }[][];
    },
        p_prevSimulations: {
        m_scoreHistory: { combined: number[], social: number[], economic: number[], environmental: number[], newScore: number[] },
        m_indicatorHistory: {}[],
        m_decisionHistory: {}[],
        m_decisionsMadeHistory: { role: string, type: string, value: number }[][],
        m_overlayHistory: { e: number, h: number, a: number, g: number }[][];
    }[]) {
        super(p_scenario, p_history);
        this.m_profile = p_profile;
        this.m_status = p_status;
        var ret = {};
        for (var i = 0; i< this.m_scenario.roles.length; i++) {
            var role = this.m_scenario.roles[i];
            ret[role.m_name] = {};
            for (var j = 0; j < role.m_decisions.length; j++) {
                var decision = role.m_decisions[j];
                var roleName = role.m_name;
                var decName = decision.m_id;
                ret[roleName][decName] = decision.m_value;
            }
        }
        this.m_currentDecisions = ret;
        
        this.m_prevSimulations = [];
        for (var i = 0; i< p_prevSimulations.length; i++) {
            var hist = p_prevSimulations[i];
            this.m_prevSimulations.push(new ClientSimulationHistory(hist));
        }
    }
    public getParticipant(): { name: string, currentRole: string, permissions: { player: boolean, controller: boolean } } {
        return this.m_profile;
    }
    public getProfile() {
        return this.m_profile;
    }
    public setProfile(p_profile) {
        this.m_profile = p_profile;
    }
    public getStatus(): ClientGameStatus {
        return this.m_status;
    }
    public setStatus(p_status: ClientGameStatus) {
        this.m_status = p_status;
    }
    public goToPrevSimulation(p_number: number) {
        this.m_currentHistoryHolder = this.m_history.clone();
        this.m_history = this.m_prevSimulations[p_number - 1];
    }
    public goToCurrentSimulation() {
        if (this.m_currentHistoryHolder) {
            this.m_history = this.m_currentHistoryHolder;
            this.m_currentHistoryHolder = undefined;
        }
    }
    public addToHistory(p_data: {
        t: number, s: { c: number, s: number, v: number, o: number ,newScore: number }, i: {},
        o: { e: number, h: number, a: number, g: number }[], d:
        { role: string, type: string, value: number }[]
    }) {
        this.m_history.addToScoreHistory(p_data.s);
        this.m_history.addToIndicatorHistory(p_data.i);
        this.m_history.addToOverlayHistory(p_data.o);
        this.m_history.addToDecisionHistory(this.m_currentDecisions);
        this.m_history.addToDecisionMadeHistory(p_data.d);

    }
    public updateDecisions(p_dec: { role: string, type: string, value: number }[]) {
        var newDecisions: {} = {};//Cannot just update currentDecisions directly because then it would update all decisions in decisionHistory
        for (var i = 0; i < this.m_scenario.roles.length; i++) {
            var role = this.m_scenario.roles[i];
            newDecisions[role.m_name] = {};
            for (var j = 0; j < role.m_decisions.length; j++) {
                var dec = role.m_decisions[j];
                var index: number = -1;
                for (var k = 0; k < p_dec.length; k++) {
                    if (p_dec[k].role == role.m_name && p_dec[k].type == dec.m_id) {
                        index = k;
                        break;
                    }
                }
                
                if (index > -1) { //If decision has been updated
                    newDecisions[role.m_name][dec.m_id] = p_dec[index].value;
                }
                else {
                    newDecisions[role.m_name][dec.m_id] = this.m_currentDecisions[role.m_name][dec.m_id];
                }
            }
        }
        this.m_currentDecisions = newDecisions;
    }
    public getCurrentDecisions() {
        return this.m_currentDecisions;
    }
    public reset(p_data: {
        t: number,
        s: { c: number, s: number, v: number, o: number, newScore: number }, i: {},
        o: { e: number, h: number, a: number, g: number }[], d: {}
    }): void {
        this.m_history.setDecisionHistory([this.m_currentDecisions]);
        this.m_history.setOverlayHistory([p_data.o]);
        this.m_history.setIndicatorHistory([p_data.i]);
        this.m_history.setDecisionMadeHistory([[]]);
        this.m_history.setScoreHistory({ com: [p_data.s.c], soc: [p_data.s.s], env: [p_data.s.v], eco: [p_data.s.o], newScore: [p_data.s.newScore] });
        this.m_time = p_data.t;

    }
    public getScoreDialogData(): any[] {
        if (this.m_history.getHistory().score.length > 0) {
            var data: any[] = [[]];
            data[0] = [
                { label: 'Time', type: 'date'},
                { type: 'string', role: 'annotation' },
                { type: 'string', role: 'annotationText', p: { html: true } },
                { label: 'Combined' },
                { label: 'Social' },
                { label: 'Economic' },
                { label: 'Environmental' },
                //Add label for the new score
                //{label: 'New Score'}
            ];
            for (var i = 0; i < this.m_history.getHistory().score.length; i++) {
                var decisionTitle: string = null;

                if (this.m_history.getHistory().decisionsMade[i].length > 0) {
                    decisionTitle = "Decision";
                }
                data[i + 1] = [];
                data[i + 1][1] = decisionTitle;
                data[i + 1][2] = this.getDecisionString(this.m_history.getHistory().decisionsMade[i]);
                //add timeScale
                var startYear = 2017;
                var startMonth = 5;//0 index. We start in june
                var year = startYear + Math.floor((startMonth + i) / 12);
                var month = Math.floor(((startMonth + i) % 12));
                data[i + 1][0] = new Date(year, month);
                //This could be optimized by transforming to columns and combining
                data[i + 1][3] = this.m_history.getHistory().score[i];
                data[i + 1][4] = this.m_history.getHistory().social[i];
                data[i + 1][5] = this.m_history.getHistory().economic[i]
                data[i + 1][6] = this.m_history.getHistory().environmental[i];
                //Add the new score
                //data[i + 1][7] = this.m_history.getHistory().newScore[i];
            }
        }
        return data;
    }
    private getDecisionString(p_decisions:
        { role: string, type: string, value: number }[]): string {
        var decisions: string = null;
        if (p_decisions.length > 0) {
            decisions = "";
        }
        //For each decisions in this tick
        for (var decision of p_decisions) {
            for (var role of this.m_scenario.roles) {
                if (decision.role == role.m_name) {
                    for (var dec of role.m_decisions) {
                        if (decision.type == dec.m_id) {
                            decisions += role.m_name + " changed " + dec.m_name + " to € " + decision.value + "<br/>";
                        }
                    }
                }
            }
        }
        return decisions;
    }
    public end() {
        //Store history
        this.m_prevSimulations.push(this.m_history.clone());
    }
    public getPreviousSimulations(): ClientSimulationHistory[] {
        return this.m_prevSimulations;
    }
}
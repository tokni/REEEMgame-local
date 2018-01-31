export class ClientSimulationHistory {
    private m_overlayHistory: { e: number, h: number, a: number, g: number }[][];
    private m_indicatorHistory: {}[];
    private m_decisionsMadeHistory: { role: string, type: string, value: number }[][] = [[]];
    private m_decisionHistory: {}[];
    private m_scoreHistory: { combined: number[], social: number[], economic: number[], environmental: number[], newScore: number[] };

    public constructor(p_history?: {
        m_scoreHistory: { combined: number[], social: number[], economic: number[], environmental: number[], newScore:number[] },
        m_indicatorHistory: {}[],
        m_decisionHistory: {}[],
        m_decisionsMadeHistory: { role: string, type: string, value: number }[][],
        m_overlayHistory: { e: number, h: number, a: number, g: number }[][];
    }) {
        if (p_history) {
            this.setDecisionHistory(p_history.m_decisionHistory);
            this.setDecisionMadeHistory(p_history.m_decisionsMadeHistory);
            this.setScoreHistory({ com: p_history.m_scoreHistory.combined, soc: p_history.m_scoreHistory.social, env: p_history.m_scoreHistory.environmental, eco: p_history.m_scoreHistory.economic, newScore: p_history.m_scoreHistory.newScore });
            this.setOverlayHistory(p_history.m_overlayHistory);
            this.setIndicatorHistory(p_history.m_indicatorHistory);
        }
    }
    public getHistory(): {
        score: number[], social: number[], economic: number[], environmental: number[], newScore: number[]
        indicators: any[],
        decisions: {}[],
        decisionsMade: { role: string, type: string, value: number }[][],
        overlays: { e: number, h: number, a: number, g: number }[][]
    } {
        var history: {
            score: number[], social: number[], economic: number[], environmental: number[], newScore: number[]
            indicators: {}[],
            decisions: {}[],
            decisionsMade: { role: string, type: string, value: number }[][],
            overlays: { e: number, h: number, a: number, g: number }[][]
        } = {
                score: this.m_scoreHistory.combined, social: this.m_scoreHistory.social, economic: this.m_scoreHistory.economic, environmental: this.m_scoreHistory.environmental, newScore: this.m_scoreHistory.newScore,
                indicators: this.m_indicatorHistory,
                decisions: this.m_decisionHistory,
                decisionsMade: this.m_decisionsMadeHistory,
                overlays: this.m_overlayHistory
            };
        return history;
    }

    public setDecisionHistory(p_history: {}[]) {
        this.m_decisionHistory = p_history;
    }
    public setDecisionMadeHistory(p_history: { role: string, type: string, value: number }[][]) {
        this.m_decisionsMadeHistory = p_history;
    }
    public setOverlayHistory(p_history: { e: number, h: number, a: number, g: number }[][]) {
        this.m_overlayHistory = p_history;
    }
    public setIndicatorHistory(p_history: {}[]) {
        this.m_indicatorHistory = p_history;
    }
    public setScoreHistory(p_history: { com: number[], soc: number[], env: number[], eco: number[], newScore: number[] }) {
        this.m_scoreHistory = { combined: p_history.com, economic: p_history.eco, environmental: p_history.env, social: p_history.soc, newScore:p_history.newScore };
    }
    public addToScoreHistory(p_score: { c: number, s: number, v: number, o: number, newScore:number }) {
        this.m_scoreHistory.combined.push(p_score.c);
        this.m_scoreHistory.social.push(p_score.s);
        this.m_scoreHistory.economic.push(p_score.o);
        this.m_scoreHistory.environmental.push(p_score.v);
        //Add the new score
        this.m_scoreHistory.newScore.push(p_score.newScore);
    }
    public addToDecisionHistory(p_dec) {
        this.m_decisionHistory.push(p_dec);
    }
    public addToDecisionMadeHistory(p_dec) {
        this.m_decisionsMadeHistory.push(p_dec);
    }
    public addToIndicatorHistory(p_indicator) {
        this.m_indicatorHistory.push(p_indicator);
    }
    public addToOverlayHistory(p_overlay) {
        this.m_overlayHistory.push(p_overlay);
    }

    public clone(): ClientSimulationHistory {
        var copy: ClientSimulationHistory = new ClientSimulationHistory();
        copy.m_scoreHistory = {
            combined: this.m_scoreHistory.combined.slice(), economic: this.m_scoreHistory.economic.slice(),
            environmental: this.m_scoreHistory.environmental.slice(), social: this.m_scoreHistory.social.slice(),
            newScore: this.m_scoreHistory.newScore
        };
        copy.m_decisionHistory = this.m_decisionHistory.slice();
        copy.m_decisionsMadeHistory = this.m_decisionsMadeHistory.slice();
        copy.m_overlayHistory = this.m_overlayHistory.slice();
        copy.m_indicatorHistory = this.m_indicatorHistory.slice();
        return copy;
    }
    public getDataFromHistory(p_time: number): {
        s: { c: number, s: number, o: number, v: number },
        i: any,
        d: {},
        o: { e: number, h: number, a: number, g: number }[]
    } {
        var historyData: {
            s: { c: number, s: number, o: number, v: number },
            i: any,
            d: {},
            o: { e: number, h: number, a: number, g: number }[]
        } = {
                s: this.getScoresFromHistory(p_time),
                i: this.m_indicatorHistory[p_time],
                d: this.m_decisionHistory[p_time],
                o: this.getOverlaysFromHistory(p_time)
            }
        return historyData;
    }
    public getScoresFromHistory(p_time): { c: number, s: number, o: number, v: number } {
        var ret: { c: number, s: number, o: number, v: number, newScore: number };
        if (this.m_scoreHistory) {
            ret = {
                c: this.m_scoreHistory.combined[p_time],
                s: this.m_scoreHistory.social[p_time],
                o: this.m_scoreHistory.economic[p_time],
                v: this.m_scoreHistory.environmental[p_time],
                //Adding the new score
                newScore: this.m_scoreHistory.newScore[p_time]
            }
        }
        return ret;
    }
    public getOverlaysFromHistory(p_time): { e: number, h: number, a: number, g: number }[] {
        var ret: { e: number, h: number, a: number, g: number }[];
        ret = this.m_overlayHistory[p_time];
        return ret;
    }
}
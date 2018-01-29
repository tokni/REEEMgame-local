export default class SimulationHistory {
    private m_overlayHistory: { e: number, h: number, a: number, g: number }[][];
    private m_indicatorHistory: {}[];
    private m_decisionsMadeHistory: {}[][] = [[]];
    private m_decisionHistory: {}[];
    private m_scoreHistory: { combined: number[], social: number[], economic: number[], environmental: number[], newScore: number[] }; 
    
    public getHistory(): {
        score: number[], social: number[], economic: number[], environmental: number[], newScore: number[],
        indicators: any[],
        decisions: {}[],
        decisionsMade: {}[][],
        overlays: { e: number, h: number, a: number, g: number }[][]
    } {
        var history: {
            score: number[], social: number[], economic: number[], environmental: number[], newScore: number[],
            indicators: {}[],
            decisions: {}[],
            decisionsMade: {}[][],
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
    public setDecisionMadeHistory(p_history: {}[][]) {
        this.m_decisionsMadeHistory = p_history;
    }
    public setOverlayHistory(p_history: { e: number, h: number, a: number, g: number }[][]) {
        //e: emisionsCO2, h:housingTemp, a: airTemp, g: gnp
        this.m_overlayHistory = p_history;
    }
    public setIndicatorHistory(p_history: {}[]) {
        this.m_indicatorHistory = p_history;
    }
    public setScoreHistory(p_history: { c: number, s: number, v: number, o: number, newScore: number }[]) {
        //c: combined score, s: social score, v: environmental score, o: economic score
        this.m_scoreHistory = {combined: [], social: [], economic: [], environmental: [], newScore: [] };
        for (var hist of p_history) {
            this.addToScoreHistory(hist);
        }
    }
    public addToScoreHistory(p_score: { c: number, s: number, v: number, o: number, newScore: number }) {
        //c: combined score, s: social score, v: environmental score, o: economic score
        this.m_scoreHistory.combined.push(p_score.c);
        this.m_scoreHistory.social.push(p_score.s);
        this.m_scoreHistory.economic.push(p_score.o);
        this.m_scoreHistory.environmental.push(p_score.v);
        //Add the new score
        this.m_scoreHistory.newScore.push(p_score.newScore);
}
    public addToDecisionHistory(p_dec:{}) {
        this.m_decisionHistory.push(p_dec);
    }
    public addToDecisionMadeHistory(p_dec: {}[]) {
        this.m_decisionsMadeHistory.push(p_dec);
    }
    public addToIndicatorHistory(p_indicator) {
        this.m_indicatorHistory.push(p_indicator);
    }
    public addToOverlayHistory(p_overlay) {
        this.m_overlayHistory.push(p_overlay);
    }

    public clone(): SimulationHistory {
        var copy: SimulationHistory = new SimulationHistory();
        copy.m_scoreHistory = {
            combined: this.m_scoreHistory.combined.slice(), economic: this.m_scoreHistory.economic.slice(),
            environmental: this.m_scoreHistory.environmental.slice(), social: this.m_scoreHistory.social.slice(), newScore: this.m_scoreHistory.newScore.slice(),
        };
        copy.m_decisionHistory = this.m_decisionHistory.slice();
        copy.m_decisionsMadeHistory = this.m_decisionsMadeHistory.slice();
        copy.m_overlayHistory = this.m_overlayHistory.slice();
        copy.m_indicatorHistory = this.m_indicatorHistory.slice();

        return copy;
    }
}
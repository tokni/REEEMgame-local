import { Decision } from '../ServerModel/Decision'
import { Indicator } from '../ServerModel/Indicator'
 
export default class Role {
    private m_decisions: Decision[];
    private m_name: string;
    private m_indicators: Indicator[];
    private m_colorRGB;

    constructor(p_name: string, p_decisions: Decision[], p_indicators: Indicator[], p_colorRGB) {
        this.m_name = p_name;
        this.m_decisions = p_decisions;
        this.m_indicators = p_indicators;
        this.m_colorRGB = p_colorRGB;
    }
    getName() {
        return this.m_name;
    }
    getDecisionByName(p_decisionName): Decision {
        var ret: Decision;

        return ret;
    } 
    public getDecisions(): Decision[]{
        return this.m_decisions;
    }
    public getIndicators() {
        var ret = [];
        for (var indicator of this.m_indicators) {
            ret.push(indicator.getIndicator());
        }

        return ret;
    }
    public setDecision(p_decision, p_value) {
        for (var dec of this.m_decisions) {
            if (p_decision == dec.getID())
                dec.setValue(p_value);
        }
    }
    public getColor() {
        return this.m_colorRGB;
    }
    public clone(): Role {
        var decisions: Decision[] = [];
        for (var i = 0; i < this.m_decisions.length; i++) {
            var dec: Decision = this.m_decisions[i];
            decisions.push(dec.clone());
        }
        var indicators: Indicator[] = [];
        for (var i = 0; i < this.m_indicators.length; i++) {
            var ind: Indicator = this.m_indicators[i];
            indicators.push(ind.clone());
        }
        var color = this.m_colorRGB;
        return new Role(this.m_name, decisions, indicators, color);
    }
}
import { ClientModel } from "./ClientModel"

export class BrowserModel extends ClientModel{

    constructor(p_profile, p_scenario, p_history, p_prevSimulations) {
        var scenario = {}
        super(p_scenario, p_history);
    }
    setDuration(p_duration) {
        
        this.m_scenario.duration = p_duration;
    }
    public getStep(): number {
        return this.m_scenario.step;
    }
    public getStart(): number {
        return this.m_scenario.start;
    }
}
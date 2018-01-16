import Role from "./Role"
import { Decision } from "./Decision"

export class Scenario {
    private m_roles: Role[];
    private m_gameLogic;
    private m_name: string;
    private m_id: string;
    private m_simulationStart: number;
    private m_simulationStep: number;
    private m_simulationDuration: number;
    private m_defaultDelayPerTick;
    private m_initialRoles: Role[] = [];

    constructor(p_roles: Role[], p_start, p_step, p_duration, p_delay, p_gameLogic, p_name: string, p_id: string) {
        this.m_roles = p_roles;
        this.m_name = p_name;
        this.m_id = p_id;
        this.m_simulationStart = p_start;
        this.m_simulationStep = p_step;
        this.m_simulationDuration = p_duration;
        this.m_defaultDelayPerTick = p_delay;
        this.m_gameLogic = p_gameLogic;
        for (var i = 0; i < p_roles.length; i++) {
            this.m_initialRoles.push(p_roles[i].clone());
        }
    }
    public getID(): string {
        return this.m_id;
    }
    public getName():string {
        return this.m_name;
    }
    public getDefaultDelay() {
        return this.m_defaultDelayPerTick;
    }
    public getRoleByName(p_name): Role {
        var ret: Role;
        for (var name of this.m_roles) {
            if (name.getName() == p_name)
                return name;
        }
        return ret;
    }
    public reset =() => {
        this.m_gameLogic.ResetWorld();
        this.m_roles = [];
        for (var i = 0; i < this.m_initialRoles.length; i++) {
            this.m_roles.push(this.m_initialRoles[i].clone());
        }
    }
    getNumberOFRoles() {
        return this.m_roles.length;
    }
    getDuration() {
        return this.m_simulationDuration;
    }
    setDuration(p_duration) {
        this.m_simulationDuration = p_duration;
    }
    getDecisionByRole(p_name): Decision[] {
        var ret: Decision[] = [];
        for (var role of this.m_roles) {
            if (role.getName() == p_name) {
                ret = role.getDecisions();
            }
        }
        return ret;
    }
    public getScore(p_month): { c: number, s: number, v: number, o: number } {
        //c: combined score, s: social score, v: environmental score, o: economic score
        return {
            c: Math.round( this.m_gameLogic.getCombinedKPIAt(p_month) ),
            s: Math.round(this.m_gameLogic.getSocialKPIAt(p_month)),
            v: Math.round(this.m_gameLogic.getEnvironmentalKPIAt(p_month)),
            o: Math.round(this.m_gameLogic.getEconomicKPIAt(p_month))
        }
    }
    public getIndicatorData(p_month) {
        var ret = {}
        for (var role of this.m_roles) {
            ret[role.getName()] = {};
            for (var indicator of role.getIndicators()) {
                var tmp = this.m_gameLogic.getOverlayData(role.getName(), indicator.id, p_month);
                var tmp2 = role.getName();
                ret[role.getName()][indicator.id] = this.m_gameLogic.getOverlayData(role.getName(), indicator.id, p_month);
            }
        }
        return ret;
    }
    public getDecisions() {
        var ret = {};
        for (var role of this.m_roles) {
            ret[role.getName()] = {};
            for (var decision of role.getDecisions()) {
                var roleName = role.getName();
                var decName = decision.getID();
                ret[role.getName()][decision.getID()] = decision.getValue();
            }
        }
        return ret;
    }
    public getRoles() {
        return this.m_roles;
    }
    public getRoleByIndex(p_index) {
        return this.m_roles[p_index];
    }
    public setDecisionByRole(p_role, p_decision, p_value) {
        for (var role of this.m_roles) {
            if (p_role == role.getName())
                role.setDecision(p_decision, p_value);
        }
    }
    public getGameLogic() {
        return this.m_gameLogic;
    } 
    public getSimulationStart() {
        return this.m_simulationStart;
    }
    public getSimulationStep() {
        return this.m_simulationStep;
    }
}
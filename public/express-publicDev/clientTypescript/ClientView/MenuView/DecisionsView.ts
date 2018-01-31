import { ClientModel } from "../../clientModel/ClientModel"

declare var $:any
export class DecisionsView {
    private m_serverSocket;
    private m_worldID;
    private m_model: ClientModel;

    constructor(p_model: ClientModel) {
        console.log("C DecisionsView");
        this.m_model = p_model;
    }
    public update(p_data) {
        console.log("updating DecisionsView: " + JSON.stringify(p_data));
        for (var role of this.m_model.getScenario().roles) {
            for (var dec of role.m_decisions) {
                var tmp = "#" + dec.m_id + 'bar';
                var value = p_data[role.m_name][dec.m_id] / dec.m_maxValue * 100;
                $("#" + dec.m_id + 'bar').width(value + "%");
                $("#" + dec.m_id + 'barValue').text(p_data[role.m_name][dec.m_id]);
            }
        }
    }

    public updateAllValues(p_data) {
        for (var role of this.m_model.getScenario().roles) {
            for (var dec of role.m_decisions) {
                var tmp = "#" + dec.m_id + 'bar';
                var value = p_data[role.m_name][dec.m_id] / dec.m_maxValue * 100;
                $("#" + dec.m_id + 'value').text(p_data[role.m_name][dec.m_id]);
            }
        }
    }
    public updateValue(p_id: string, p_value: number) {
        $("#" + p_id + 'value').text(p_value);
    }
    public updateDecSliders(p_decisions) {
        for (var role of this.m_model.getScenario().roles) {//It should only be necassary to update for current role
            for (var dec of role.m_decisions) {
                var value = p_decisions[role.m_name][dec.m_id];
                $("#" + dec.m_id).slider("value", value);
            }
        }
    }
}
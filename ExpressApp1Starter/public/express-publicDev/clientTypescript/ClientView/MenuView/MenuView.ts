import { ProfileView } from "./ProfileView"
import { OverlayDataView } from "./OverlayDataView"
import { DecisionsView } from "./DecisionsView"
import { ScoreView } from "./ScoreView"
import { ClientModel } from "../../clientModel/ClientModel"

declare var $: any;

export class MenuView {
    private m_profile: ProfileView;
    private m_data: OverlayDataView;
    private m_decisions: DecisionsView;
    private m_score: ScoreView;
    private m_currentRole;
    private m_model: ClientModel;

    constructor(p_currentRole, p_model:ClientModel, p_profiles, p_scoreHistory) {
        console.log("C MenuView");
        this.m_model = p_model;
        this.m_profile = new ProfileView();
        for (var role of p_model.getScenario().roles) {
            if (role.m_name == p_currentRole.m_name)
                this.m_currentRole = role;
        }
        this.m_data = new OverlayDataView();
        this.m_decisions = new DecisionsView(p_model);
        this.m_score = new ScoreView();
    }
    public update(p_data) {
        this.m_data.update(p_data.i[this.m_currentRole.m_name], this.m_currentRole);
        this.m_score.update(p_data.s);
    }
    public updateProfile(p_profile) {
        this.m_profile.update(p_profile);
    }
    public changeDecisions = (p_decisions) => {
        this.m_decisions.update(p_decisions);
    }
    public changeProfile(p_profile) {
        console.log("Change Profile" + JSON.stringify(p_profile));
    }
    public changeParticipants(p_participants) {
        console.log("Change Participants");
    }
    public getProfileView() {
        return this.m_profile;
    }
    public getScoreDialogData() {
        //return this.m_score.getScoreVizArray();
    }
    public getDecView(): DecisionsView {
        return this.m_decisions;
    }
    public getScoreView(): ScoreView {
        return this.m_score;
    }

    public getCurrentRole() {
        return this.m_currentRole;
    }
    public getOverlayDataView() {
        return this.m_data;
    }
    public setCurrentRole(p_roleName) {
        for (var role of this.m_model.getScenario().roles) {
            if (role.m_name == p_roleName)
                this.m_currentRole = role;
        }
        $("#decisionList").empty();
        for (var decision of this.m_currentRole.m_decisions) {
            this.createDecisionSlider(decision);
        }
    }
    private createDecisionSlider(p_decision) {
        var ul = document.getElementById('decisionList');
        var li: HTMLLIElement = document.createElement("li");
        ul.appendChild(li);
        var span: HTMLSpanElement = document.createElement("span");
        span.innerHTML = p_decision.m_name;
        li.appendChild(span);
        var div: HTMLDivElement = document.createElement("div");
        li.appendChild(div);
        div.classList.add('progressBar');
        div.setAttribute('title', p_decision.m_desciption);
        div.id = p_decision.m_id;
        div.setAttribute('width', p_decision.m_value + "%");
        $("#" + p_decision.m_id).slider({
            min: p_decision.m_minValue,
            max: p_decision.m_maxValue,
            value: p_decision.m_value
        });
    }
    public showHistory(p_show: boolean) {
        if (p_show) {
            $("#historyAcc").css("display", "inherit");
        } else {
            $("#historyAcc").css("display", "none");
        }
    }
}
import { ClientGameController } from "./ClientGameController"
import { ClientGameStatus } from "../clientModel/GameStatus"
import { DialogKeys } from "../ClientView/ClientView"

declare var $: any;

export class ParticipantController extends ClientGameController {
    private m_currentRole: { m_name: string, m_indicators: any[], m_decisions: any[]};
    constructor(p_connection, p_view, p_currentRole, p_model, p_status: ClientGameStatus) {
        super(p_connection, p_view, p_model, p_status);
        console.log("C ParticipantController");
        this.m_currentRole = p_currentRole;
        this.m_connection.listenToProfileChangeEvent(this.onProfileChange);
        this.handlersToControls();
    }
    handlersToControls = () => {
        for (var dec of this.m_currentRole.m_decisions) {
            $("#" + dec.m_id).on('slidechange', { id: dec.m_id }, this.onDecisionChange);
            $("#" + dec.m_id).on('slide', { id: dec.m_id }, this.onSlide);
        }
        $("#openWelcomeMsg").on('click', this.onOpenWelcomeMsg);
    }
    private onOpenWelcomeMsg = () => {
        this.m_view.openDialog(DialogKeys.WelcomeDialog,this.m_currentRole.m_name);
    }
    private onDecisionChange = (event, ui) => {
        if (event.originalEvent) {
            var dec = {
                role: this.m_currentRole.m_name,
                dec: event.data.id,
                value: ui.value
            }
            this.m_connection.sendDecisionToServer(dec);
        }
    }
    private onSlide = (event, ui) => {
        this.m_view.getMenuView().getDecView().updateValue(event.data.id, ui.value);

    }
    protected finish() {
        //Empty. Handled in superclass
    }
    private onProfileChange = (p_profile) => {

        var modelName;
        if (this.m_model.getProfile().name)
            modelName = this.m_model.getProfile().name;
        else
            modelName = (<any>this.m_model.getProfile()).nickName;
        if (p_profile.nickName == modelName) {
            this.m_view.openDialog(DialogKeys.ProfileChangedDialog, {oldProfile: this.m_model.getProfile(), newProfile:p_profile});
            this.m_model.setProfile(p_profile);
            this.m_view.setCurrentRole(p_profile.currentRole);
            this.m_view.getMenuView().setCurrentRole(p_profile.currentRole);

            this.m_currentRole = this.m_view.getMenuView().getCurrentRole();
            this.handlersToControls();
            
            this.m_view.getMenuView().getOverlayDataView().updateForNewRole(this.m_currentRole);
            var newIndicatorData = this.m_model.getDataFromHistory(this.m_model.getTime()).i;
            this.m_view.getMenuView().getOverlayDataView().update(newIndicatorData[this.m_currentRole.m_name], this.m_currentRole);
            this.overLayDataButtonsHandlers();
            this.m_view.getMenuView().getProfileView().update(p_profile);
        }
    }
}
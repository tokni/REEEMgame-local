import { FacilitatorModel } from "../clientModel/FacilitatorModel"
import { FacilitatorView } from "../ClientView/FacilitatorView"
import { ClientGameStatus } from "../clientModel/GameStatus"
import { FacilitatorMenuView } from "../ClientView/MenuView/FacilitatorMenuView"
import { ClientGameController } from "./ClientGameController"
import { DialogKeys } from "../ClientView/ClientView"

declare var $: any;
 
export class FacilitatorController extends ClientGameController {
    protected m_model: FacilitatorModel;
    protected m_view: FacilitatorView;
    protected m_currentRole;
    constructor(p_connection, p_view, p_model, p_status: ClientGameStatus, p_profile, p_currentRole) {
        super(p_connection, p_view, p_model, p_status);
        this.m_currentRole = p_currentRole;
        this.m_connection.listenToParticipantEnterEvent(this.onParticipantEntered);
        this.m_connection.listenToProfileChangeEvent(this.onProfileChange); 
        this.m_connection.listenToParticipantLeftEvent(this.onParticipantLeft);
        this.m_connection.listenToParticipantLeftGameEvent(this.onParticipantLeftGame)
        this.handlersToTimeControls();
        this.handlersToChangeRoleControls();
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
        this.m_view.openDialog(DialogKeys.WelcomeDialog, this.m_currentRole.m_name);
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
    private onParticipantLeftGame = (p_participant: { nickname: string }) =>{
        this.m_model.removeOfflineProfile(p_participant.nickname);
        (<FacilitatorMenuView>this.m_view.getMenuView()).getParticipantsView().update();
        this.handlersToChangeRoleControls();
    }

    private onParticipantLeft = (p_participant:{ nickName: string, pin: string } ) => {
        this.m_model.removeOnlineProfile(p_participant.nickName);
        this.m_model.addOfflineProfile(p_participant);
        (<FacilitatorMenuView>this.m_view.getMenuView()).getParticipantsView().update();
        this.handlersToChangeRoleControls();
    }
    public onParticipantEntered = (p_profile): void => {//{ nickName: string, pin: string, role: string, currentRole: string } or { name: string, currentRole: string, permissions: { player: boolean, controller: boolean }
        if (p_profile.nickName) {
            if (!(this.m_model.getOnlineProfileByNickName(p_profile.nickName))) {
                this.m_model.addOnlineParticipant(p_profile);
                this.m_model.removeOfflineProfile(p_profile.nickName);
            }
        } else {
            if (!(this.m_model.getOnlineProfileByNickName(p_profile.name))) {
                var newProfile: { nickName: string, pin: string, role: string, currentRole: string } = { nickName: '', pin: '', role: '', currentRole: '' };
                newProfile.nickName = p_profile.name;
                newProfile.currentRole = p_profile.currentRole;
                this.m_model.addOnlineParticipant(newProfile);
                this.m_model.removeOfflineProfile(newProfile.nickName);
            }
        }
        (<FacilitatorMenuView>this.m_view.getMenuView()).getParticipantsView().update();
        $('#participantsAcc').effect({ effect: 'bounce', duration: 2000 });
        this.handlersToChangeRoleControls();
    }
    private onProfileChange = (p_profile: { nickName: string, currentRole: string, pin: string }) => {
        var newProfile = this.m_model.getOnlineProfileByNickName(p_profile.nickName);
        var nickShort = p_profile.nickName.replace(/\s+|\@|\./g, '');
        
        var userID = p_profile.nickName.replace(/(:|\.|\[|\]|,|=|@)/g, "\\$1");//Handle special characters
        $("#role" + newProfile.currentRole + userID).html("Change role to " + newProfile.currentRole);
        $("#" + nickShort).html(nickShort + " " + p_profile.currentRole + " -online");

        newProfile.currentRole =p_profile.currentRole;

        (<FacilitatorMenuView>this.m_view.getMenuView()).getParticipantsView().update();
        this.handlersToChangeRoleControls();
        var modelName;
        if (this.m_model.getProfile().name)
            modelName = this.m_model.getProfile().name;
        else
            modelName = (<any>this.m_model.getProfile()).nickName;
        if (p_profile.nickName == modelName) {
            this.m_view.openDialog(DialogKeys.ProfileChangedDialog, { oldProfile: this.m_model.getProfile(), newProfile: p_profile });
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
    handlersToTimeControls() {
        //time buttons
        $("#startButton").on('click', this.startButtonPress);
        $("#stopButton").on('click', this.stopButtonPress);
        $("#x1").on('click', { speed: 1 }, this.speedButtonPress);
        $("#x2").on('click', { speed: 2 }, this.speedButtonPress);
        $("#x4").on('click', { speed: 4 }, this.speedButtonPress);
        $("#x8").on('click', { speed: 8 }, this.speedButtonPress);
        $("#x16").on('click', { speed: 16 }, this.speedButtonPress);
        $("#fullspeed").on('click', { speed: 48 }, this.speedButtonPress);
        $("#reset").on('click', this.resetButtonPress);
        $("#oneStep").on('click', this.oneTickButtonPress);
    }
    protected finish() {
        this.m_view.updateButtons(ClientGameStatus.finished);
    }
    handlersToChangeRoleControls() {
        var onlineProfiles = this.m_model.getOnlineProfiles();
        for (var profile of onlineProfiles) {
            $("#" + profile.nickName).on('click', { nickName: profile.nickName }, this.toggleDropdown);
            for (var role of this.m_model.getScenario().roles) {
                var nickShort = profile.nickName.replace(/\s+|\@|\./g, '');
                nickShort = nickShort.replace(/(:|\.|\[|\]|,|=|@)/g, "\\$1");//Handle special characters
                var roleShort = role.m_name.replace(/\s+|\@|\./g, '');
                $("#role" + roleShort + nickShort).on('click', { profile: profile, newRole: role.m_name }, this.onRoleChange);
            }
        }
    }
    private toggleDropdown = (event) => {
        $("#div_participant_" + event.data.nickName).toggleClass("open");
    }
    private onRoleChange = (event) => {
        console.log("RoleChange:" + JSON.stringify(event.data));
        this.m_connection.sendRoleChangeToServer(event.data);
        //updateHandler
        var id = event.data.profile.nickName.replace(/(:|\.|\[|\]|,|=|@)/g, "\\$1");//Handle special characters
        $("#role" + event.data.profile.currentRole + id).html("Change role to " + event.data.profile.currentRole);
        $("#" + event.data.nickName).html(event.data.profile.nickName + " " + event.data.profile.pin +" " + event.data.newRole +" -online");
        var newProfile = this.m_model.getOnlineProfileByNickName(event.data.profile.nickName);
        newProfile.currentRole = event.data.newRole;
       
        (<FacilitatorMenuView>this.m_view.getMenuView()).getParticipantsView().update();
        this.handlersToChangeRoleControls();
    }
    protected stop() {
        super.stop();
        this.m_view.updateButtons(ClientGameStatus.paused);
    }
    protected start() {
        super.start();
        this.m_view.updateButtons(ClientGameStatus.running);
    }
    public resetButtonPress = () => {
        this.m_view.updateButtons(ClientGameStatus.paused);
        this.m_connection.sendTimeToServer(-10);
    }
    public startButtonPress = () => {
        this.m_view.updateButtons(ClientGameStatus.running);
        this.m_connection.sendTimeToServer(1);
    }
    public stopButtonPress = () => {
        this.m_view.updateButtons(ClientGameStatus.paused);
        this.m_connection.sendTimeToServer(0);
    }
    public speedButtonPress = (e) => {
        this.m_view.updateButtons(ClientGameStatus.running);
        this.m_connection.sendTimeToServer(e.data.speed);
    }
    public oneTickButtonPress = () => {
        this.m_connection.sendTimeToServer(-1);
    }
}
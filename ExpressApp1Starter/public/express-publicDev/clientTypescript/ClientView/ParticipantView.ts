import { ClientGameView } from "./ClientGameView"
import { ClientModel } from "../clientModel/ClientModel"
import { MenuView } from "./MenuView/MenuView"
import { DialogKeys } from "./ClientView"
import { WelcomeDialog } from "./Dialogs/WelcomeDialog"
import { ProfileChangedDialog } from "./Dialogs/ProfileChangedDialog"

declare var $: any;
export class ParticipantView extends ClientGameView {
    //private m_roles;
    constructor(p_connection, p_roles, p_currentRole, p_model: ClientModel, p_profile, p_newParticipant, p_profiles) {
        super(p_connection, p_roles, p_currentRole, p_model, p_profile, p_profiles, true);
        this.m_roles = p_roles;
        console.log("C ParticipantView");
        for (var role of p_roles) {
            if (role.m_name == p_currentRole.m_name) {
                this.m_menu = new MenuView(p_currentRole, p_model, p_profiles, { score: p_model.getHistory().score, social: p_model.getHistory().social, environmental: p_model.getHistory().environmental, economic: p_model.getHistory().economic });
                break;
            }
        }
        this.createControls();
        this.m_dialogs.set(DialogKeys.WelcomeDialog, new WelcomeDialog(this.m_model.getProfile(), p_newParticipant, this.m_model));
        //this.m_dialogs.set(DialogKeys.ProfileChangedDialog, new ProfileChangedDialog(this.m_model))
        if (p_newParticipant) {
            this.openDialog(DialogKeys.WelcomeDialog, p_currentRole.m_name);
        }


        this.m_connection.listenToProfileEvent(this.m_menu.changeProfile);
    }
    createControls() { // slider controls
        for (var role of this.m_roles) {
            if (role.m_name == this.m_currentRole.m_name) {
                for (var dec of role.m_decisions) {
                    $("#" + dec.m_id).slider({
                        min: dec.m_minValue,
                        max: dec.m_maxValue,
                        value: dec.m_value
                    });
                }
            }
        }
    }
    updateButtons(p_status) {

    }
}
import { ClientView, DialogKeys } from "../ClientView/ClientView"
import { ClientGameModel } from "../clientModel/ClientGameModel"
import { ClientModel } from "../clientModel/ClientModel"
import { ScoreDialog } from "./Dialogs/ScoreDialog"
import { ClientGameStatus } from "../clientModel/GameStatus"
import { WelcomeDialog } from "./Dialogs/WelcomeDialog"

declare var $: any;


export abstract class ClientGameView extends ClientView {
    protected m_model: ClientGameModel
    protected m_currentRole;

    constructor(p_connection, p_roles, p_currentRole, p_model: ClientModel, p_profile, p_profiles, p_newParticipant) {
        super(p_connection, p_roles, p_model);
        this.m_currentRole = p_currentRole;
        this.m_dialogs.set(DialogKeys.WelcomeDialog, new WelcomeDialog(this.m_model.getProfile(), p_newParticipant, this.m_model));
    }
    public updateScoreDialog(): void {
        var scoreDialog: ScoreDialog = <ScoreDialog>this.m_dialogs.get(DialogKeys.ScoreDialog);
        //If score dialog has been initialised and is open
        if (scoreDialog && $("#" + scoreDialog.getID()).hasClass("ui-dialog-content") && $("#" + scoreDialog.getID()).dialog('isOpen') == true) {

            scoreDialog.update(this.m_model.getScoreDialogData());
        }
    }
    getCurrentRole() {
        return this.m_currentRole;
    }
    setCurrentRole(p_role) {
        this.m_currentRole = p_role;
    }
    abstract updateButtons(p_status: ClientGameStatus);
}
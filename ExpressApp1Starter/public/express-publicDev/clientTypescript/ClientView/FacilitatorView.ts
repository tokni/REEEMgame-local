//import { Connector } from "../Connector"
//import { MapView } from "./MapView/MapView"
//import { MenuView } from "./MenuView/MenuView"
//import { Time } from "./TimeView/Time"
//import { Graph } from "./Graph"
//import { Dialog } from "./Dialogs/Dialog"
//import { Scenario }  from "../../../../ServerModel/Scenario"

import { ClientGameView } from "./ClientGameView"
import { FacilitatorMenuView } from "./MenuView/FacilitatorMenuView"
import { ClientGameStatus } from "../clientModel/GameStatus"
import { DialogKeys } from "./ClientView"

declare var $: any;
 
export class FacilitatorView extends ClientGameView{
    private m_profiles;
    constructor(p_connection, p_roles, p_model, p_profile, p_profiles, p_currentRole, p_new) {
        super(p_connection, p_roles, p_currentRole, p_model, p_profile, p_profiles, p_new);
        console.log("C FacilitatorView");
        this.m_profiles = p_profiles;
        this.createControls();
        //for (var role of p_roles) {
        //    if (role.m_name == 'Coordinator') {
        //        this.m_menu = new FacilitatorMenuView(role, p_model, p_profiles, { score: p_model.getHistory().score, social: p_model.getHistory().social, environmental: p_model.getHistory().environmental, economic: p_model.getHistory().economic });
        //        break;
        //    }
        //}
        this.m_menu = new FacilitatorMenuView(p_currentRole, p_model, p_profiles, { score: p_model.getHistory().score, social: p_model.getHistory().social, environmental: p_model.getHistory().environmental, economic: p_model.getHistory().economic });
        //this.m_dialogs.set(DialogKeys.ProfileChangedDialog, new ProfileChangedDialog(this.m_model))
        this.m_connection.listenToProfileEvent(this.m_menu.changeProfile);
        if (p_new) {
            this.openDialog(DialogKeys.WelcomeDialog, p_currentRole.m_name);
        }
    }
    //getFacilitatorMenuView(): FacilitatorMenuView {
    //    return this.m_menu;
    //}
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

    public updateButtons(p_status: ClientGameStatus) {
        switch (p_status) {
            case ClientGameStatus.paused: {
                $('#startButton').show();
                $('#stopButton').hide();
                $("#x1").show();
                $("#x2").show();
                $("#x4").show();
                $("#x8").show();
                $("#x16").show();
                $("#fullspeed").show();
                $("#oneStep").show();
            }; break;
            case ClientGameStatus.running: {
                $('#stopButton').show();
                $('#startButton').hide();
                $("#oneStep").hide();
            }; break;
            case ClientGameStatus.finished: {
                $('#startButton').hide();
                $("#stopButton").hide();
                $("#x1").hide();
                $("#x2").hide();
                $("#x4").hide();
                $("#x8").hide();
                $("#x16").hide();
                $("#fullspeed").hide();
                $("#oneStep").hide();
            }; break;
            case ClientGameStatus.oneTick: { }; break;
        }
    }

}
import { Connection } from "../ClientControl/Connection"
import { MapView } from "./MapView/MapView"
import { MenuView } from "./MenuView/MenuView"
import { Time } from "./TimeView/Time"
import { ClientModel } from "../clientModel/ClientModel"
import { Dialog } from "./Dialogs/Dialog"
import { ScoreDialog } from "./Dialogs/ScoreDialog"
import { InviteDialog } from "./Dialogs/InviteDialog"
import { ProfileChangedDialog } from "./Dialogs/ProfileChangedDialog"
import { WelcomeDialog } from "./Dialogs/WelcomeDialog"
import { ErrorDialog } from "./Dialogs/ErrorDialog"

declare var $: any;
export enum DialogKeys { ScoreDialog, ProfileChangedDialog, WelcomeDialog, VariableDialog, InviteDialog, ErrorDialog }
export abstract class ClientView {
    protected m_connection: Connection;
    protected m_map: MapView;
    protected m_menu: MenuView;
    protected m_time: Time;
    protected m_dialogs: Map<DialogKeys, Dialog>
    protected m_roles;
    protected m_model:ClientModel;
    private m_prevSimId: string = "prevSim";
    private m_prevSimText: string = "Simulation ";
    
    constructor(p_connection, p_roles, p_model: ClientModel, p_indicatorData) {
        this.m_dialogs = new Map<DialogKeys, Dialog>();
        this.m_connection = p_connection;
        this.m_model = p_model;

        this.m_map = new MapView(p_model.getScenario(), this.m_connection, p_indicatorData);
        this.m_roles = p_roles;
        
        $("#role").accordion({ collapsible: true, heightStyle: "content" });
        $("#data").accordion({ collapsible: true, active: false, heightStyle: "content" });
        $("#decision").accordion({ collapsible: true, active: false, heightStyle: "content" });
        $("#otherDecisionsContainer").accordion({ collapsible: true, active: false, heightStyle: "content" });
        $("#score").accordion({ collapsible: true, active: false, heightStyle: "content" });
        $("#timeButtonsAcc").accordion({ collapsible: true, heightStyle: "content" });
        $("#participantsAcc").accordion({ collapsible: true, heightStyle: "content" });
        $("#data").accordion({ collapsible: true, active: false, heightStyle: "content" });
        $("#decisionsAcc").accordion({ collapsible: true, active: false, heightStyle: "content" });
        $("#ScoreAcc").accordion({ collapsible: true, active: false, heightStyle: "content" }); 
        $("#historyAcc").accordion({ collapsible: true, active: false, heightStyle: "content" }); 
        $("#accordionContainer").sortable({
            axis: "y",
            handle: "p",
            stop: function (event, ui) {
                // IE doesn't register the blur when sorting
                // so trigger focusout handlers to remove .ui-state-focus
                ui.item.children("p").triggerHandler("focusout");
                //$(this).accordion("refresh"); this is the problem
            }
        });
        
        this.m_time = new Time(p_model);
        this.m_dialogs.set(DialogKeys.ScoreDialog, new ScoreDialog());
        this.m_dialogs.set(DialogKeys.ProfileChangedDialog, new ProfileChangedDialog(this.m_model));
        this.m_dialogs.set(DialogKeys.InviteDialog, new InviteDialog(this.m_connection.getWorldID(), this.m_connection.getPath()));
        this.m_dialogs.set(DialogKeys.ErrorDialog, new ErrorDialog());
    }

    openDialog(p_dialog: DialogKeys, p_data: any) {
        var tmp = this.m_dialogs.get(p_dialog);
        this.m_dialogs.get(p_dialog).open(p_data);
    }
    updateDialog(p_dialog: DialogKeys, p_data: any) {
        return this.m_dialogs.get(p_dialog).update(p_data);
    }
    
    getTimeView(): Time {
        return this.m_time;
    }
    getMapView(): MapView {
        return this.m_map;
    }
    getMap() {
        return this.m_map.getMap();
    }
    getMenuView(): MenuView {
        return this.m_menu;
    }
    
    public addPrevSimulation(p_number: number): string {
        var li: HTMLElement = document.createElement("li");
        $("#history").append(li)

        var button: HTMLButtonElement = document.createElement("button");
        var id: string = this.m_prevSimId + p_number;
        button.id = id;
        button.innerText = this.m_prevSimText + p_number;
        button.classList.add("menuButton");
        li.appendChild(button);
        return id;
    }
    public setSimulationNumberText(p_number: number) {
        if (p_number == 0) {
            $("#simulationNumber").hide();
        } else {
            $("#simulationNumber").text(this.m_prevSimText+ p_number);
            $("#simulationNumber").show();
        }
    }
    public showCurrntSimBtn(p_show: boolean) {
        if (p_show) {
            $('#currentSimBtn').show();
        }
        else {
            $('#currentSimBtn').hide();
        }
    }
}
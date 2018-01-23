declare var $: any;
import { Dialog } from "./Dialog"
import { ClientModel } from "../../clientModel/ClientModel"
export class ProfileChangedDialog extends Dialog {
    private msgDiv: HTMLDivElement;
    private containerDiv: HTMLDivElement;
    private textDiv: HTMLDivElement;
    private m_model: ClientModel;
    constructor(p_model:ClientModel) {
        super();
        console.log("C ProfileChamged Dialog");
        this.m_model = p_model;
        this.m_id = "profileChangedDialog";
        var mainDiv: HTMLDivElement = document.createElement("div");
        $('body').append(mainDiv);
        mainDiv.id = this.m_id;

        this.containerDiv = document.createElement("div");
        mainDiv.appendChild(this.containerDiv);
        this.containerDiv.classList.add("scrollbar")
        this.containerDiv.classList.add("style-2");
        this.containerDiv.id = "profileChangedDiv";

        this.msgDiv = document.createElement("div");
        this.msgDiv.classList.add("header");
        this.containerDiv.appendChild(this.msgDiv);

        this.textDiv = document.createElement("div");
        this.containerDiv.appendChild(this.textDiv);
        this.textDiv.id = "welcomeMessage";

        var closeButton: HTMLButtonElement = document.createElement("button");
        this.containerDiv.appendChild(closeButton);
        closeButton.id = "closeDialogButton";
        closeButton.innerHTML = "Ok, close";
        closeButton.classList.add("dialogButton")
        closeButton.addEventListener("click",this.close);

        $("#" + this.m_id).hide();
    }

    public close=(): void => {
        $("#"+this.m_id).dialog("close");
    }
    public open(p_data: { oldProfile: { nickName: string, pin: string, userType: "participant" | "facilitator", currentRole: string }, newProfile: { nickName: string, pin: string, userType: "participant" | "facilitator", currentRole: string } }): void {
        this.setText(p_data.oldProfile, p_data.newProfile);
        var tmp = $("#" + this.m_id);
        $("#" + this.m_id).dialog({
            dialogClass: 'dialogNoTitle',
            modal: true,
            width: 720,
            height: 250,
            resizable: false,
        });
        //$("#" + this.m_id).dialog("open");
    }
    public getID(): string {
        return this.m_id;
    }
    private setText(p_oldProfile: { nickName: string, pin: string, userType: "participant" | "facilitator", currentRole: string }, p_newProfile: { nickName: string, pin: string, userType: "participant" | "facilitator", currentRole: string }) {
        var changed: string = "role";
        var newValue: string = p_newProfile.currentRole;
        var msg: string = "Your " + changed + " is " + newValue + ".";
        this.msgDiv.innerHTML = msg;
        
        if (changed == "role") {

            var roles: any[] = this.m_model.getScenario().roles;
            switch (p_newProfile.currentRole) {
                case 'East':
                    if (roles.length == 3) {
                        this.textDiv.innerHTML = "You are EAST, and you can make decisions regarding heating subsidies and investments in renewable facilities in the east. "
                            + "Your challenge is - together with West - to maximize the combined SCORE in year 2050. "
                            
                            + "The decisions that you make impact all the available variables. "
                            + "Good luck - and let's see how close to the perfect 100 score you manage to get together with West. You can re-read this message if you click on your name in the top left hand corner. ";
                    }
                    else {
                        this.textDiv.innerHTML = "You are EAST, and you can make decisions regarding heating subsidies and investments in renewable facilities in the east. "
                            + "Your challenge is - together with West, North and South - to maximize the combined SCORE in year 2050. "
                           
                            + "The decisions that you make impact all the available variables. "
                            + "Good luck - and let's see how close to the perfect 100 score you manage to get together with West, North and South. You can re-read this message if you click on your name in the top left hand corner. ";
}
                    break;
                case 'West':
                    if (roles.length == 3) {
                        this.textDiv.innerHTML = "You are WEST, and you can make decisions regarding heating subsidies and investments in renewable facilities in the west. "
                            + "Your challenge is - together with East - to maximize the combined SCORE in year 2050. "
                           
                            + "The decisions that you make impact all the available variables. "
                            + "Good luck - and let's see how close to the perfect 100 score you manage to get together with East. You can re-read this message if you click on your name in the top left hand corner. ";
                    } else {
                        this.textDiv.innerHTML = "You are WEST, and you can make decisions regarding heating subsidies and investments in renewable facilities in the west. "
                            + "Your challenge is - together with East, North and South - to maximize the combined SCORE in year 2050. "
                            + "The decisions that you make impact all the available variables. "
                            + "Good luck - and let's see how close to the perfect 100 score you manage to get together with East, North and South. You can re-read this message if you click on your name in the top left hand corner. ";

                    }
                    break;
                case 'North':
                    this.textDiv.innerHTML = "You are North, and you can make decisions regarding heating subsidies and investments in renewable facilities in the east. "
                        + "Your challenge is - together with East, West and South - to maximize the combined SCORE in year 2050. "
                        + "The decisions that you make impact all the available variables. "
                        + "Good luck - and let's see how close to the perfect 100 score you manage to get together with East, West and South. You can re-read this message if you click on your name in the top left hand corner. ";
                    break;
                case 'South':
                    this.textDiv.innerHTML = "You are South, and you can make decisions regarding heating subsidies and investments in renewable facilities in the east. "
                        + "Your challenge is - together with East, West and North - to maximize the combined SCORE in year 2050. "
                        + "The decisions that you make impact all the available variables. "
                        + "Good luck - and let's see how close to the perfect 100 score you manage to get together with East, West and North. You can re-read this message if you click on your name in the top left hand corner. ";
                    break;
                default:
                    if (roles.length == 3) {
                        this.textDiv.innerHTML = "You are an OBSERVER, and you can ONLY VIEW the decisions of East and West - and what happens as time moves forward. "
                            + "Their decisions are regarding a) heating subsidies and b) investments in renewable facilities. "
                            + "Their challenge is jointly to maximize the combined SCORE in year 2050. "
                            + "The decisions that they make impact all the available variables. "
                            + "Let's see how close to the perfect 100 score they manage to get. You can re-read this message if you click on your name in the top left hand corner. ";
                    } else {
                        this.textDiv.innerHTML = "You are an OBSERVER, and you can ONLY VIEW the decisions of East, West, North and South - and what happens as time moves forward. "
                            + "Their decisions are regarding a) heating subsidies and b) investments in renewable facilities. "
                            + "Their challenge is jointly to maximize the combined SCORE in year 2050. "
                            + "The decisions that they make impact all the available variables. "
                            + "Let's see how close to the perfect 100 score they manage to get. You can re-read this message if you click on your name in the top left hand corner. ";
                    }}
        }
    }
    public update() {

    }



}
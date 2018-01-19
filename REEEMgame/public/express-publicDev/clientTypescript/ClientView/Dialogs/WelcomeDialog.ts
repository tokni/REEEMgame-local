declare var $: any;
import { Dialog } from "./Dialog"
import { ClientModel } from "../../clientModel/ClientModel"

export class WelcomeDialog extends Dialog{
    private m_model:ClientModel;
    private textDiv: HTMLDivElement;
    constructor(p_profile: { name: string, currentRole: string, permissions: { player: boolean, controller: boolean } }, p_newParticipant: boolean, p_model: ClientModel) {
        super();
        console.log("C WelcomeDialog");
        this.m_model = p_model;
        this.m_id = "welcomeDialog";
        console.log("Creating dialog");
        var mainDiv: HTMLDivElement = document.createElement("div");
        $('body').append(mainDiv);
        mainDiv.id = this.m_id;

        var div: HTMLDivElement = document.createElement("div");
        mainDiv.appendChild(div);
        div.classList.add("scrollbar")
        div.classList.add("style-2");
        div.id = "welcomeDialogDiv";

        var headerDiv: HTMLDivElement = document.createElement("div");
        div.appendChild(headerDiv);
        headerDiv.innerHTML = "Welcome to REEEMgame";
        headerDiv.classList.add("header");

        var userInfoDiv: HTMLDivElement = document.createElement("div");
        userInfoDiv.classList.add("userinfo");
        div.appendChild(userInfoDiv);

        var table: HTMLTableElement = document.createElement("table");
        userInfoDiv.appendChild(table);
        var rowUsername: HTMLTableRowElement = table.insertRow();
        var cell1 = rowUsername.insertCell();
        cell1.innerHTML = "Your Nickname:";
        var cell2 = rowUsername.insertCell();
        cell2.innerHTML = p_profile.name;
        cell2.classList.add("bold");
        rowUsername.insertCell();
        var emptyCell = rowUsername.insertCell();
        emptyCell.style.width = "10%";
        var cell1 = rowUsername.insertCell();
       // cell1.innerHTML = "Your PIN code:";
        var cell2 = rowUsername.insertCell();
        //cell2.innerHTML = p_profile.pin;
        cell2.classList.add("bold");
        var emptyCell = rowUsername.insertCell();
        emptyCell.style.width = "10%";
        var cell3 = rowUsername.insertCell();
        //cell3.innerHTML = "(use PIN to re-enter game)"

        this.textDiv = document.createElement("div");
        
        div.appendChild(this.textDiv);
        this.textDiv.id = "welcomeMessage";

        var closeButton: HTMLButtonElement = document.createElement("button");
        div.appendChild(closeButton);
        closeButton.id = "closeDialogButton";
        if (p_newParticipant) { 
            closeButton.innerHTML = "Let's start";
        } else {
            closeButton.innerHTML = "Ok, close";
        }
        closeButton.classList.add("dialogButton")
        closeButton.addEventListener("click", this.close);
        $("#welcomeDialog").hide();
        
    }
    public open(p_role: string): void {
        this.setText(p_role)
        console.log("open dialog");
        $("#welcomeDialog").dialog({
            dialogClass: 'dialogNoTitle',
            modal: true,
            width: 720,
            height: 440,
            resizable: false,
        });
        $("#welcomeDialog").dialog("open");
    }
    public close(): void {
        console.log("close dialog");
        if ($("#closeDialogButton").text() == "Let's start") {
            $("#closeDialogButton").text("Ok, close")
        }
        $("#welcomeDialog").dialog("close");
    }
    public getID(): string {
        return this.m_id;
    }
    private setText(p_role: string) {
        var roles: any[] = this.m_model.getScenario().roles;
        switch (p_role) {
            case 'East':
                if (roles.length == 3) {
                    this.textDiv.innerHTML = "You are EAST, and you can make decisions regarding heating subsidies and investments in renewable facilities in the east. "
                        + "Your challenge is - together with West - to maximize the combined SCORE in year 2050. "
                        + "If you click one of the items under Available Indicators, you can see current statistics about heating comfort, air temperature and GDP in both East and West. "
                        + "<b>To make decisions, move the Heating subsidies and Renewable investments levers</b>. "
                        + "Decisions are recorded on a monthly basis, and time moves forward automatically. You can see the timeline at the bottom of the screen. "
                        + "In the box with the heading All Participant's Decisions, you can see your own and West's current decisions. "
                        + "The SCORE is calculated as the average of the three components: social, economic and environmental. "
                        + "These are in turn based on East's and West's combined (housing temperature) comfort level, CO2 emissions, and GDP/person, respectively. "
                        + "The decisions that you make impact all the available variables. "
                        + "Good luck - and let's see how close to the perfect 100 score you manage to get together with West. You can re-read this message if you click on your name in the top left hand corner. ";
                }
                else {
                    this.textDiv.innerHTML = "You are EAST, and you can make decisions regarding heating subsidies and investments in renewable facilities in the east. "
                        + "Your challenge is - together with West, North and South - to maximize the combined SCORE in year 2050. "
                        + "If you click one of the items under Available Indicators, you can see current statistics about heating comfort, air temperature and GDP in both East and West. "
                        + "<b>To make decisions, move the Heating subsidies and Renewable investments levers</b>. "
                        + "Decisions are recorded on a monthly basis, and time moves forward automatically. You can see the timeline at the bottom of the screen. "
                        + "In the box with the heading All Participant's Decisions, you can see your own and West's current decisions. "
                        + "The SCORE is calculated as the average of the three components: social, economic and environmental. "
                        + "These are in turn based on all Participants combined (housing temperature) comfort level, CO2 emissions, and GDP/person, respectively. "
                        + "The decisions that you make impact all the available variables. "
                        + "Good luck - and let's see how close to the perfect 100 score you manage to get together with West, North and South. You can re-read this message if you click on your name in the top left hand corner. ";

                }
                break;
            case 'West':
                if (roles.length == 3) {
                    this.textDiv.innerHTML = "You are WEST, and you can make decisions regarding heating subsidies and investments in renewable facilities in the west. "
                        + "Your challenge is - together with East - to maximize the combined SCORE in year 2050. "
                        + "If you click one of the items under Available Indicators, you can see current statistics about about CO2 emissions, air temperature and GDP in both East and West. "
                        + "<b>To make decisions, move the Heating subsidies and Renewable investments levers</b>. "
                        + "Decisions are recorded on a monthly basis, and time moves forward automatically. You can see the timeline at the bottom of the screen. "
                        + "In the box with the heading All Participant's Decisions, you can see your own and the East's current decisions. "
                        + "The SCORE is calculated as the average of the three components: social, economic and environmental. "
                        + "These are in turn based on East's and West's combined (housing temperature) comfort level, CO2 emissions, and GDP/person, respectively. "
                        + "The decisions that you make impact all the available variables. "
                        + "Good luck - and let's see how close to the perfect 100 score you manage to get together with East. You can re-read this message if you click on your name in the top left hand corner. ";
                } else {
                    this.textDiv.innerHTML = "You are WEST, and you can make decisions regarding heating subsidies and investments in renewable facilities in the west. "
                        + "Your challenge is - together with East, North and South - to maximize the combined SCORE in year 2050. "
                        + "If you click one of the items under Available Indicators, you can see current statistics about about CO2 emissions, air temperature and GDP in both East and West. "
                        + "<b>To make decisions, move the Heating subsidies and Renewable investments levers</b>. "
                        + "Decisions are recorded on a monthly basis, and time moves forward automatically. You can see the timeline at the bottom of the screen. "
                        + "In the box with the heading All Participant's Decisions, you can see your own and the East's current decisions. "
                        + "The SCORE is calculated as the average of the three components: social, economic and environmental. "
                        + "These are in turn based on all Participants combined (housing temperature) comfort level, CO2 emissions, and GDP/person, respectively. "
                        + "The decisions that you make impact all the available variables. "
                        + "Good luck - and let's see how close to the perfect 100 score you manage to get together with East, North and South. You can re-read this message if you click on your name in the top left hand corner. ";

                }
                break;
            case 'North':
                this.textDiv.innerHTML = "You are North, and you can make decisions regarding heating subsidies and investments in renewable facilities in the east. "
                    + "Your challenge is - together with East, West and South - to maximize the combined SCORE in year 2050. "
                    + "If you click one of the items under Available Indicators, you can see current statistics about heating comfort, air temperature and GDP in both East and West. "
                    + "<b>To make decisions, move the Heating subsidies and Renewable investments levers</b>. "
                    + "Decisions are recorded on a monthly basis, and time moves forward automatically. You can see the timeline at the bottom of the screen. "
                    + "In the box with the heading All Participant's Decisions, you can see your own and West's current decisions. "
                    + "The SCORE is calculated as the average of the three components: social, economic and environmental. "
                    + "These are in turn based on all Participants combined (housing temperature) comfort level, CO2 emissions, and GDP/person, respectively. "
                    + "The decisions that you make impact all the available variables. "
                    + "Good luck - and let's see how close to the perfect 100 score you manage to get together with East, West and South. You can re-read this message if you click on your name in the top left hand corner. ";
                break;
            case 'South':
                this.textDiv.innerHTML = "You are South, and you can make decisions regarding heating subsidies and investments in renewable facilities in the east. "
                    + "Your challenge is - together with East, West and North - to maximize the combined SCORE in year 2050. "
                    + "If you click one of the items under Available Indicators, you can see current statistics about CO2 emissions, air temperature and GDP in both East and West. "
                    + "<b>To make decisions, move the Heating subsidies and Renewable investments levers</b>. "
                    + "Decisions are recorded on a monthly basis, and time moves forward automatically. You can see the timeline at the bottom of the screen. "
                    + "In the box with the heading All Participant's Decisions, you can see your own and West's current decisions. "
                    + "The SCORE is calculated as the average of the three components: social, economic and environmental. "
                    + "These are in turn based on all Participants combined (housing temperature) comfort level, CO2 emissions, and GDP/person, respectively. "
                    + "The decisions that you make impact all the available variables. "
                    + "Good luck - and let's see how close to the perfect 100 score you manage to get together with East, West and North. You can re-read this message if you click on your name in the top left hand corner. ";
                break;
            default:
                if (roles.length == 3) {
                    this.textDiv.innerHTML = "You are an OBSERVER, and you can ONLY VIEW the decisions of East and West - and what happens as time moves forward. "
                        + "Their decisions are regarding a) heating subsidies and b) investments in renewable facilities. "
                        + "Their challenge is jointly to maximize the combined SCORE in year 2050. "
                        + "If you click one of the items under Available Indicators, you can see current statistics about CO2 emissions, comfortable heating, air temperature and GDP in the two countries. "
                        + "Decisions are recorded on a monthly basis, and time moves forward automatically. You can see the timeline at the bottom of the screen. "
                        + "In the box with the heading All Participant's Decisions, you can see East's and West's current decisions. "
                        + "The SCORE is calculated as the average of the three components: social, economic and environmental. "
                        + "These are in turn based on East's and West's combined (housing temperature) comfort level, CO2 emissions, and GDP/person, respectively. "
                        + "The decisions that they make impact all the available variables. "
                        + "Let's see how close to the perfect 100 score they manage to get. You can re-read this message if you click on your name in the top left hand corner. ";
                } else {
                    this.textDiv.innerHTML = "You are an OBSERVER, and you can ONLY VIEW the decisions of East, West, North and South - and what happens as time moves forward. "
                        + "Their decisions are regarding a) heating subsidies and b) investments in renewable facilities. "
                        + "Their challenge is jointly to maximize the combined SCORE in year 2050. "
                        + "If you click one of the items under Available Indicators, you can see current statistics about CO2 emissions, comfortable heating, air temperature and GDP in the two countries. "
                        + "Decisions are recorded on a monthly basis, and time moves forward automatically. You can see the timeline at the bottom of the screen. "
                        + "In the box with the heading All Participant's Decisions, you can see East's and West's current decisions. "
                        + "The SCORE is calculated as the average of the three components: social, economic and environmental. "
                        + "These are in turn based on all Participants combined (housing temperature) comfort level, CO2 emissions, and GDP/person, respectively. "
                        + "The decisions that they make impact all the available variables. "
                        + "Let's see how close to the perfect 100 score they manage to get. You can re-read this message if you click on your name in the top left hand corner. ";
                }
        }
    }
    public update() {

    }
}
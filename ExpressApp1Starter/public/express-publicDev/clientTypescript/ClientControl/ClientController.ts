import { TKN_Map, Layer } from "../leaflet/TKN_map"
import { Connection } from "./Connection"
import { ClientModel } from "../clientModel/ClientModel"
import { ClientView } from "../ClientView/ClientView"
import { ClientGameStatus } from "../clientModel/GameStatus"
import { DialogKeys } from "../ClientView/ClientView"

declare var $: any;
 

export abstract class ClientController {
    protected m_connection: Connection;
    protected m_model: ClientModel;
    //protected m_map: TKN_Map;
    protected m_view: ClientView;
    
    constructor(p_connection, p_view, p_model) {
        console.log("C ClientController");
        this.m_connection = p_connection;
        //this.m_map = p_map;
        this.m_view = p_view;
        this.m_model = p_model;
        
        if (this.m_connection.isConnectionReady) {
            console.log("Connection is ready");
            this.onConnectionReady();
        }
        else {
            console.log("clientController listening to connection ready event");
            this.m_connection.listenToConnectionReadyEvent(this.onConnectionReady);
        }
        this.overLayDataButtonsHandlers();
        this.inviteButtonHandler();
    }
    public overLayDataButtonsHandlers() {
        var f = this.m_model.getScenario().roles;
        //for (var div of this.m_model.getScenario().roles().)
        $("#CO2Emission").on('click', this.handleData1);
        $("#comfort").on('click', this.handleData2);
        $("#airtemperature").on('click', this.handleData3);
        $("#gdp").on('click', this.handleData4);
        $('#path1').on('click', this.handlePath1);
    }
    public inviteButtonHandler() {
        $("#inviteParticipant").on('click', () => {
            console.log("InviteButton click");
            this.m_view.openDialog(DialogKeys.InviteDialog, {});
        });
    }
    public handleInviteButtonClick() {
        
    }
    protected onConnectionReady = () => {
        this.m_connection.listenToScenarioEvent(this.onScenarioChange);
        this.m_connection.listenToDatabaseErrorEvent(this.onDatabaseError);
    }
    private onDatabaseError = () => {
        this.m_view.openDialog(DialogKeys.ErrorDialog, { msg: "Unfortunately it seems that the connection to the database has been lost." });
    }
    private onScenarioChange = (p_data: {data: {
        scenarioData: {
            roles: {
                m_decisions:
        { m_id: string, m_name: string, m_value: number, m_minValue: number, m_maxValue: number, m_unit: string, m_description: string }[],
            m_name: string, m_indicators: { }
            }[], start: number,
            step: number,duration: number, time: number, status: ClientGameStatus, score: { com: number, soc: number, env: number, eco: number }
        }, historyData: {
            m_scoreHistory: { combined: number[], social: number[], economic: number[], environmental: number[] },
            m_indicatorHistory: { }[],
            m_decisionHistory: { }[],
            m_decisionsMadeHistory: { role: string, type: string, value: number }[][],
            m_overlayHistory: { e: number, h: number, a: number, g: number }[][];
        } }} ) => {
        this.m_model.changeScenario(p_data.data.scenarioData, p_data.data.historyData);
    }
    

    private handleIndicatorButtonClick = () => {

    }
    
    private handleData1 = () => {
        //this.m_view.getMap()
        if (this.m_view.getMap().m_currentLayer)
            this.m_view.getMap().m_map.removeLayer(this.m_view.getMap().m_currentLayer);
        if (this.m_view.getMap().m_currentLayer == this.m_view.getMap().m_geojsonEmision) {
            this.m_view.getMap().m_map.removeLayer(this.m_view.getMap().m_currentLayer);
            this.m_view.getMap().setLayer(Layer.none);
            this.m_view.getMap().m_currentLayer = undefined;
        } else {
            this.m_view.getMap().m_map.addLayer(this.m_view.getMap().m_geojsonEmision);
            this.m_view.getMap().m_currentLayer = this.m_view.getMap().m_geojsonEmision;
            this.m_view.getMap().setLayer(Layer.data1);
        }
        
    }
    private handleData2 = () => {
        if (this.m_view.getMap().m_currentLayer)
            this.m_view.getMap().m_map.removeLayer(this.m_view.getMap().m_currentLayer);
        this.m_view.getMap().m_map.addLayer(this.m_view.getMap().m_geojsonHousing);
        this.m_view.getMap().m_currentLayer = this.m_view.getMap().m_geojsonHousing;
        this.m_view.getMap().setLayer(Layer.housing);
    }
    private handleData3 = () => {
        if (this.m_view.getMap().m_currentLayer)
            this.m_view.getMap().m_map.removeLayer(this.m_view.getMap().m_currentLayer);
        this.m_view.getMap().m_map.addLayer(this.m_view.getMap().m_geojsonTemp);
        this.m_view.getMap().m_currentLayer = this.m_view.getMap().m_geojsonTemp;
        this.m_view.getMap().setLayer(Layer.temperature);

    }
    private handleData4 = () => {
        if (this.m_view.getMap().m_currentLayer)
            this.m_view.getMap().m_map.removeLayer(this.m_view.getMap().m_currentLayer);
        this.m_view.getMap().m_map.addLayer(this.m_view.getMap().m_geojsonGNP);
        this.m_view.getMap().m_currentLayer = this.m_view.getMap().m_geojsonGNP;
        this.m_view.getMap().setLayer(Layer.GNP);
    }
    protected goBackTo = (p_time: number) => {
        var data = this.m_model.getDataFromHistory(p_time);

        this.m_view.getMenuView().update(data);
        this.m_view.getMapView().update(data.o);
        this.m_view.getMenuView().getDecView().update(data.d);
    }
    protected handleTimeBarSlider(p_time?:number) {
        var duration: number = this.m_model.getDuration();
        if (p_time) {
            var progress: number = p_time;
        } else {
            var progress: number = this.m_model.getTime() / duration * 100;
        }
        var clientController: ClientController = this;
        $("#progressBarSlider").slider({
            value: progress,
            range: "min",
            step: 100 / duration,
            slide: function (event, ui) {
                if (ui.handle.classList.contains("leftHandle")) { //Left slider 
                    if (ui.value > progress) {
                        $(this).slider("value", progress);
                        return false;
                    } else {
                        clientController.m_view.getTimeView().updateDate(Math.round(ui.value / 100 * duration));
                    }
                    $(this).parent().children('.leftColumn').css("width", ui.value + "%");
                    $(this).parent().children('.rightColumn').css("width", 100 - ui.value + "%");
                }
                else {//Right slider 
                    return false;
                }
            },
            stop: function (event, ui) {
                if (ui.handle.classList.contains("leftHandle")) { //Left slider 
                    if (ui.value > progress) {
                        $(this).slider("value", progress);
                        clientController.goBackTo(Math.round(progress / 100 * duration));
                        return false;
                    } else {
                        clientController.goBackTo(Math.round(ui.value / 100 * duration));
                    }
                }
                else {//Right slider 
                    return false;
                }
            }
        });
        $(".ui-slider-mark").remove();
        $('<span class="ui-slider-mark"></span>').css('left', (progress) + '%').css('width',duration-progress+'%').appendTo($("#progressBarSlider"));
    }
    
    

    handlePath1() {
        console.log("Path1 Click");
    }
}
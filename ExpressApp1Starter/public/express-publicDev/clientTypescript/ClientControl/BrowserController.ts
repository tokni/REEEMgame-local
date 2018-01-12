import { ClientController } from "./ClientController"
import { TKN_Map, Layer } from "../leaflet/TKN_map"
import { ClientRole } from "../ClientScenario"
import { BrowserView } from "../ClientView/BrowserView"
import { BrowserModel } from "../clientModel/BrowserModel"
import { OutputVariable } from "../clientModel/OutputVariable"
import { DialogKeys } from "../ClientView/ClientView"

declare var $: any;

export class BrowserController extends ClientController{
    private m_currentRole: ClientRole;
    protected m_view: BrowserView;
    protected m_model: BrowserModel;
    private m_current_pathway: string;
    private m_currentVariable: OutputVariable;
    private m_currentRegion: string;
    private m_currentRegionName: string;
    private m_currentTime: number = 40;
    constructor(p_connection, p_pathways: string[], p_indicators: string[], p_view: BrowserView, p_model: BrowserModel, p_status, p_currentrole: ClientRole) {
        //super(p_connection, p_map, p_view, p_model, p_status);
        super(p_connection, p_view, p_model);
        this.m_view = p_view;
        this.m_model = p_model;
        this.createHandlerToPathways(p_pathways);
        this.createHandlersToIndicators(p_indicators);
        this.m_connection.listenToPathwayChangeEvent(this.onPathwayChangeFromServer);
        this.m_connection.listenToVariableChangeEvent(this.onVariableChangeFromServer);
        this.m_connection.listenToClickOnFeatureEvent(this.onClickMapFeature)
        
        this.m_view.getTimeView().changeTimeBarToSlider();
        this.handleTimeBarSlider(100);
        this.m_currentVariable = new OutputVariable("default", "unit", "name");
    }
    createHandlerToPathways(p_pathways: string[]) {
        for (var pathway of p_pathways) {
            $("#pathway" + pathway).on('click', { "pathway": pathway }, this.onPathwayButtonPress);
        }
    }
    onPathwayButtonPress = (evt) => { 
        console.log("pathpress: " + evt.data.pathway);
        this.m_connection.sendPathwayChangeToServer(evt.data.pathway);
    }
    createHandlersToIndicators(p_indicators: string[]) {
        for (var indicator of p_indicators) {
            //var tmp = $("#indicator" + indicator);
            var id = indicator.replace(/\s+|\@|\./g, '');
            $("#indicator" + id).on('click', { "indicator": indicator }, this.onIndicatorButtonPress);
        }
    }
    onIndicatorButtonPress = (evt) => {
        console.log("indiPress: " + evt.data.indicator);
        //var tmp = $("#indicatorButtons button");
        //$("#indicatorButtons button").button('disable');
        $("#indicatorButtons button").prop('disabled', true);
        this.m_connection.sendPathwayVariableChangeToServer(evt.data.indicator)
    }
    getOutVariable(p_name) {

    }
    getCurrentRole() {
        return this.m_currentRole;
    }
    finish() {

    }
    onPathwayChangeFromServer = (data) => {
        console.log(JSON.stringify(data.pathway_name));
        this.m_view.createButtonsForVariables(data.vars);
        this.createHandlersToIndicators(data.vars);
        this.m_current_pathway = data.pathway_name;
        //this.m_view.getMapView().updateBrowser(null, this.m_current_pathway, data.vars);
        this.m_view.getMap().updateCurrentLayer(this.m_currentTime, this.m_current_pathway);
        //this.m_view.getMap().setLayer(Layer.browser);  
    }
    onVariableChangeFromServer = (data) => {
        //$("#indicatorButtons button").show();
        $("#indicatorButtons button").prop('disabled', false);
        var out1 = new OutputVariable(data.name, data.data, data.unit);
        var time = this.m_model.getTime();
        var browerLegendValues: number[] = [];
        for (var i = 0; i < 6; i++) {
            var diff = out1.getMaxValue() - out1.getMinValue();
            var log10 = Math.round(Math.log10(out1.getMaxValue() - out1.getMinValue()));
            var t = Math.pow(10, log10-1);
            browerLegendValues[i] = Math.round(((out1.getMaxValue() - out1.getMinValue()) * i / 5 + out1.getMinValue()) / t)*t;
        }
        this.m_view.getMap().changeDeafultBrowserValues(browerLegendValues);
        
        this.m_view.setOutputVariable(out1);
        var overlayData = out1.createOverlayData(out1.getEndYear() - out1.getStartYear());
        var tmp = out1.getEndYear() - out1.getEndYear();
        //this.m_model.setDuration(out1.getEndYear() - out1.getStartYear() + 1);
        this.m_view.getTimeView().setStartYear(out1.getStartYear());
        this.m_view.getMapView().updateBrowser(overlayData, this.m_current_pathway, data.name);
        this.m_view.getTimeView().updateDate((out1.getEndYear() - out1.getStartYear()) * 12);
        //this.handleTimeBarSlider(this.m_currentTime/40*100);
        this.handleTimeBarSlider(100);
        var tmp1 = this.m_currentRegionName;
        var tmp2 = this.m_currentTime;
        var tmp3 = this.m_currentRegion;
        var tmp4 = out1.getName();
        var pieData = out1.createPieChartData(this.m_currentRegion, "NAME", this.m_currentTime, this.m_currentRegionName, out1.getName());
        this.m_view.updateDialog(DialogKeys.VariableDialog, pieData);
        //var chartData = out1.createAreaChartArray('TECHNOLOGY');
        //this.m_view.drawChart(chartData);

        //if (this.m_map.m_currentLayer)
        //    this.m_map.m_map.removeLayer(this.m_map.m_currentLayer);
        //if (this.m_map.m_currentLayer == this.m_map.m_geojsonBrowser) {
        if (this.m_currentVariable != null && out1.m_name == this.m_currentVariable.m_name && this.m_view.getMap().m_currentLayer) {
            this.m_view.getMap().m_map.removeLayer(this.m_view.getMap().m_currentLayer);
            this.m_view.getMap().setLayer(Layer.none);
            this.m_view.getMap().m_currentLayer = undefined;
        } else {
            this.m_view.getMap().m_map.addLayer(this.m_view.getMap().m_geojsonBrowser);
            this.m_view.getMap().m_currentLayer = this.m_view.getMap().m_geojsonBrowser;
            this.m_view.getMap().setLayer(Layer.browser);
        }
        //console.log(JSON.stringify(data));
        this.m_currentVariable = out1;
    }
    protected handleTimeBarSlider(p_time?: number) {
        var modelDuration: number = this.m_model.getDuration();
        var modelStep: number = this.m_model.getStep();
        var modelStart: number = this.m_model.getStart();
        //this.m_currentTime = (modelDuration - 1)*modelStep;
        if (p_time) {
            var progress: number = p_time;
        } else {
            var progress: number = this.m_model.getTime() / modelDuration * 100;
        }
        var clientController: BrowserController = this;
        $("#progressBarSlider").slider({
            value: this.m_currentTime/40*100,
            range: "min",
            step: 100 / (modelDuration-1),
            slide: function (event, ui) {
                if (ui.handle.classList.contains("leftHandle")) { //Left slider 
                    if (ui.value > progress) {
                        $(this).slider("value", progress);
                        return false;
                    } else {
                        var tmp2 = modelStep;
                        var tmp = modelStep*Math.round(ui.value / 100 * (modelDuration-1));
                        //clientController.m_view.getTimeView().updateDate(12*Math.round(ui.value / 100 * (modelDuration-1)));
                        //clientController.goBackTo(Math.round(ui.value / 100 * (modelDuration - 1)));  
                        clientController.m_view.getTimeView().updateDate(12 * tmp);
                        clientController.goBackTo(tmp); 
                        //this.m_currentTime = tmp;
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
                        clientController.goBackTo(modelStep *Math.round(progress / 100 * (modelDuration-1)));
                        return false;
                    } else {
                        clientController.goBackTo(modelStep * Math.round(ui.value / 100 * (modelDuration - 1)));
                        //this.m_currentTime = modelStep * Math.round(progress / 100 * (modelDuration - 1));
                    }
                }
                else {//Right slider 
                    return false;
                }
            }
        });
        $(".ui-slider-mark").remove();
        $('<span class="ui-slider-mark"></span>').css('left', (progress) + '%').css('width', modelDuration - progress + '%').appendTo($("#progressBarSlider"));
    }
    protected goBackTo = (p_time: number) => {
        //console.log("Slideing to: " + p_time);
        var out = this.m_view.getOutputVariable();
        var overlays = out.createOverlayData(p_time);
        //var data = this.m_model.getDataFromHistory(p_time);

        //this.m_view.getMenuView().update(data);
        this.m_view.getMapView().updateBrowser(overlays, out.getName(), this.m_current_pathway);
        //this.m_view.getMenuView().getDecView().update(data.decisions);
        var pieData = this.m_currentVariable.createPieChartData(this.m_currentRegion, "NAME", p_time, this.m_currentRegionName, this.m_currentVariable.getName());
        this.m_view.updateDialog(DialogKeys.VariableDialog, pieData);
        this.m_currentTime = p_time;
    }
    protected onClickMapFeature = (e) => {
        //console.log("Click Map from Server: " + e)
        this.m_currentRegion = e.region;
        this.m_currentRegionName = e.regionName;
        var pieData = this.m_currentVariable.createPieChartData(e.region, "NAME", this.m_currentTime, e.regionName, this.m_currentVariable.getName());
        this.m_view.openDialog(DialogKeys.VariableDialog, pieData);
    }
} 
import { GameLogic } from '../ServerModel/gamelogic/mainGameLogic'
import { Decision } from '../ServerModel/Decision'
import { Scenario } from '../ServerModel/Scenario'
import Role from '../ServerModel/Role'
import { GameView } from '../ServerView/GameView'
import { overlayInit } from './Overlay'
import { Profile } from '../ServerModel/Profile'
import { GameStatus } from "../ServerControl/ServerTimeController";
import SimulationHistory from "./SimulationHistory";
import { Speed } from "../ServerControl/ServerTimeController";
enum Status { pause, running };

export default class ModelDev {
    private m_time;
    private m_scenarios: Scenario[];
    private m_currentScenario: Scenario;
    private m_view: GameView;
    private m_onlineProfiles: Profile[] = [];
    private m_offlineProfiles: Profile[] = [];
    private m_overLayData: { emisionsCO2: number, housingTemp: number, airTemp: number, gnp: number }[] = [];
    private m_overLayDataPast: { emisionsCO2: number, housingTemp: number, airTemp: number, gnp: number }[] = [];
    private m_dispersionFactor = 0.15;
    private m_decisionsSinceLastTick: { role: string, type: string, value: number }[] = [];  
    private m_highscore: number;
    private m_history: SimulationHistory;
    private m_prevSimulations: SimulationHistory[];
    private m_readyForNextTick: boolean = true;
    //private m_lastTickTime: number = 0;
    //private m_simulationSpeed: number;
    

    constructor(p_scenario: Scenario, p_view, p_scenarios:Scenario[]) {
        //console.log("creating modelDev");
        this.m_scenarios = p_scenarios;
        this.m_time = 0;
        this.m_currentScenario = p_scenario;
        this.m_view = p_view;
        this.m_currentScenario.getDecisions();
        this.initOverlayData();
        this.m_highscore = 0;
        this.m_history = new SimulationHistory();
        this.resetHistory();
        this.m_prevSimulations = [];
    } 
    
    public changeScenario(p_scenarioID: string): { scenarioData: { roles: Role[], duration: number, time: number, status: GameStatus, score: { c: number, s: number, v: number, o: number } }, historyData: SimulationHistory} {
        this.m_currentScenario.reset()//Reset old scenario to make it ready for next us
        var scenario: Scenario;
        for (var s of this.m_scenarios) {
            if (s.getID() == p_scenarioID) {
                scenario = s;
                break;
            }
        }
        this.m_currentScenario = scenario;
        
        var scenarioData: { roles: Role[], duration: number, time: number, status: GameStatus, score: { c: number, s: number, v: number, o: number } } = this.getClientScenario();
        var historyData: SimulationHistory = this.getHistory();
        return { scenarioData: scenarioData, historyData: historyData };
    }
    public assignAllNewRoles() {
        for (var p of this.m_onlineProfiles) {
            //if (p.getProfileType() != "Facilitator") {
                p.unasignRole();
            //}
        }
        for (var p of this.m_onlineProfiles) {
            //if (p.getProfileType() != "Facilitator") {
                this.assignNewRole(p);
                this.m_view.profileChangeOfWorldID(p);
            //}
        }
    }
    public resetTime() {
        this.setTime(0);
        this.m_currentScenario.reset();
        this.resetHistory();
        this.m_decisionsSinceLastTick = [];
        this.initOverlayData();
    }
    public getPrevSimulations() {
        return this.m_prevSimulations;
    }
    public getScores(): { c: number, s: number, v: number, o: number } {
        //c: combined score, s: social score, v: environmental score, o: economic score
        return this.m_currentScenario.getScore(this.m_time);
    }
    public getIndicatorData() {

        return this.m_currentScenario.getIndicatorData(this.m_time);
    }
    public getCurrentDecisions() {
        return this.m_currentScenario.getDecisions();
    }
    public getOverlays(): { e: number, h: number, a: number, g: number }[] {
        //e: emisionsCO2, h:housingTemp, a: airTemp, g: gnp
        //Have to clone it otherwise all overlays in history will be the same
        var overlays: { e: number, h: number, a: number, g: number }[] = [];
        for (var o of this.m_overLayData) {
            overlays.push({ e: o.emisionsCO2, h: o.housingTemp, a: o.airTemp, g: o.gnp });
        }
        return overlays; 
    }
    public getTime(): number {
        return this.m_time;
    }
    public setTime(p_time) {
        this.m_time = p_time;
    }

    public getDuration(): number {
        return this.m_currentScenario.getDuration();
    }
    public setDuration(p_duration: number) {
        this.m_currentScenario.setDuration(p_duration);
    }
    public getStep(): number {
        return this.m_currentScenario.getSimulationStep();
    }
    public tick = () => {
        // console.log("ModelDev Tick: " + this.m_time);
        //if (this.m_tickTimeOut) {
        //    clearTimeout(this.m_tickTimeOut);
        //    this.executeTick();
        //} else {
        //    this.executeTick();
        //}
        this.executeTick();
    }
    private executeTick = () => {
        if (this.m_view.getStatus() != GameStatus.paused) {
            var startTime = Date.now();
            //var Tmp = startTime - this.m_lastTickTime;
            var tmp2 = this.m_currentScenario.getDefaultDelay();
            //if (!this.m_simulationSpeed) debugger;
            //if (startTime - this.m_lastTickTime > this.m_currentScenario.getDefaultDelay() / this.m_simulationSpeed) {

                if (this.m_readyForNextTick) {
                    this.m_readyForNextTick = false;
                    this.m_time++;
                    var dec: any = this.m_currentScenario.getDecisions();
                    this.m_currentScenario.getGameLogic().CalculateMonthValues(this.m_time, this.m_time, [dec.East.SubEast, dec.West.SubWest], [dec.East.ResEast, dec.West.ResWest]);
                    var east_emi = this.m_currentScenario.getGameLogic().getOverlayData('East', 'CO2Emission', this.m_time);
                    var west_emi = this.m_currentScenario.getGameLogic().getOverlayData('West', 'CO2Emission', this.m_time);
                    this.calculateEmisionOverlay(east_emi, west_emi);
                    this.calculateAirTemperatureOverlay();
                    this.calculateGDPOverlay();
                    this.calcutelateHousingTemperatureOverlay();

                    this.saveToHistory();
                    this.m_view.tick();
                    this.m_decisionsSinceLastTick = [];
                    var lagCheckStart = Date.now();
                    
                        
                    
                }
            //} else {
            //    var tmp3 = this.m_currentScenario.getDefaultDelay() - (startTime - this.m_lastTickTime);
            //    }
        }
    }
    public tickWasSent() {
        this.m_readyForNextTick = true;
    }
    public getScenario(): Scenario {
        return this.m_currentScenario;
    }
    public getDecisionsSinceLastTick(): {} {
        return this.m_decisionsSinceLastTick;
    }
    public getHistory() {
        return this.m_history;
    }
    private saveToHistory() {
        this.m_history.addToDecisionHistory(this.getCurrentDecisions());
        this.m_history.addToDecisionMadeHistory(this.m_decisionsSinceLastTick);
        this.m_history.addToIndicatorHistory(this.getIndicatorData());
        this.m_history.addToOverlayHistory(this.getOverlays());
        this.m_history.addToScoreHistory(this.getScores());
    }
    public resetHistory() {
        this.m_history.setDecisionHistory([this.getCurrentDecisions()]);
        this.m_history.setOverlayHistory([this.getOverlays()]);
        this.m_history.setIndicatorHistory([this.getIndicatorData()]);
        this.m_history.setDecisionMadeHistory([[]]);
        this.m_history.setScoreHistory([this.getScores()]);
    }
    public updateDecisions(p_role, p_decision, p_value) {
        this.m_currentScenario.setDecisionByRole(p_role, p_decision, p_value);

        var decision: { role: string, type: string, value: number } = { role: p_role, type: p_decision, value: p_value };
        //This ensures that if a decision is changed while in the same tick the previous decision will be overidden
        var alreadyExists: boolean = false;
        for (var i = 0; i < this.m_decisionsSinceLastTick.length; i++) {
            if (this.m_decisionsSinceLastTick[i].role == p_role && this.m_decisionsSinceLastTick[i].type == p_decision) {
                alreadyExists = true;
                this.m_decisionsSinceLastTick[i] = decision;
            }
        }
        if (!alreadyExists) {
            this.m_decisionsSinceLastTick.push(decision);
        }
    }
    public getView() {
        return this.m_view;
    }
    public getIndicators = (p_role) => {
        return this.m_currentScenario.getRoleByName(p_role).getIndicators();
    }
    public getRoles() {
        return this.m_currentScenario.getRoles();
    }
    public calculateEmisionOverlay = (p_eastEmision, p_westEmision) => {
        var i = 0;

        for (var f of overlayInit.features) {
            var name = f.properties.name;
            var tmp1 = (p_eastEmision - this.m_overLayDataPast[0].emisionsCO2) * f.properties.emisionsCO2.east / 100.0;
            var tmp2 = (p_westEmision - this.m_overLayDataPast[1].emisionsCO2) * f.properties.emisionsCO2.west / 100.0;
            var tmp3 = ((p_eastEmision - this.m_overLayDataPast[0].emisionsCO2) * f.properties.emisionsCO2.east / 100.0 + (p_westEmision - this.m_overLayDataPast[1].emisionsCO2) * f.properties.emisionsCO2.west / 100.0) * this.m_dispersionFactor;
            this.m_overLayData[i].emisionsCO2 += ((p_eastEmision - this.m_overLayDataPast[0].emisionsCO2) * f.properties.emisionsCO2.east / 100.0 + (p_westEmision - this.m_overLayDataPast[1].emisionsCO2) * f.properties.emisionsCO2.west / 100.0) * this.m_dispersionFactor;
            i++;
        }
        var tmp4 = this.m_overLayDataPast[0];
        var tmp5 = this.m_overLayDataPast[1];
        var tmp6 = this.m_overLayData[2];
        var tmp7 = this.m_overLayData[21];
        this.m_overLayDataPast[0].emisionsCO2 = p_eastEmision; //this.m_overLayData[2];
        this.m_overLayDataPast[1].emisionsCO2 = p_westEmision; // this.m_overLayData[21];
    }
    public calculateAirTemperatureOverlay() {
        var tmp1333 = overlayInit.features;
        for (var f in overlayInit.features) {
            if (f != "2" && f != "21") {
                var tmp10 = (this.m_time + 5) % 12;
                var tmp11 = overlayInit.features[f].properties.temp;
                this.m_overLayData[f].airTemp = overlayInit.features[f].properties.temp[(this.m_time + 5) % 12];
            } else if (f == "2") {
                this.m_overLayData[f].airTemp = this.m_currentScenario.getGameLogic().getAirTempAtMonth(0, this.m_time);
            }
            else if (f == "21") {
                this.m_overLayData[f].airTemp = this.m_currentScenario.getGameLogic().getAirTempAtMonth(1, this.m_time);
            }
        }
    }
    public calcutelateHousingTemperatureOverlay() {
        for (var f in overlayInit.features) {
            if (f != "2" && f != "21") {
                this.m_overLayData[f].housingTemp = overlayInit.features[f].properties.housing;
            }
            else if (f == "2") {
                this.m_overLayData[f].housingTemp = this.m_currentScenario.getGameLogic().getHousingTempAtMonth(0, this.m_time);
            }
            else if (f == "21") {
                this.m_overLayData[f].housingTemp = this.m_currentScenario.getGameLogic().getHousingTempAtMonth(1, this.m_time);
            }
        }
    }
    public calculateGDPOverlay() {
        var tmp1333 = overlayInit.features;
        for (var f in overlayInit.features) {
            if (f != "2" && f != "21") {
                var tmp10 = (this.m_time + 5) % 12;
                var tmp11 = overlayInit.features[f].properties.temp;
                this.m_overLayData[f].gnp = overlayInit.features[f].properties.GNP;
            } else if (f == "2") {
                this.m_overLayData[f].gnp = this.m_currentScenario.getGameLogic().getGnpAtMonth(0, this.m_time);
            }
            else if (f == "21") {
                this.m_overLayData[f].gnp = this.m_currentScenario.getGameLogic().getGnpAtMonth(1, this.m_time);
            }
        }
    }
    private initOverlayData() {
        var ret: { emisionsCO2: number, housingTemp: number, airTemp: number, gnp: number }[];
        var i = 0;
        var tmp23 = overlayInit.features;

        for (var f of overlayInit.features) {
            this.m_overLayData[i] = { emisionsCO2: 0, housingTemp: 0, airTemp: 0, gnp: 0 }
            this.m_overLayData[i].emisionsCO2 = f.properties.emisionsCO2.value;
            this.m_overLayData[i].housingTemp = f.properties.housing;
            this.m_overLayData[i].gnp = f.properties.GNP;

            var tmp34 = f.properties.temp[5];

            this.m_overLayData[i].airTemp = f.properties.temp[5];
            i++;
        }
        this.m_overLayDataPast[0] = this.m_overLayData[2];
        this.m_overLayDataPast[1] = this.m_overLayData[21];
    }
    getClientScenario(): { roles: Role[], start: number, step: number, duration: number, time: number, status: GameStatus, score: { c: number, s: number, v: number, o: number }, highscore: number } {
        var ret = { roles: this.m_currentScenario.getRoles(), start: this.m_currentScenario.getSimulationStart(), step: this.m_currentScenario.getSimulationStep(), duration: this.m_currentScenario.getDuration(), time: this.m_time, status: this.getView().getStatus(), score: this.getScores(), highscore: this.getHighscore() }
        return ret;
    }
    assignRoleToProfile(p_profile: Profile) {
        var ret;
        var i = 0;
        console.log("Online profiles: " + JSON.stringify( this.m_onlineProfiles));
        for (var role of this.m_currentScenario.getRoles()) {
            var okToUse = true;
            for (var profile of this.m_onlineProfiles) {
                if (profile.getCurrentRole() == role.getName() && role.getName() != 'Observer') {
                    okToUse = false;
                    break;
                }
            }   
            if (okToUse) {
                p_profile.setCurrentRole(role.getName());
                this.m_onlineProfiles.push(p_profile);
                break;
            }
        }
        console.log("Role " + p_profile.getCurrentRole() + " to " + p_profile.getNickName() );
        return p_profile.getCurrentRole();
    }
    private assignNewRole(p_profile: Profile) {
        for (var role of this.m_currentScenario.getRoles()) {
            var okToUse = true;
            for (var profile of this.m_onlineProfiles) {
                if (profile.getCurrentRole() == role.getName() && role.getName() != 'Observer') {
                    okToUse = false;
                    break;
                }
            }
            if (okToUse) {
                p_profile.setCurrentRole(role.getName());
                break;
            }
        }
    }
    getProfileFromNickName(p_nickName: string): Profile {
        for (var i = 0; i < this.m_onlineProfiles.length; i++) {
            var part = this.m_onlineProfiles[i];
            if (part.getNickName() == p_nickName) {
                return part;
            }
        }
        return undefined;
    }
    changeRoleOfProfile(p_role, p_profile) {
        var profile = this.getProfileFromNickName(p_profile.m_nickName);
        if (!profile)
            profile = this.getProfileFromNickName(p_profile.nickName);
        if (p_role != 'Observer') {
            for (var prof of this.m_onlineProfiles) {
                if (prof.getCurrentRole() == p_role) {
                    prof.setCurrentRole('Observer');
                    this.changeRoleOfProfile(this.getObserverRole(), prof);
                }
            }
        }
        console.log("OnlineProfs: " + JSON.stringify(this.m_onlineProfiles));
        console.log("CR: p_role: " + JSON.stringify(p_role));
        console.log("CR: p_profile: " + JSON.stringify(p_profile));
        console.log("CR: made profile: " + JSON.stringify(profile));
        if (!p_role.m_name)
            profile.setCurrentRole(p_role);
        else
            profile.setCurrentRole(p_role.m_name);
        
        this.m_view.profileChangeOfWorldID(profile);
    }
    getProfiles() {
        return JSON.stringify(this.m_onlineProfiles);
    }
    getOffLineProfiles() {
        return JSON.stringify(this.m_offlineProfiles);
    }
    public end(): number {
        //Store history
        this.m_prevSimulations.push(this.m_history.clone());
        //Update highscore if necassary
        var score: number = this.getScores().c;
        var highscore: number;
        if (score > this.m_highscore) {
            this.m_highscore = score;
            highscore = score;
        }
        return highscore;
    }
    public getHighscore(): number {
        return this.m_highscore;
    }
    public setHighscore(p_score: number): void {
        this.m_highscore = p_score;
    }
    private getObserverRole() {
        var ret;
        for (var role of this.m_currentScenario.getRoles()) {
            if (role.getName() == 'Observer')
                ret = role;
        }
        return ret;
    }
    public removeOnlineParticipant(p_nickname: string):Profile {
        var index: number;
        for (var i = 0; i < this.m_onlineProfiles.length; i++) {
            if (this.m_onlineProfiles[i].getNickName() === p_nickname) {
                index = i;
                break;
            }
        }
        if (index != undefined) {
            this.m_view.tick();
            return this.m_onlineProfiles.splice(index, 1)[0];

        }
        else return undefined;
    }
    public removeOfflineParticipant(p_nickname: string) {
        var index: number;
        for (var i = 0; i < this.m_offlineProfiles.length; i++) {
            if (this.m_offlineProfiles[i].getNickName() === p_nickname) {
                index = i;
                break;
            }
        }
        if (index!= undefined) {
            this.m_offlineProfiles.splice(index, 1);
        }
    }
    public addOfflineParticipant(p_particpant: Profile) {
        this.m_offlineProfiles.push(p_particpant);
    }
}


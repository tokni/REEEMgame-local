import { ClientController } from "./ClientController"
import { ClientGameModel } from "../clientModel/ClientGameModel"
import { ClientGameView } from "../ClientView/ClientGameView"
import { ClientGameStatus } from "../clientModel/GameStatus"
import { DialogKeys } from "../ClientView/ClientView"
import { EventEmitter} from 'events';

declare var $: any;

export abstract class ClientGameController extends ClientController {
    protected m_model: ClientGameModel;
    protected m_view: ClientGameView;
    

    constructor(p_connection, p_view, p_model, status: ClientGameStatus) {
        super(p_connection, p_view, p_model);
        console.log("C ClientGameController");
        this.m_view = p_view;
        this.m_model = p_model;
        if (this.m_view.getCurrentRole() != 'facilitator')
            var data1ID = this.m_view.getCurrentRole();

        if (status == ClientGameStatus.running) {
            this.start();
        }
        else {
            this.stop();
        }
        for (var i = 0; i < this.m_model.getPreviousSimulations().length; i++) {
            this.addPrevSimulation(i + 1);
        }
        this.onConnectionReady();
        $("#socialScore").on('click', this.handleSocialScore);
        $("#economicScore").on('click', this.handleEconomicalScore);
        $("#environmentalScore").on('click', this.handleEnvironmentalScore);
        //For a new score button
        $("#newScore").on('click', this.handleNewScore);

        $("#currentSimBtn").on('click', this.handleCurrentSim);

        //Must update decisions view 
        this.m_view.getMenuView().changeDecisions(this.m_model.getCurrentDecisions());
    }
    
    protected onFinish = () => {
        this.stop();
        this.m_model.end();
        this.finish();
        this.addPrevSimulation(this.m_model.getPreviousSimulations().length);
    }
    private addPrevSimulation(p_number: number) {
        var id = this.m_view.addPrevSimulation(p_number);
        $("#" + id).on('click', { n: p_number }, this.onPrevSimulationClick);
    }
    private onPrevSimulationClick = (event: { data: { n: number } }) => {
        this.m_view.showCurrntSimBtn(true);
        this.m_view.setSimulationNumberText(event.data.n);
        this.m_model.goToPrevSimulation(event.data.n);
        this.m_view.getTimeView().changeTimeBarToSlider();
        this.handleTimeBarSlider(this.m_model.getDuration());
        this.goBackTo(this.m_model.getDuration());
    }
    private handleCurrentSim = (event) => {
        this.goToCurrentSim();
        this.m_view.getTimeView().changeTimeBarToSlider();
        this.handleTimeBarSlider(this.m_model.getTime());
        this.goBackTo(this.m_model.getTime());
    }
    private goToCurrentSim() {
        this.m_view.showCurrntSimBtn(false);
        this.m_view.setSimulationNumberText(0);
        this.m_model.goToCurrentSimulation();
    }
    protected start() {
        this.m_model.setStatus(ClientGameStatus.running);
        this.m_view.getTimeView().changeSliderToTimeBar();
        this.m_view.getMenuView().showHistory(false);
        this.goToCurrentSim();
    }

    protected stop() {
        this.m_model.setStatus(ClientGameStatus.paused);
        this.m_view.getTimeView().changeTimeBarToSlider();
        this.handleTimeBarSlider();
        if (this.m_view.getMenuView())
            this.m_view.getMenuView().showHistory(true);
    }
    protected reset(p_data: {
        t: number,
        s: { c: number, s: number, v: number, o: number, newScore: number }, i: {},
        o: { e: number, h: number, a: number, g: number }[], d: {}
    }) {
        this.goToCurrentSim();
        this.m_model.setStatus(ClientGameStatus.paused);
        this.m_model.reset(p_data);
        this.m_view.getMapView().update(p_data.o);
        this.m_view.getMenuView().update(p_data);
        this.m_view.getTimeView().update(p_data.t);
        this.handleTimeBarSlider();

        var decisions: { role: string, type: string, value: number }[] = [];
        for (var role of this.m_model.getScenario().roles) {
            for (var decision of role.m_decisions) {
                var dec: { role: string, type: string, value: number } = { role: role.m_name, type: decision.m_id, value: p_data.d[role.m_name][decision.m_id] };
                decisions.push(dec);
            }
        }
        this.onDecisionUpdate(decisions);

        this.m_view.getMenuView().getDecView().updateAllValues(p_data.d);
        this.m_view.getMenuView().getDecView().updateDecSliders(p_data.d);
        this.stop();
    }

    private onDecisionUpdate = (p_decisions: { role: string, type: string, value: number }[]) => {
        this.m_model.updateDecisions(p_decisions);
        this.m_view.getMenuView().changeDecisions(this.m_model.getCurrentDecisions());
    }
    private handleSocialScore = () => {
        this.m_view.openDialog(DialogKeys.ScoreDialog, this.m_model.getScoreDialogData());
    }
    private handleEconomicalScore = () => {
        this.m_view.openDialog(DialogKeys.ScoreDialog, this.m_model.getScoreDialogData());
    }
    private handleEnvironmentalScore = () => {
        this.m_view.openDialog(DialogKeys.ScoreDialog, this.m_model.getScoreDialogData());
    }

    //Handler for a new score
    private handleNewScore = () => {
        this.m_view.openDialog(DialogKeys.ScoreDialog, this.m_model.getScoreDialogData());
    }
    protected onTick = (p_data: {
        t: number, s: { c: number, s: number, v: number, o: number, newScore: number }, i: {},
        o: { e: number, h: number, a: number, g: number }[], d:
        { role: string, type: string, value: number }[], dt: number
    }) => {
        this.m_connection.sendTickReceivedToServer({ t: p_data.t, w: this.m_connection.getWorldID(), dt: p_data.dt });
        var date = new Date();
        var time = date.getTime();
        console.log("Tick received deltaTime: " + (time - p_data.dt) + " datenow: " + date + " ticksent: " + p_data.dt);
        this.m_view.getMapView().update(p_data.o);
        this.m_view.getMenuView().update(p_data);
        this.m_model.tick(p_data.t, p_data);
        if (this.m_model.getStatus() == ClientGameStatus.running) {
            this.m_view.getTimeView().update(p_data.t);
        } else {
            this.m_view.getTimeView().updateDate(p_data.t);
            this.handleTimeBarSlider();
        }

        if (p_data.d.length > 0) {//If decisions have changed
            this.onDecisionUpdate(p_data.d);
        }
        this.m_view.updateScoreDialog();

    }
    private onTimeChange = (p_data: {
        status: ClientGameStatus, data: {
            t: number,
            s: { c: number, s: number, v: number, o: number, newScore: number }, i: {},
            o: { e: number, h: number, a: number, g: number }[], d: {}
        }
    }) => {
        switch (p_data.status) {
            case ClientGameStatus.running:
                this.start();
                break;
            case ClientGameStatus.paused:
                this.stop();
                break;
            case ClientGameStatus.reset:
                this.reset(p_data.data);
                break;
        }
    }
    protected onConnectionReady = () => {
        //super.onConnectionReady();
        console.log("con ready");
        var tmp = this.m_model.getProfile();
        this.m_connection.sendInitToServer(this.m_model.getProfile());
        this.m_connection.listenToTickEvent(this.onTick);
        this.m_connection.listenToTimeEvent(this.onTimeChange);
        this.m_connection.listenToFinishEvent(this.onFinish);
    }
    protected abstract finish();
}
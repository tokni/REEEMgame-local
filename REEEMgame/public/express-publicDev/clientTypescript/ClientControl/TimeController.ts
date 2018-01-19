import { Connection } from "./Connection"
import { FacilitatorView } from "../ClientView/FacilitatorView"
import { FacilitatorMainScreenView } from "../ClientView/FacilitatorMainScreenView"

export class TimeController {
    private m_connection: Connection;
    private m_view: FacilitatorView | FacilitatorMainScreenView;

    constructor(p_connection: Connection, p_view: FacilitatorView) {
        this.m_connection = p_connection;
        this.m_view = p_view;
    }
    
    public resetButtonPress = () => {
        console.log("ResetButtonPress");
        this.m_connection.sendTimeToServer(-10);
    }
    public startButtonPress = () => {
        console.log("StartButtonPress");
        this.m_connection.sendTimeToServer(1);
    }
    public stopButtonPress = () => {
        console.log("StopButtonPress");
        this.m_connection.sendTimeToServer(0);
    }
    public speedButtonPress = (e) => {
        console.log("SpeedButtonPress");
        this.m_connection.sendTimeToServer(e.data.speed);
    }
    public oneTickButtonPress = () => {
        console.log("oneTickButtonPress");
        this.m_connection.sendTimeToServer(-1);
    }
}
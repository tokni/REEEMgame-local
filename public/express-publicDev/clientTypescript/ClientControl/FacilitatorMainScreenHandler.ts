declare var $: any;
import io from 'socket.io'
import { MainFacilitatorScreenUpdater } from "../ClientView/MainFacilitatorScreenUpdater"
import { TimeHandler } from "./TimeHandler"

export class FacilitatorMainScreenHandler {
    private m_socket;
    private static ms_instance: FacilitatorMainScreenHandler; 
    private m_facilitatorMainScreenUpdater: MainFacilitatorScreenUpdater;
    private modelRunning: boolean;
    private m_conn = false;

    public constructor() {
        this.m_facilitatorMainScreenUpdater = new MainFacilitatorScreenUpdater(this.m_socket);
        this.m_socket.on("connect", this.handleConnect);
    }
    public getConn() {
        return this.m_conn;
    }
    handleConnect = () => {
        this.m_conn = true;
    }
    public static getInstance(): FacilitatorMainScreenHandler {
        if (FacilitatorMainScreenHandler.ms_instance)
            return FacilitatorMainScreenHandler.ms_instance;
        else {
            FacilitatorMainScreenHandler.ms_instance = new FacilitatorMainScreenHandler();
            return FacilitatorMainScreenHandler.ms_instance;
        }
    }
    
    public handleInit = (event): void => {
        var worldID: number = event.data.worldID;
        var status = event.data.status;
        var timeHandler: TimeHandler = new TimeHandler(worldID, status, this.m_socket, this.m_facilitatorMainScreenUpdater);
        this.m_facilitatorMainScreenUpdater.updateButtons(worldID, status);
        $("#startButton" + worldID).on('click', { worldID: worldID }, timeHandler.startTime);
        $("#stopButton" + worldID).on('click', { worldID: worldID }, timeHandler.stopTime);
        $("#reset" + worldID).on('click', { worldID: worldID }, timeHandler.resetTime);       
        $("#fast" + worldID).on('click', { worldID: worldID }, timeHandler.fastForward);      
        $("#fullspeed" + worldID).on('click', { worldID: worldID }, timeHandler.fullspeed);     
        this.m_facilitatorMainScreenUpdater.addWorld(worldID);
    }
    public copyLink = (event): void => {
        var link: string = event.data.link;
        console.log("copy " + link);
        //Create temporary input for link
        var $temp = $("<input>");
        $("body").append($temp);
        $temp.val(link).select();
        document.execCommand("copy");
        $temp.remove(); //remove temp input again
    }
}
import {ClientModel} from "../../clientModel/ClientModel"

declare var $: any;

export class Time {
    private m_monthNames: String[] = ["June", "July", "August", "September", "October", "November", "December", "January", "February", "March", "April", "May"];
    private m_startYear = 2017;
    private m_startMonth = 6;
    private m_model: ClientModel;

    constructor(p_model: ClientModel, p_startYear?, p_startMonth?) {
        if (p_startYear)
            this.m_startYear = p_startYear;
        console.log("C Time");
        this.m_model = p_model;
        this.update(p_model.getTime());
    }
    public update(p_data) {
        this.updateDate(p_data);
        $('.dateProgressValue').width((p_data / this.m_model.getDuration()) * 100 + "%");
    }
    public changeTimeBarToSlider() {
        $("#progressBarSlider").css("display", "block");
        $("#progressBar").css("display", "none");
       
    }
    public updateDate(p_time: number) {
        var year = this.m_startYear + Math.floor((p_time + this.m_startMonth - 1) / 12);
        var month = Math.floor((p_time % 12));
        var monthName = this.m_monthNames[month];
        $('#month').html(monthName + "  ");
        $('#year').html(year + "  ");
    }
    public changeSliderToTimeBar() {
        $("#progressBarSlider").css("display", "none");
        $("#progressBar").css("display", "block");
        this.update(this.m_model.getTime());
    }
    public setStartYear(p_startYear) {
        this.m_startYear = p_startYear;
    }
}
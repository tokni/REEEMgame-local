declare var $: any;
export class ScoreView {

    constructor() {
    }
    public update(p_data) {
        //console.log("updating ScoreView: " + JSON.stringify(p_data));
        $("#scoreHeading").html("Score: " + Math.round(p_data.c));
        $("#socialScore").text("Social: " + Math.round(p_data.s));
        $("#economicScore").text("Economic: " + Math.round(p_data.o));
        $("#environmentalScore").text("Environmental: " + Math.round(p_data.v));
    }


}
declare var $: any;
export class ProfileView {
    constructor() {
        console.log("C ProfileView");
    }
    public update(p_profile) {
        console.log("updating Profile: " + JSON.stringify(p_profile));
        $("#roleButton").html(p_profile.currentRole);
    }
}
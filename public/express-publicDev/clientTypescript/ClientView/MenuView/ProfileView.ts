declare var $: any;
export class ProfileView {
    constructor() {
    }
    public update(p_profile) {
        $("#roleButton").html(p_profile.currentRole);
    }
}
import { FacilitatorModel } from "../../clientModel/FacilitatorModel"
declare var $: any;

export class ParticipantsListView {
    private m_model: FacilitatorModel;

    constructor(p_model: FacilitatorModel) {
        this.m_model = p_model;
        this.update();
    }
    public update() {
        var onPart = $("#onlineParticipants");
        onPart.empty();
        for (var profile1 of this.m_model.getOnlineProfiles()) {
            var div = this.createChangeProfileButton(profile1);
            this.createChangeProfileDropdown(profile1, div);
        }

        var onPart = $("#offlineParticipants");
        onPart.empty();
        for (var p of this.m_model.getOfflineProfiles()) {
            this.createOfflineParticipant(p);
        }
    }

    createChangeProfileDropdown(p_profile: { nickName: string, currentRole: string }, p_buttonDiv) {
        if (p_buttonDiv) {
            var ul: HTMLUListElement = document.createElement("ul");
            ul.classList.add("dropdown-menu");
            ul.classList.add("role-dropdown");
            ul.id = "dropdown" + p_profile.nickName;
            ul.style.zIndex = "10000";
            p_buttonDiv.appendChild(ul);
            for (var role of this.m_model.getScenario().roles) {
                var li: HTMLLIElement = document.createElement("li");
                ul.appendChild(li);
                var nickShort = p_profile.nickName.replace(/\s+|\@|\./g, '');
                li.id = "listitem" + role.m_name + nickShort;
                var btn: HTMLButtonElement = document.createElement("button");
                li.appendChild(btn);
                btn.id = "role" + role.m_name + nickShort;
                btn.classList.add("dropdownButton");
                btn.innerHTML = "Change Role to " + role.m_name;
                if (p_profile.currentRole == role.m_name) {
                    li.style.display = 'none';
                }
            }
        }
    }
    createChangeProfileButton(p_profile: { nickName: string, pin: any, currentRole: string }) {
        var div: HTMLDivElement = document.createElement("div");
        if (document.getElementById("onlineParticipants")) {
            document.getElementById("onlineParticipants").appendChild(div);
            console.log("Nick: " + p_profile.nickName);
            var nickShort = p_profile.nickName.replace(/\s+|\@|\./g, '');
            console.log("Nick: " + nickShort);
            div.id = "div_participant_" + nickShort;
            div.classList.add("dropdown");

            var button: HTMLButtonElement = document.createElement("button");
            div.appendChild(button);
            button.classList.add("btn");
            button.classList.add("dropdown-toggle");
            button.classList.add("roledropdown");
            button.type = 'button';
            button.setAttribute("data-toggle", 'dropdown');
            button.id = nickShort;
            button.innerHTML = p_profile.nickName + " " + p_profile.currentRole;
            return div;
        }
    }
    createOfflineParticipant(p_profile: { nickName: string, pin: any }) {
        if (document.getElementById("offlineParticipants")) {
            var div: HTMLDivElement = document.createElement("div");
            document.getElementById("offlineParticipants").appendChild(div);
            div.id = "div_participant_" + p_profile.nickName;
            div.innerHTML = p_profile.nickName + " offline";
        }
    }
}
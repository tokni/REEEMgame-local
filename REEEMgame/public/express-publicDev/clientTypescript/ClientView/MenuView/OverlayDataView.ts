declare var $: any;

export class OverlayDataView {
    private m_currentRole;
    constructor() {
        console.log("C OverlayDataView");
        //this.m_currentRole = p_currentRole;
    }
    public update(p_data, p_role) {
        if (p_role.m_name != 'Coordinator') {
            for (var indicator of p_role.m_indicators) {
                var tmp = parseInt(indicator.m_decimals);
                $("#" + indicator.m_id).html(indicator.m_name + ": " + Math.round(p_data[indicator.m_id] * Math.pow(10, parseInt(indicator.m_decimals))) / Math.pow(10, parseInt(indicator.m_decimals)) + " " + indicator.m_unit);
            }
        }
    }
    public updateForNewRole(p_role) {
        $("#dataContent").empty();
        var dataContent = document.getElementById('dataContent');
        for (var indicator of p_role.m_indicators) {
            var ul: HTMLUListElement = document.createElement("ul");
            dataContent.appendChild(ul);
            var li: HTMLLIElement = document.createElement("li");
            ul.appendChild(li);
            
            var btn: HTMLButtonElement = document.createElement("button");
            li.appendChild(btn);
            btn.id = indicator.m_id;
            btn.innerHTML = indicator.m_name;
            btn.classList.add('menuButton');
            btn.setAttribute('title', indicator.m_description);
        }
        
    }
}
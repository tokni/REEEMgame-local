import {OverlayDataView} from "./MenuView/OverlayDataView"

export class BrowserMenuView {
    private m_data: OverlayDataView

    constructor() {
        this.m_data = new OverlayDataView();//
    }
    public update(p_data) {
        //this.m_data.update(p_data.indicators[this.m_currentRole.m_name], this.m_currentRole);
    }
    
}
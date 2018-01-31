import { MenuView } from "./MenuView"
import { ParticipantsListView } from "./ParticipantsListView"
import { FacilitatorModel } from "../../clientModel/FacilitatorModel"
 
export class FacilitatorMenuView extends MenuView{

    private m_participants: ParticipantsListView;
    constructor(p_currentRole, p_model: FacilitatorModel, p_profiles, p_scoreHistory) {
        super(p_currentRole, p_model, p_profiles, p_scoreHistory);
        this.m_participants = new ParticipantsListView(p_model);
    }
    public getParticipantsView(): ParticipantsListView {
        return this.m_participants;
    }
}
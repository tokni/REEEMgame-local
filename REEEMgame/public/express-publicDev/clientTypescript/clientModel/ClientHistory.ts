import { ClientIndicator } from "../ClientScenario"
export class ClientHistory {
    public m_indicatorHistory: {}[];
    //public m_overlayHistory: { emisionsCO2: number, housingTemp: number, airTemp: number, gnp: number }[][];
    public m_overlayHistory: ClientIndicator[][];
}

export class ClientGameHistory extends ClientHistory {
    public m_scoreHistory: { combined: number[], social: number[], economic: number[], environmental: number[] };
    public m_decisionHistory: {}[];
    public m_decisionMadeHistory: { role: string, type: string, value: number }[][];
}
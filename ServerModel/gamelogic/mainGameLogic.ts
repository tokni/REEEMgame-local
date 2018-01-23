import { AvailableData, AirTemperature, ComfortableHousingTemperature, CO2Emissions, GDPperPerson } from './availableData';
import { EnergySubsidies, InvestmentInRenewables } from './decision';
import { SocialKPI, EnvironmentalKPI, EconomicKPI, CombinedKPI } from './keyPerformanceIndicators';
import { overlayInit } from '../Overlay'

export class GameLogic {

    private m_overlayData: Map<string, Array<AvailableData>>;
    
    private airTemperature: Array<AirTemperature> = [];
    private comfortableHousingTemperature: Array<ComfortableHousingTemperature> = [];
    private co2Emissions: Array<CO2Emissions> = [];
    private gdpPerPerson: Array<GDPperPerson> = [];

    private energySubsidies: Array<EnergySubsidies> = [];
    private investmentInRenewables: Array<InvestmentInRenewables> = [];

    private socialKPI = new SocialKPI();
    private environmentalKPI = new EnvironmentalKPI();
    private economicKPI = new EconomicKPI();
    private combinedKPI = new CombinedKPI();
    private m_numberOfRoles;

    constructor(p_numRoles) {
        this.m_numberOfRoles = p_numRoles;
        for (var organizationID = 0; organizationID <= p_numRoles-1; organizationID++) {
            this.airTemperature.push(new AirTemperature(organizationID));
            this.comfortableHousingTemperature.push(new ComfortableHousingTemperature(organizationID));
            this.co2Emissions.push(new CO2Emissions(organizationID));
            this.gdpPerPerson.push(new GDPperPerson(organizationID));
            this.energySubsidies.push(new EnergySubsidies(organizationID));
            this.investmentInRenewables.push(new InvestmentInRenewables(organizationID));
        }
        this.ResetWorld();
    }

    ResetWorld() {
        for (var organizationID = 0; organizationID <= this.m_numberOfRoles-1; organizationID++) {
            this.airTemperature[organizationID].reset();
            this.comfortableHousingTemperature[organizationID].reset();
            this.co2Emissions[organizationID].reset();
            this.gdpPerPerson[organizationID].reset();
            this.energySubsidies[organizationID].reset();
            this.investmentInRenewables[organizationID].reset();
        }
        this.socialKPI.reset();
        this.environmentalKPI.reset();
        this.economicKPI.reset();
        this.combinedKPI.reset();
        
        this.airTemperature[0].addManualValues([17.3, 19.6, 19.3, 15.9, 11.0, 5.6, 1.3, -0.6, 0.4, 3.9, 8.8, 13.6]);
        
        this.airTemperature[1].addManualValues([14.6, 16.5, 16.5, 14.2, 10.5, 5.9, 3.9, 2.1, 2.1, 5.0, 7.6, 11.7]);
        this.comfortableHousingTemperature[0].addManualValues([30]);
        this.comfortableHousingTemperature[1].addManualValues([70]);
        var tmp2 = overlayInit.features[2].properties.emisionsCO2.value
        this.co2Emissions[0].addManualValues([overlayInit.features[2].properties.emisionsCO2.value]);
        this.co2Emissions[1].addManualValues([overlayInit.features[21].properties.emisionsCO2.value]);
        this.gdpPerPerson[0].addManualValues([overlayInit.features[2].properties.GNP]);
        this.gdpPerPerson[1].addManualValues([overlayInit.features[21].properties.GNP]);

        //month 0
        this.energySubsidies[0].decisionValuePush = 0; this.investmentInRenewables[0].decisionValuePush = 0;
        this.energySubsidies[1].decisionValuePush = 0; this.investmentInRenewables[1].decisionValuePush = 0;

        this.socialKPI.CalculateScore(0, this.comfortableHousingTemperature);
        this.environmentalKPI.CalculateScore(0, this.co2Emissions);
        this.economicKPI.CalculateScore(0, this.gdpPerPerson);
        this.combinedKPI.CalculateScore(0, this.socialKPI, this.environmentalKPI, this.economicKPI);
    }

    CalculateMonthValues(fromMonth: number, toMonth: number, energySubsidiesDecision: Array<number>, investmentInRenewablesDecision: Array<number>) {
        for (var month = fromMonth; month <= toMonth; month++) {
            for (var orgID = 0; orgID <= 1; orgID++) {
                this.energySubsidies[orgID].decisionValuePush = energySubsidiesDecision[orgID];
                this.investmentInRenewables[orgID].decisionValuePush = investmentInRenewablesDecision[orgID];
                this.airTemperature[orgID].CalculateValue(month, this.environmentalKPI);
                this.gdpPerPerson[orgID].CalculateValue(month, this.energySubsidies[orgID], this.investmentInRenewables[orgID], this.comfortableHousingTemperature[orgID]);
                this.comfortableHousingTemperature[orgID].CalculateValue(month, this.energySubsidies[orgID], this.gdpPerPerson[orgID], this.airTemperature[orgID]);
                this.co2Emissions[orgID].CalculateValue(month, this.energySubsidies[orgID], this.investmentInRenewables[orgID]);
            }
            this.socialKPI.CalculateScore(month, this.comfortableHousingTemperature);
            this.environmentalKPI.CalculateScore(month, this.co2Emissions);
            this.economicKPI.CalculateScore(month, this.gdpPerPerson);
            this.combinedKPI.CalculateScore(month, this.socialKPI, this.environmentalKPI, this.economicKPI);

        }
        return this.combinedKPI.GetMonthsScore(toMonth)
    }
    getOverlayData = (p_roleName, p_dataID, p_month) => {
        var player;
        if (p_roleName == 'East')
            player = 0;
        else if (p_roleName = 'West')
            player = 1;
        else return;
        if (p_dataID == 'CO2Emission')
            return this.getCO2EmissionsAtMonth(player, p_month);
        else if (p_dataID == 'comfort')
            return this.getHousingTempAtMonth(player, p_month);
        else if (p_dataID == 'airtemperature')
            return this.getAirTempAtMonth(player, p_month);
        else if (p_dataID == 'gdp')
            return this.getGnpAtMonth(player, p_month);       
    }
    getCO2EmissionsAtMonth(p_player, p_month): any {
        return this.co2Emissions[p_player].getMonthsValue(p_month);
    }
    getHousingTempAtMonth(p_player, p_month): any {
        return this.comfortableHousingTemperature[p_player].getMonthsValue(p_month);
    }
    getAirTempAtMonth(p_player, p_month): any {
        return this.airTemperature[p_player].getMonthsValue(p_month);
    }
    getGnpAtMonth(p_player, p_month): any {
        return this.gdpPerPerson[p_player].getMonthsValue(p_month);
    }
    getSocialKPIAt(p_month) {
        return this.socialKPI.GetMonthsScore(p_month);
    }
    getEconomicKPIAt(p_month) {
        return this.economicKPI.GetMonthsScore(p_month);
    }
    getEnvironmentalKPIAt(p_month) {
        return this.environmentalKPI.GetMonthsScore(p_month);
    }
    getCombinedKPIAt(p_month) {
        return this.combinedKPI.GetMonthsScore(p_month);
    }
    getScoreHistory(): { combined: number[], social: number[], economic: number[], environmental: number[]}  {
        var history: { combined: number[], social: number[], economic: number[], environmental: number[] } = {
            combined: this.combinedKPI.getScore(),
            social: this.socialKPI.getScore(),
            economic: this.economicKPI.getScore(),
            environmental: this.environmentalKPI.getScore()
        } 
        return history;
    }
    
}
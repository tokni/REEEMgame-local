import { AvailableData, AirTemperature, ComfortableHousingTemperature, CO2Emissions, GDPperPerson } from './availableData';
import { EnergySubsidies, InvestmentInRenewables, NewDecision } from './decision';
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

    //For a new decision
    private newDecision: Array<NewDecision> = [];

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
            //Initilizing the new decision
            this.newDecision.push(new NewDecision(organizationID));
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
            //Reset new decision
            this.newDecision[organizationID].reset();
        }
        this.socialKPI.reset();
        this.environmentalKPI.reset();
        this.economicKPI.reset();
        this.combinedKPI.reset();
        var eastTemp = [];
        var westTemp = [];
        for (var i = 0; i < 12;i++) {
            var month = (i+5) % 12;//Start with June
            eastTemp.push(overlayInit.features[2].properties.temp[month])
            westTemp.push(overlayInit.features[21].properties.temp[month])
        }
        this.airTemperature[0].addManualValues(eastTemp);
        this.airTemperature[1].addManualValues(westTemp);
        this.comfortableHousingTemperature[0].addManualValues([overlayInit.features[2].properties.housing]);
        this.comfortableHousingTemperature[1].addManualValues([overlayInit.features[21].properties.housing]);
        var tmp2 = overlayInit.features[2].properties.emisionsCO2.value
        this.co2Emissions[0].addManualValues([overlayInit.features[2].properties.emisionsCO2.value]);
        this.co2Emissions[1].addManualValues([overlayInit.features[21].properties.emisionsCO2.value]);
        this.gdpPerPerson[0].addManualValues([overlayInit.features[2].properties.GNP]);
        this.gdpPerPerson[1].addManualValues([overlayInit.features[21].properties.GNP]);

        //month 0
        this.energySubsidies[0].decisionValuePush = 0; this.investmentInRenewables[0].decisionValuePush = 0;
        this.energySubsidies[1].decisionValuePush = 0; this.investmentInRenewables[1].decisionValuePush = 0;
        //Add initial values of the new decision
        this.newDecision[0].decisionValuePush = 0;
        this.newDecision[1].decisionValuePush = 0;

        this.socialKPI.CalculateScore(0, this.comfortableHousingTemperature);
        this.environmentalKPI.CalculateScore(0, this.co2Emissions);
        this.economicKPI.CalculateScore(0, this.gdpPerPerson);
        this.combinedKPI.CalculateScore(0, this.socialKPI, this.environmentalKPI, this.economicKPI);
    }

    CalculateMonthValues(fromMonth: number, toMonth: number, energySubsidiesDecision: Array<number>, investmentInRenewablesDecision: Array<number>, aNewDecision?:Array<number>) {
        for (var month = fromMonth; month <= toMonth; month++) {
            for (var orgID = 0; orgID <= 1; orgID++) {
                this.energySubsidies[orgID].decisionValuePush = energySubsidiesDecision[orgID];
                this.investmentInRenewables[orgID].decisionValuePush = investmentInRenewablesDecision[orgID];
                //add the value of the new decision
                if (aNewDecision) {
                    this.newDecision[orgID].decisionValuePush = aNewDecision[orgID];
                    //this.gdpPerPerson[orgID].CalculateValue(month, this.energySubsidies[orgID], this.investmentInRenewables[orgID], this.comfortableHousingTemperature[orgID], this.newDecision[orgID]);
                }
                this.gdpPerPerson[orgID].CalculateValue(month, this.energySubsidies[orgID], this.investmentInRenewables[orgID], this.comfortableHousingTemperature[orgID]);
                this.airTemperature[orgID].CalculateValue(month, this.environmentalKPI);
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
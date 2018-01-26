import { EnergySubsidies, InvestmentInRenewables, NewDecision } from './decision';
import { EnvironmentalKPI } from './keyPerformanceIndicators';

export abstract class AvailableData {

    public _value: Array<number> = [];
    protected _currentMonth: number = -1;
    protected m_name;

    constructor(public organizationID: number) {
    }

    get currentMonth() {
        return this._currentMonth;
    }

    set valuePush(newValue: number) {
        this._currentMonth++;
        this._value.push(newValue);
    }
    getName() {
        return this.m_name;
    }

    public addManualValues(manualValues: Array<number>) {
        for (var manualValue of manualValues) {
            this.valuePush = manualValue;
        }
    }

    getMonthsValue(month: number) {
        if (month >= 0 && month <= this._currentMonth) {
            return this._value[month];
        } else {
            return 0;
        }
    }

    reset() {
        this._value = [];
        this._currentMonth = -1;
    }
    getValue(): number[] {
        return this._value;
    }
}

export class AirTemperature extends AvailableData {
    protected m_name = "AirTemperature";
    private baseAirTemperature: number = 17;
    private environmentalImpactOnAirTemperature: number = 0.08;
    private evironmentalImpactConvergenceThreshold: number = 80;

    public CalculateValue(month: number, environmentalKPI: EnvironmentalKPI) {
        let fromMonth = month - 12;
        if (fromMonth >= 0) {
            let tempTwelveMonthsAgo = this.getMonthsValue(fromMonth);
            let runningAverageEnvironmentalScore = environmentalKPI.GetRunningAverage(fromMonth, month - 1);
            let calculatedValue = tempTwelveMonthsAgo + (tempTwelveMonthsAgo - this.baseAirTemperature)
                * (this.evironmentalImpactConvergenceThreshold - runningAverageEnvironmentalScore) / 100
                * this.environmentalImpactOnAirTemperature;
            this.valuePush = calculatedValue;
        }
    }

    public GetAverage(toMonth, months) {
        let fromMonth = toMonth - months;
        if (toMonth - months < 0) {
            fromMonth = 0;
        };
        let totalTemperature = 0;
        for (var month = fromMonth; month <= toMonth; month++) {
            totalTemperature += this.getMonthsValue(month);
        }
        let averageTemperature = 0;
        if (fromMonth <= toMonth) {
            averageTemperature = totalTemperature / (toMonth - fromMonth + 1);
        }
        return averageTemperature;
    }
}

export class ComfortableHousingTemperature extends AvailableData {
    protected m_name = "ComfortableHousingTemperature";

    private baseComfortableHousingTemp: number = 17;
    private maxDiscomfortDifference: number = 17;
    private subsidiesImpactOnComfort: number = 1;
    private gdpImpactOnComfort: number = 0.004;
    private comfortFactorImpactOnComfort: number = 0.3;
    private maxRunningAverageMonths: number = 5;
    private maxRunningAverageMonths2: number = 12;
    private historicImpactOnComfort: number = 0.6;

    public _comfortFactor: Array<number> = [];

    CalculateValue(month: number, energySubsidies: EnergySubsidies, gdpPerPerson: GDPperPerson, airTemperature: AirTemperature) {
        let calculatedValue = 0;
        let previousMonthsValue = this.getMonthsValue(month - 1);
        let comfortFactor = this.CalculateComfortFactor(month, energySubsidies, gdpPerPerson);
        let averageTemperature = airTemperature.GetAverage(month, this.maxRunningAverageMonths);
        let differenceFromBase = Math.abs(airTemperature.getMonthsValue(month) - this.baseComfortableHousingTemp);
        differenceFromBase = differenceFromBase > this.maxDiscomfortDifference ? this.maxDiscomfortDifference : differenceFromBase;
        let comfortFactorImpact = this.comfortFactorImpactOnComfort * comfortFactor;
        let historicImpact = this.historicImpactOnComfort * previousMonthsValue;
        let differenceFromBaseImpact = 100 * (1 - this.comfortFactorImpactOnComfort - this.historicImpactOnComfort) * (this.maxDiscomfortDifference - differenceFromBase) / this.maxDiscomfortDifference;
        calculatedValue = comfortFactorImpact + historicImpact + differenceFromBaseImpact;
        calculatedValue = calculatedValue > 100 ? 100 : calculatedValue < 0 ? 0 : calculatedValue;
        this.valuePush = calculatedValue;
        this._comfortFactor.push(comfortFactor);
    }

    private CalculateComfortFactor(month: number, energySubsidies: EnergySubsidies, gdpPerPerson: GDPperPerson) {
        let fromMonth = ((month - 1) > this.maxRunningAverageMonths) ? (month - 1) - this.maxRunningAverageMonths : 0;
        let runningAverageSubsidies = energySubsidies.GetRunningAverage(fromMonth, month);
        let subsidiesImpact = runningAverageSubsidies * this.subsidiesImpactOnComfort;
        let gdpThisMonth = gdpPerPerson.getMonthsValue(this.currentMonth+1);
        let gdpImpact = gdpThisMonth * this.gdpImpactOnComfort;
        let comfortFactor = subsidiesImpact + gdpImpact;
        comfortFactor = comfortFactor > 100 ? 100 : comfortFactor < 0 ? 0 : comfortFactor;
        return comfortFactor;
    }

    public GetPastMinimum(fromMonth: number, toMonth: number) {
        if (fromMonth >= 0 && fromMonth <= this._currentMonth && toMonth >= 0
            && toMonth <= this._currentMonth && fromMonth <= toMonth) {
            let minValue = 998;
            for (var month = fromMonth; month <= toMonth; month++) {
                if (this._value[month] < minValue) {
                    minValue = this._value[month];
                }
            }
            return minValue;
        } else {
            return 999;
        }
    }
}

export class CO2Emissions extends AvailableData {
    protected m_name = "CO2Emissions";
    private subsidiesImpactOnNextYearsCO2: number = 0.000007;
    private renewableInvestmentsImpactOnNextYearsCO2: number = -0.0002;
    private monthlyCO2growth: number = 0.0015;

    CalculateValue(month: number, energySubsidies: EnergySubsidies, investmentInRenewables: InvestmentInRenewables) {
        let co2EmissionsLastMonth = this.getMonthsValue(month - 1);
        let energySubsidiesThisMonth = energySubsidies.GetMonthsDecision(month);
        let investmentInRenewableThisMonth = investmentInRenewables.GetMonthsDecision(month);
        let co2Value = co2EmissionsLastMonth * (1 + energySubsidiesThisMonth * this.subsidiesImpactOnNextYearsCO2
            + investmentInRenewableThisMonth * this.renewableInvestmentsImpactOnNextYearsCO2 + this.monthlyCO2growth);
        this.valuePush = co2Value;
    }
}

export class GDPperPerson extends AvailableData {
    protected m_name = "GDPperPerson";

    private subsidiesImpactOnNextYearsGDP: number = -0.00002;
    private renewInvestImpactOnNextYearsGDP: number = -0.00002;
    private sixMonthMinComfortImpactOnGDP: number = 0.0001;
    private sixMonthMinComfortImpactOnGDPthreshold: number = 80;
    private maxPastMonths: number = 6;
    private defaultGrowth: number = 0.002;

    //New constant for the example with new decision
    private newDecisionImpactOnNextYearGDP: number = -0.000025;

    CalculateValue(month: number, energySubsidies: EnergySubsidies, investmentInRenewables: InvestmentInRenewables,
        comfortableHousingTemperature: ComfortableHousingTemperature, newDecision?: NewDecision) {
        let gdpLastMonth = this.getMonthsValue(month - 1);
        let energySubsidiesLastMonth = energySubsidies.GetMonthsDecision(month - 1);
        let investmentInRenewableLastMonth = investmentInRenewables.GetMonthsDecision(month - 1);
        let fromMonth = ((month) > this.maxPastMonths) ? (month) - this.maxPastMonths : 0;
        let sixMonthMinComfort = comfortableHousingTemperature.GetPastMinimum(fromMonth, month - 1);

        //Example of how the new decision could influence this indicator
        //let newDecisionLastMonth = newDecision.GetMonthsDecision(month - 1);        
        //let gdpValue = gdpLastMonth * (1 + newDecisionLastMonth * this.newDecisionImpactOnNextYearGDP
        //    + investmentInRenewableLastMonth * this.renewInvestImpactOnNextYearsGDP
        //    + (sixMonthMinComfort - this.sixMonthMinComfortImpactOnGDPthreshold) * this.sixMonthMinComfortImpactOnGDP)
        //    * (1 + this.defaultGrowth);        

        let gdpValue = gdpLastMonth * (1 + energySubsidiesLastMonth * this.subsidiesImpactOnNextYearsGDP
            + investmentInRenewableLastMonth * this.renewInvestImpactOnNextYearsGDP
            + (sixMonthMinComfort - this.sixMonthMinComfortImpactOnGDPthreshold) * this.sixMonthMinComfortImpactOnGDP)
            * (1 + this.defaultGrowth);
        this.valuePush = gdpValue;
    }
}
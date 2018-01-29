import { ComfortableHousingTemperature, CO2Emissions, GDPperPerson } from './availableData';

export class KeyPerformanceIndicators {

    protected _score: Array<number> = [];
    protected _currentMonth: number = -1;
    protected _multiplier = 50;

    constructor() {
    }

    get currentMonth() {
        return this._currentMonth;
    }

    set scorePush(newScore: number) {
        this._currentMonth++;
        this._score.push(newScore);
    }

    GetMonthsScore(month: number) {
        if (month >= 0 && month <= this._currentMonth) {
            return this._score[month];
        } else {
            return 0;
        }
    }

    GetRunningAverage(fromMonth: number, toMonth: number) {
        if (fromMonth >= 0 && fromMonth <= this._currentMonth && toMonth >= 0
            && toMonth <= this._currentMonth && fromMonth <= toMonth) {
            let total = 0;
            for (var month = fromMonth; month <= toMonth; month++) {
                total += this._score[month];
            }
            return total / (toMonth - fromMonth + 1);
        } else {
            return 0;
        }
    }

    reset() {
        this._score = [];
        this._currentMonth = -1;
    }
    getScore(): number[] {
        return this._score;
    }

}

export class SocialKPI extends KeyPerformanceIndicators {

    private benchmark: number = 100;

    CalculateScore(month: number, comfortableHousingTemperature: Array<ComfortableHousingTemperature>) {
        let calculatedSum = 0;
        for (var organizationID = 0; organizationID <= 1; organizationID++) {
            calculatedSum += comfortableHousingTemperature[organizationID].getMonthsValue(month);
        }
        let calculatedScore = calculatedSum / this.benchmark * this._multiplier;
        let score = calculatedScore > 100 ? 100 : (calculatedScore < 0 ? 0 : calculatedScore);
        this.scorePush = score;
    }
}

export class EnvironmentalKPI extends KeyPerformanceIndicators {

    private benchmark: number = 15.5;

    CalculateScore(month: number, co2Emissions: Array<CO2Emissions>) {
        let calculatedSum = 0;
        for (var organizationID = 0; organizationID <= 1; organizationID++) {
            calculatedSum += co2Emissions[organizationID].getMonthsValue(month);
        }
        let calculatedScore = 100 - calculatedSum / this.benchmark * this._multiplier;
        let score = calculatedScore > 100 ? 100 : (calculatedScore < 0 ? 0 : calculatedScore);
        this.scorePush = score;    
    }
}

export class EconomicKPI extends KeyPerformanceIndicators {

    private benchmark: number = 65971;

    CalculateScore(month: number, gdpPerPerson: Array<GDPperPerson>) {
        let calculatedSum = 0;
        for (var organizationID = 0; organizationID <= 1; organizationID++) {
            calculatedSum += gdpPerPerson[organizationID].getMonthsValue(month);
        }
        let calculatedScore = calculatedSum / this.benchmark * this._multiplier;
        let score = calculatedScore > 100 ? 100 : (calculatedScore < 0 ? 0 : calculatedScore); 
        this.scorePush = score;
    }
}

//An example of a new score
export class NewScoreKPI extends KeyPerformanceIndicators {

    private benchmark: number = 50;

    CalculateScore(month: number, co2Emissions: Array<CO2Emissions>, comfortableHousingTemperature: Array<ComfortableHousingTemperature>) {
        let calculatedSum = 0;
        for (var organizationID = 0; organizationID <= 1; organizationID++) {
            calculatedSum += co2Emissions[organizationID].getMonthsValue(month) *2;
            calculatedSum += comfortableHousingTemperature[organizationID].getMonthsValue(month);
            calculatedSum = calculatedSum / 3;
        }
        let calculatedScore = calculatedSum / this.benchmark * this._multiplier;
        let score = calculatedScore > 100 ? 100 : (calculatedScore < 0 ? 0 : calculatedScore);
        this.scorePush = score;
    }
}

export class CombinedKPI extends KeyPerformanceIndicators {

    CalculateScore(month: number, social: SocialKPI, environmental: EnvironmentalKPI, economic: EconomicKPI, newScore?: NewScoreKPI) {
        //Modified combined score to include a new score
        //this.scorePush = (social.GetMonthsScore(month) + environmental.GetMonthsScore(month) + economic.GetMonthsScore(month) + newScore.GetMonthsScore(month)) / 4;
        this.scorePush = (social.GetMonthsScore(month) + environmental.GetMonthsScore(month) + economic.GetMonthsScore(month)) / 3;
    }
}
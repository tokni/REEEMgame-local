import assert = require('assert');
import { SocialKPI, EnvironmentalKPI, EconomicKPI, CombinedKPI } from '../ServerModel/gamelogic/keyPerformanceIndicators';

export function SetAndGetKPI_test() {
    let socialKPI = new SocialKPI();
    assert.ok(-1 === socialKPI.currentMonth, "The initial month is not -1");
    assert.ok(0 === socialKPI.GetMonthsScore(socialKPI.currentMonth), "The score for month -1 is not 0");
    let newScore = 42;
    socialKPI.scorePush = newScore;
    assert.ok(newScore === socialKPI.GetMonthsScore(0), "The decision value received was not the same as the decision value sent");
    assert.ok(0 === socialKPI.currentMonth, "The month after pushing one score is not 0");
    assert.ok(0 === socialKPI.GetMonthsScore(socialKPI.currentMonth + 1), "The score for future months is not 0");
}

export function GetRunningAverageKPI_test() {
    let socialKPI = new SocialKPI();
    socialKPI.scorePush = 5; socialKPI.scorePush = 7; socialKPI.scorePush = 12;

    // not fromMonth >= 0
    assert.ok(0 == socialKPI.GetRunningAverage(-1, 2), "fromMonth<0 should return 0");

    // not fromMonth <= this._currentMonth
    assert.ok(0 == socialKPI.GetRunningAverage(socialKPI.currentMonth + 1, 11), "fromMonth>currentMonth should return 0");

    // not toMonth >= 0
    assert.ok(0 == socialKPI.GetRunningAverage(0, -1), "toMonth<0 should return 0");

    // not toMonth <= this._currentMonth
    assert.ok(0 == socialKPI.GetRunningAverage(0, socialKPI.currentMonth + 1), "toMonth>currentMonth should return 0");

    // not fromMonth <= toMonth)
    assert.ok(0 == socialKPI.GetRunningAverage(1, 0), "fromMonth>toMonth should return 0");

    // normal
    assert.ok(8 == socialKPI.GetRunningAverage(0, 2), "The average should be 8");

    // negative values
    let socialKPI2 = new SocialKPI();
    socialKPI2.scorePush = -5; socialKPI2.scorePush = -7; socialKPI2.scorePush = -12;
    assert.ok(-8 == socialKPI2.GetRunningAverage(0, 2), "The average should be -8");

    // no entries
    let socialKPI3 = new SocialKPI();
    assert.ok(0 == socialKPI3.GetRunningAverage(0, 0), "If there are no values, it should return 0");
}

// SocialKPI CalculateScore(month: number, comfortableHousingTemperature: Array<ComfortableHousingTemperature>)
// EnvironmentalKPI CalculateScore(month: number, co2Emissions: Array<CO2Emissions>)
// EconomicKPI CalculateScore(month: number, gdpPerPerson: Array<GDPperPerson>)

export function CalculateCombinedKPI_test() {
    let social = new SocialKPI();
    let environmental = new EnvironmentalKPI();
    let economic = new EconomicKPI();
    let combinedKPI = new CombinedKPI();

    let month = 0;
    social.scorePush = 24;
    environmental.scorePush = 35;
    economic.scorePush = 40;
    combinedKPI.CalculateScore(month, social, environmental, economic);
    assert.ok(33 === combinedKPI.GetMonthsScore(month), "The combined score calculation is wrong");
}
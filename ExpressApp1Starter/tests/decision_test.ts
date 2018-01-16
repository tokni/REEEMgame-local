import assert = require('assert');
import { EnergySubsidies, InvestmentInRenewables } from '../ServerModel/gamelogic/decision';

export function SetAndGetDecision_test() {
    let organizationID = 1;
    let energySubsidies = new EnergySubsidies(organizationID);

    // month >= 0 AND month <= this.currentMonth
    let newDecision = 42;
    energySubsidies.decisionValuePush = newDecision;
    assert.ok(newDecision === energySubsidies.GetMonthsDecision(0), "The decision value received was not the same as the decision value sent");

    // not month >= 0
    newDecision = 43;
    energySubsidies.decisionValuePush = newDecision;
    assert.ok(0 === energySubsidies.GetMonthsDecision(-1), "The decision value received was not 0 when submitting a decision in a negative month.");

    // not month <= this.currentMonth
    newDecision = 44;
    energySubsidies.decisionValuePush = newDecision;
    assert.ok(0 === energySubsidies.GetMonthsDecision(energySubsidies.currentMonth+1), "The decision value received was not 0 when submitting a decision in a negative month.");
}

export function SetAndGetMultipleDecisions_test() {
    let organizationID = 1;
    let energySubsidies = new EnergySubsidies(organizationID);
    let energySubsidiesDecisionValue = 42;
    energySubsidies.decisionValuePush = energySubsidiesDecisionValue;

    let investmentInRenewables = new InvestmentInRenewables(organizationID);
    let InvestmentInRenewablesDecisionValue = 70;
    investmentInRenewables.decisionValuePush = InvestmentInRenewablesDecisionValue;
    assert.ok(energySubsidiesDecisionValue === energySubsidies.GetMonthsDecision(0), "The decision value received was not the same as the decision value sent");
    assert.ok(InvestmentInRenewablesDecisionValue === investmentInRenewables.GetMonthsDecision(0), "The decision value received was not the same as the decision value sent");
}

export function GetRunningAverage_test() {
    let organizationID = 1;
    let energySubsidies = new EnergySubsidies(organizationID);
    energySubsidies.decisionValuePush = 5; energySubsidies.decisionValuePush = 7; energySubsidies.decisionValuePush = 12;

    // not fromMonth >= 0
    assert.ok(0 == energySubsidies.GetRunningAverage(-1, 2), "fromMonth<0 should return 0");

    // not fromMonth <= this._currentMonth
    assert.ok(0 == energySubsidies.GetRunningAverage(energySubsidies.currentMonth + 1, 11), "fromMonth>currentMonth should return 0");

    // not toMonth >= 0
    assert.ok(0 == energySubsidies.GetRunningAverage(0, -1), "toMonth<0 should return 0");

    // not toMonth <= this._currentMonth
    assert.ok(0 == energySubsidies.GetRunningAverage(0, energySubsidies.currentMonth + 1), "toMonth>currentMonth should return 0");

    // not fromMonth <= toMonth)
    assert.ok(0 == energySubsidies.GetRunningAverage(1, 0), "fromMonth>toMonth should return 0");

    // normal
    assert.ok(8 == energySubsidies.GetRunningAverage(0, 2), "The average should be 8");

    // negative values
    let energySubsidies2 = new EnergySubsidies(organizationID);
    energySubsidies2.decisionValuePush = -5; energySubsidies2.decisionValuePush = -7; energySubsidies2.decisionValuePush = -12;
    assert.ok(-8 == energySubsidies2.GetRunningAverage(0, 2), "The average should be -8");

    // no entries
    let energySubsidies3 = new EnergySubsidies(organizationID);
    assert.ok(0 == energySubsidies3.GetRunningAverage(0, 0), "If there are no values, it should return 0");

}
import assert = require('assert');
import * as Mockito from 'ts-mockito';
import { AirTemperature, ComfortableHousingTemperature, CO2Emissions, GDPperPerson } from '../ServerModel/gamelogic/availableData';
import { EnergySubsidies, InvestmentInRenewables } from '../ServerModel/gamelogic/decision';
import { EnvironmentalKPI } from '../ServerModel/gamelogic/keyPerformanceIndicators';

export function AddManualValues_test() {
    let organizationID = 1;
    let airTemperature = new AirTemperature(organizationID);
    airTemperature.addManualValues([20, 22, 21, 18, 12, 5, 1, -2, 2, 7, 11, 17]);
    assert.ok(11 === airTemperature.currentMonth, "The current month is not 11");
    assert.ok(12 == airTemperature.getMonthsValue(4), "The temperature in month 4 should be 12 degrees");
    assert.ok(0 == airTemperature.getMonthsValue(99), "The temperature for an unknown month should be 0 degrees");

    airTemperature.valuePush = 23;
    assert.ok(23 == airTemperature.getMonthsValue(12), "The pushed value cannot be retrieved");

}

export function AirTemperatureCalculateValue_test() {
    let organizationID = 1;
    let airTemperature = new AirTemperature(organizationID);

    let mockedEnvironmentalKPI: EnvironmentalKPI = Mockito.mock(EnvironmentalKPI);
    let runningAverage11 = 49.3062698473287;
    Mockito.when(mockedEnvironmentalKPI.GetRunningAverage(0, 11)).thenReturn(runningAverage11);
    let environmentalKPI: EnvironmentalKPI = Mockito.instance(mockedEnvironmentalKPI);
    assert.ok(runningAverage11 == environmentalKPI.GetRunningAverage(0, 11), "Running average is not correct");

    let currentMonthBefore = airTemperature.currentMonth;
    let month = 0;
    airTemperature.CalculateValue(month, environmentalKPI);
    assert.ok(airTemperature.currentMonth == currentMonthBefore, "An entry was added even if we were not twelve months out");

    airTemperature.addManualValues([20, 22, 21, 18, 12, 5, 1, -2, 2, 7, 11, 17]);
    month = 12;
    airTemperature.CalculateValue(month, environmentalKPI);
    assert.ok(20.1 == Math.round(airTemperature.getMonthsValue(month) * 10) / 10, "Temperature returned not ok");
}

export function ComfortableHousingTemperatureCalculateValue_test() {
    let organizationID = 1;
    let cHT = new ComfortableHousingTemperature(organizationID);

    let mockedEnergySubsidies: EnergySubsidies = Mockito.mock(EnergySubsidies);
    Mockito.when(mockedEnergySubsidies.GetRunningAverage(0, 2)).thenReturn(0);
    let energySubsidies: EnergySubsidies = Mockito.instance(mockedEnergySubsidies);
    console.log(energySubsidies.GetRunningAverage(0, 2));

    let mockedGDPperPerson: GDPperPerson = Mockito.mock(GDPperPerson);
    Mockito.when(mockedGDPperPerson.getMonthsValue(2)).thenReturn(19919.4069);
    let gdpPerPerson: GDPperPerson = Mockito.instance(mockedGDPperPerson);
    console.log(gdpPerPerson.getMonthsValue(2));

    let mockedAirTemperature: AirTemperature = Mockito.mock(AirTemperature);
    Mockito.when(mockedAirTemperature.getMonthsValue(2)).thenReturn(21);
    let airTemperature: AirTemperature = Mockito.instance(mockedAirTemperature);
    console.log(airTemperature.getMonthsValue(2));

    cHT.valuePush = 30; cHT.valuePush = 40.1214469588;
    let month = 2;
    cHT.CalculateValue(month, energySubsidies, gdpPerPerson, airTemperature);
    // assert that the value is properly calculated in the third month (month = 2)
    console.log(cHT.getMonthsValue(month));
    assert.ok(47.335 == Math.round(cHT.getMonthsValue(month) * 1000) / 1000, "Comfortable Housing Temperature score returned not ok");

    // TODO Check all paths...
    // // true and false: subsidiesImpact + gdpImpact > 100
    // // true and false: discomfort < this.maxDiscomfortDifference

}

export function ComfortableHousingTemperatureGetPastMinimum_test() {
    let organizationID = 1;
    let cHT = new ComfortableHousingTemperature(organizationID);
    cHT.addManualValues([20, 22, 21, 18, 12, 5, 1, 2, 2, 7, 11, 17]);

    // not fromMonth >= 0
    assert.ok(999 == cHT.GetPastMinimum(-1, 2), "fromMonth<0 should return 999");

    // not fromMonth <= this._currentMonth
    assert.ok(999 == cHT.GetPastMinimum(cHT.currentMonth + 1, 11), "fromMonth>currentMonth should return 999");

    // not toMonth >= 0
    assert.ok(999 == cHT.GetPastMinimum(0, -1), "toMonth<0 should return 999");

    // not toMonth <= this._currentMonth
    assert.ok(999 == cHT.GetPastMinimum(0, cHT.currentMonth + 1), "toMonth>currentMonth should return 999");

    // not fromMonth <= toMonth)
    assert.ok(999 == cHT.GetPastMinimum(1, 0), "fromMonth>toMonth should return 999");

    // normal
    assert.ok(1 == cHT.GetPastMinimum(0, 11), "The minimum should be 1");

    // negative values
    let cHT2 = new ComfortableHousingTemperature(organizationID);
    cHT2.addManualValues([-20, -22, -25]);
    assert.ok(-22 == cHT2.GetPastMinimum(0, 1), "Negative values should return the most negative value");

    // all values larger than 998
    let cHT3 = new ComfortableHousingTemperature(organizationID);
    cHT3.addManualValues([1020, 1022, 1025]);
    assert.ok(998 == cHT3.GetPastMinimum(0, 2), "Values larger than 998 should return 998");

    // no entries
    let cHT4 = new ComfortableHousingTemperature(organizationID);
    cHT4.addManualValues([]);
    assert.ok(999 == cHT4.GetPastMinimum(0, 0), "If there are no values, it should return 999");
}

export function CO2EmissionsCalculateValue_test() {
    let organizationID = 1;
    let co2Emissions = new CO2Emissions(organizationID);
    let month = 4;

    let mockedEnergySubsidies: EnergySubsidies = Mockito.mock(EnergySubsidies);
    Mockito.when(mockedEnergySubsidies.GetMonthsDecision(4)).thenReturn(0);
    let energySubsidies: EnergySubsidies = Mockito.instance(mockedEnergySubsidies);

    let mockedInvestmentInRenewables: InvestmentInRenewables = Mockito.mock(InvestmentInRenewables);
    Mockito.when(mockedInvestmentInRenewables.GetMonthsDecision(4)).thenReturn(0);
    let investmentInRenewables: InvestmentInRenewables = Mockito.instance(mockedInvestmentInRenewables);

    co2Emissions.valuePush = 5.6; co2Emissions.valuePush = 5.606; co2Emissions.valuePush = 5.611; co2Emissions.valuePush = 5.617;
    co2Emissions.CalculateValue(month, energySubsidies, investmentInRenewables);
    // assert that the value is properly calculated in the fifth month
    assert.ok(5.62 == Math.round(co2Emissions.getMonthsValue(month) * 100) / 100, "CO2 emissions returned not ok");
}

export function GDPperPersonCalculateValue_test() {
    let organizationID = 1;
    let gdpPerPerson = new GDPperPerson(organizationID);
    let month = 12;

    let mockedEnergySubsidies: EnergySubsidies = Mockito.mock(EnergySubsidies);
    Mockito.when(mockedEnergySubsidies.GetMonthsDecision(month-1)).thenReturn(0);
    let energySubsidies: EnergySubsidies = Mockito.instance(mockedEnergySubsidies);

    let mockedInvestmentInRenewables: InvestmentInRenewables = Mockito.mock(InvestmentInRenewables);
    Mockito.when(mockedInvestmentInRenewables.GetMonthsDecision(month-1)).thenReturn(0);
    let investmentInRenewables: InvestmentInRenewables = Mockito.instance(mockedInvestmentInRenewables);

    let mockedComfortableHousingTemperature: ComfortableHousingTemperature = Mockito.mock(ComfortableHousingTemperature);
    Mockito.when(mockedComfortableHousingTemperature.GetPastMinimum(month-6, month-1)).thenReturn(28.142);
    let cHT: ComfortableHousingTemperature = Mockito.instance(mockedComfortableHousingTemperature);

    gdpPerPerson.addManualValues([20100, 20009, 19919, 19830, 19740, 19652, 19563, 19489, 19401, 19310, 19220, 19130]);
    let gdpPerPersonValue = gdpPerPerson.CalculateValue(month, energySubsidies, investmentInRenewables, cHT);
    // // assert that the value is properly calculated after twelve months
    assert.ok(19040 == Math.round(gdpPerPerson.getMonthsValue(month)/10)*10, "GDP per person returned not ok");
}
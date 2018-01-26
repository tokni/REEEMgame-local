abstract class Decision {

    private _decisionValue: Array<number> = [];
    protected _currentMonth: number = -1;

    constructor(public organizationID: number) {
    }

    get currentMonth() {
        return this._currentMonth;
    }

    set decisionValuePush(newDecision: number) {
        this._currentMonth++;
        this._decisionValue.push(newDecision);
    }

    GetMonthsDecision(month: number) {
        if (month >= 0 && month <= this.currentMonth) {
            return this._decisionValue[month];
        } else {
            return 0;
        }
    }

    GetRunningAverage(fromMonth: number, toMonth: number) {
        if (fromMonth >= 0 && fromMonth <= this._currentMonth && toMonth >= 0
            && toMonth <= this._currentMonth && fromMonth <= toMonth) {
            let total = 0;
            for (var month = fromMonth; month <= toMonth; month++) {
                total += this._decisionValue[month];
            }
            return total / (toMonth - fromMonth + 1 );
        } else {
            return 0;
        }
    }

    reset() {
        this._decisionValue = [];
        this._currentMonth = -1;
    }

}

export class EnergySubsidies extends Decision {

}

export class InvestmentInRenewables extends Decision {

}

//For a new decision
export class NewDecision extends Decision {

}
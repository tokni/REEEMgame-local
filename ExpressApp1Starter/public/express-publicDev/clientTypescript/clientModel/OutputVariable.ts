

export class OutputVariable {
    public m_name: string;
    private m_unit: string;
    private m_startYear: number;
    private m_endYear: number;

    private m_parameters: string[] = [];
    private m_parameterValues = [];

    private m_values;
    private m_minValue: number = 9999999999;
    private m_maxValue: number = -9999999999;
    private m_val: Map<string, number>;

    constructor(p_name, p_values, p_unit) {
        this.m_name = p_name;
        this.m_unit = p_unit;
        if (p_values != null) {
            this.m_values = p_values;
        }
        else {
            this.m_values = [['REGION', 'TECHNOLOGY', 2010, 2011, 2012, 2013],
            ['Uganda', 'UGBM00X00', 1.62742299307488, 1.62742299307488, 0.5, 1.4],
            ['Uganda', 'UGEL00T00', 0.183693012882026, 0.209182659013552, 0.6, 3.6],
            ['Uganda', 'UGHF00I00', 2.83480751289655, 2.83480751289655, 2.1, 4.5]
            ];
        }
        //this.createAreaChartArray("TECHNOLOGY");
        //this.createChartArray("YEAR", "REGION");
        this.createParameterList();
        this.m_startYear = this.m_values[0][this.m_parameters.length];
        this.m_endYear = this.m_values[0][this.m_values[0].length - 1];
        for (var i=0; i<45; i+=5) {
            this.createOverlayData(i);
        }
        console.log("MinVal: " + this.m_minValue);
        console.log("MaxVal: " + this.m_maxValue);
        //for (var i = 1; i < this.m_values.length; i++) {
        //    for (var j = this.m_parameters.length; j < this.m_values[0].length; j++) {
        //        var tmp34 = this.m_values[i][j];
        //        if (this.m_values[i][j] > this.m_maxValue) this.m_maxValue = this.m_values[i][j];
        //        if (this.m_values[i][j] < this.m_minValue) this.m_minValue = this.m_values[i][j];
        //    }
        //}
        //console.log("MinVal: " + this.m_minValue);
        //console.log("MaxVal: " + this.m_maxValue);
        //var tmp3 = this.createOverlayData(2011);
    }
    setValue(p_parameters: Object, p_value) {
        this.m_values.set(p_parameters, p_value);
    }
    getValue(p_parameters: Object) {
        return this.m_values.get(p_parameters);
    }
    createAreaChartArray(p_group: string) : any[]{
        var ret = [];
        
        //var parameterList = [];
        //var parameterValues = [];
        var parameterData = [];
        var groupIndex = this.m_parameters.indexOf(p_group);
        if (groupIndex == -1) groupIndex = 0;
        
        var tmp = this.m_parameters.indexOf(p_group);
        if (tmp == -1) {
            tmp = 0;
        }
        for (var i = 0; i < this.m_parameterValues[tmp].length; i++) {
            parameterData[i] = [];
            for (var j = 0; j < this.m_values[0].length - this.m_parameters.length; j++ ){
                parameterData[i][j] = 0;
            }
        }
        
        for (var j = 1; j < this.m_values.length; j++) {
            //parameterData[j - 1] = [];
            for (var i = this.m_parameters.length; i < this.m_values[0].length; i++) {
                //parameterData[j - 1][i - parameterList.length] = 0;
                
                var index = this.m_parameterValues[groupIndex].indexOf(this.m_values[j][groupIndex]);
                parameterData[index][i - this.m_parameters.length] += this.m_values[j][i];
            }
        }
        ret[0] = [];                    
        ret[0][0] = 'YEAR';
        var tmp1 = this.m_parameterValues[groupIndex].length + 1;
        for (var i = 1; i < this.m_parameterValues[groupIndex].length+1; i++) {
            ret[0][i] = this.m_parameterValues[groupIndex][i - 1];
        }
        var tmp2 = this.m_values[0].length - this.m_parameters.length + 1;
        for (var i = 1; i < parameterData[0].length + 1; i++) {
            ret[i] = [];
            ret[i][0] = this.m_values[0][i + this.m_parameters.length - 1].toString();
            for (var j = 1; j < parameterData.length + 1; j++) {
                ret[i][j] = parameterData[j - 1][i - 1];
            }
        }
        return ret;
    }
    createOverlayData(p_year) {
        var ret = [];
        var k = 0;
        var indexYear = this.m_values[0].indexOf(p_year + this.m_startYear);
        var indexRegion = this.m_values[0].indexOf('REGION');

        if (indexRegion !== -1) {
            for (var par of this.m_parameterValues[indexRegion]) {
                ret[k] = 0;

                for (var i = 0; i < this.m_values.length; i++) {
                    var indexPar = this.m_values[i].indexOf(par);
                    if (indexPar != -1) {
                        var tmp5 = this.m_values[i][indexYear];
                        ret[k] += this.m_values[i][indexYear];
                    }
                }
                var tmp555 = ret[k];
                if (ret[k] < this.m_minValue) this.m_minValue = ret[k];
                if (ret[k] > this.m_maxValue) this.m_maxValue = ret[k];
                k++;
            }
        }
        
        ret.push(p_year + this.m_startYear);
        ret.push(this.m_unit);
        return ret;
    }
    createParameterList() {
        var i = 0;
        while (typeof (this.m_values[0][i]) === "string") {
            
            this.m_parameters[i] = this.m_values[0][i];
            this.m_parameterValues[i] = [];
            
            var k = 0;
            for (var j = 1; j < this.m_values.length; j++) {
                if (this.m_parameterValues[i].indexOf(this.m_values[j][i]) === -1) {
                    this.m_parameterValues[i][k] = this.m_values[j][i];
                    k++;
                }
            }
            i++;
        }
    }
    getStartYear(): number {
        return this.m_startYear;
    }
    getEndYear(): number {
        return this.m_endYear;
    }
    getName() {
        return this.m_name;
    }
    public createPieChartData(p_region, p_group, p_year, p_name, p_varName): any[][] {
        var ret: any[][] = [];
        ret[0] = [];
        ret[0][0] = p_name;
        ret[0][1] = p_year + this.m_startYear;
        ret[0][2] = p_varName;
        ret[0][3] = this.m_unit;
        ret[1] = [];
        ret[1][0] = p_group;
        ret[1][1] = "Value";
        var i = 2;
        for (var val of this.m_values) {
            if (val[0] == p_region) {
                ret[i] = [];
                ret[i][0] = val[1];
                var tmp = this.m_values[0].indexOf(this.m_startYear + p_year);
                ret[i][1] = val[this.m_values[0].indexOf(this.m_startYear + p_year)]; 
                i++;
            }
        }
        return ret;
    }
    public getUnit() {
        return this.m_unit;
    }
    public getMinValue():number {
        return this.m_minValue;
    }
    public getMaxValue(): number {
        return this.m_maxValue;
    }
}
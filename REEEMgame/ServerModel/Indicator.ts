export class Indicator {
    private m_name;
    private m_id;
    private m_unit;
    private m_value;
    private m_description;
    private m_decimals;
    private m_countryIndex;

    constructor(p_name, p_id, p_unit, p_value, p_decimals, p_description, p_countryIndex) {
        this.m_name = p_name;
        this.m_id = p_id;
        this.m_unit = p_unit;
        this.m_value = p_value;
        this.m_description = p_description;
        this.m_decimals = p_decimals;
        this.m_countryIndex = p_countryIndex;
    }
    public getIndicator() {
        var ret;
        ret = {
            name: this.m_name,
            id: this.m_id,
            unit: this.m_unit,
            value: this.m_value,
            description: this.m_description,
            decimals: this.m_decimals
        }
        return ret;
    }
    public getID() {
        return this.m_id;
    }
    public getName() {
        return this.m_name;
    }
    public clone(): Indicator {
        return new Indicator(this.m_name, this.m_id, this.m_unit, this.m_value, this.m_decimals, this.m_description, this.m_countryIndex);
    }
}
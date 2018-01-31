export class Decision {
    private m_id;
    private m_name;
    private m_value;

    private m_minValue;
    private m_maxValue;
    private m_unit;
    private m_description;

    constructor(p_id, p_name, p_value, p_minValue, p_maxValue, p_unit, p_description) {
        this.m_id = p_id;
        this.m_name = p_name;
        this.m_value = p_value;
        this.m_minValue = p_minValue;
        this.m_maxValue = p_maxValue;
        this.m_unit = p_unit;
        this.m_description = p_description;
    }
    public getValue() {
        return this.m_value;
    }
    public setValue(p_value) {
        if (p_value < this.m_minValue)
            this.m_value = this.m_minValue;
        else if (p_value > this.m_maxValue)
            this.m_value = this.m_maxValue;
        else
            this.m_value = p_value;
    }
    public getID() {
        return this.m_id;
    }
    public getName() {
        return this.m_name;
    }
    public clone(): Decision {
        return new Decision(this.m_id, this.m_name, this.m_value, this.m_minValue, this.m_maxValue, this.m_unit, this.m_description);
    }
}
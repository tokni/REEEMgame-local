export class ColorPalette {
    private m_colors: { color: string, value: number }[];
    private m_minusInfiniteColor: string = '#DDDDDD';
    constructor(p_min, p_colors: { color: string, value: number }[]) {
        this.m_colors = p_colors;
        this.m_minusInfiniteColor = p_min;
    }
    public getColor = (p_value) => {
        //console.log("colors: " + JSON.stringify(this.m_colors));
        for (var i = this.m_colors.length; i > 0; i--) {
            if (p_value > this.m_colors[i-1].value) {
                return this.m_colors[i-1].color;
            } 
        }
        return this.m_minusInfiniteColor;
    }
    public getAllColorsAndValues() {
        return this.m_colors;
    }
    public changeValues(p_values: number[]) {
        for (var i = 0; i < this.m_colors.length; i++) {
            this.m_colors[i].value = p_values[i];
        }
    }
    public getMinusInfinityColor() {
        return this.m_minusInfiniteColor;
    }
}
//new ColorPalette([{ color: '#800026', value: 0 }, { color: '#FFEDA0', value: 23 }, { color: '#F0EDA0', value: 53 }]);

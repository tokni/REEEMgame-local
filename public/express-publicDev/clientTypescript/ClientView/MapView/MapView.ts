import {TKN_Map} from "../../leaflet/TKN_map"

export class MapView {
    private m_map: TKN_Map;
    private m_scenario;
    constructor(p_scenario, p_con, p_indicatorData) {
        console.log("C Mapview");
        this.m_map = new TKN_Map(p_indicatorData);
        this.m_map.setConnection(p_con);

        this.m_scenario = p_scenario;
    }
    public getMap() {
        return this.m_map;
    }
    public update = (p_data) => {
        var i = 0;
        for (var e of p_data) {
            if (i < p_data.length) {
                var tmp1 = this.m_map.m_geoJSON_data.features[i].properties.emisionsCO2.value;
                var tmp2 = Math.round(e.e * 100) / 100;
                this.m_map.m_geoJSON_data.features[i].properties.emisionsCO2.value = Math.round(e.e * 100) / 100;
                this.m_map.m_geoJSON_data.features[i].properties.housing = Math.round(e.h * 10) / 10;
                this.m_map.m_geoJSON_data.features[i].properties.temp = Math.round(e.a * 10) / 10;
                this.m_map.m_geoJSON_data.features[i].properties.GNP = Math.round(e.g);
                i++;
            }
        }
        this.m_map.updateCurrentLayer(p_data[p_data.length - 1]);
    }
}
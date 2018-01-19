
export class LeafletWrap {
    private m_self: LeafletWrap;
    private m_geojson;
    public getColorEmission(d: number) : string {
        return d > 1000 ? '#800026' :
            d > 800 ? '#BD0026' :
                d > 600 ? '#E31A1C' :
                    d > 400 ? '#FC4E2A' :
                        d > 300 ? '#FD8D3C' :
                            d > 200 ? '#FEB24C' :
                                d > 100 ? '#FED976' :
                                    '#FFEDA0';
    }
    public getColorSocial(d: number): string {
        return d > 80 ? '#000000' :
            d > 40 ? '#FFFFFF' :
                '#555555'
    }
    public style = (feature, map: string) => {
        if (map == "emmision") {
            return {
                fillColor: this.getColorEmission(feature.properties.emisnsCO2.value),
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            };
        }
        else {
            if (map == "social") {
                return {
                    fillColor: this.getColorSocial(feature.properties.social),
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7
                };
            }
            else {
                return {
                    fillColor: this.getColorSocial(feature.properties.social),
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7
                };
            }
        }
    }
    
    public highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });
    layer.bringToFront();
    }
    public resetHighlight = (e) => {
        this.m_geojson.resetStyle(e.target);
    }
    public zoomToFeature(e) {
        //mymap.fitBounds(e.target.getBounds());
    }
    public onEachFeature = (feature, layer) => {
    layer.on({
        mouseover: this.highlightFeature,
        mouseout: this.resetHighlight,
        click: this.zoomToFeature
    });
}
    constructor(p_map, p_geojson) {
        this.m_self = this;
        this.m_geojson = p_geojson;
        console.log("leaf Wrap");
    }
}
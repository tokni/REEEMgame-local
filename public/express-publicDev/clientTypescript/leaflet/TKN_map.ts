declare var L: any;
declare var $: any;
import { Connection } from "../ClientControl/Connection"
import { ColorPalette } from "./ColorPalette"
export enum Layer { none, data1, housing, temperature, GNP, browser };

export class TKN_Map {
    public m_map;
    private m_connection: Connection;
    public m_geojsonEmision;
    public m_geojsonSocial;
    public m_geojsonEconomical;
    public m_geojsonEnvironmental;
    public m_geojsonTemp;
    public m_geojsonHousing;
    public m_geojsonGNP;

    private m_layer: Layer;
    private m_self;
    public m_currentLayer;
    private m_month;

    private m_info;
    private m_global_info;
    private m_legend;
    private m_decisionInfo;
    private m_highLight;
    public m_geoJSON_data;
    private m_variableName: string;
    private m_pathway_name: string;
    private m_currentUnit;
    private m_colorPalette;
    private m_colorOfEmision: ColorPalette;
    private m_colorOfGNP: ColorPalette;
    private m_colorOfGNP2: ColorPalette;
    private m_colorOfGNP3: ColorPalette;
    private m_colorOfGNP4: ColorPalette;
    private m_colorOfAirTemp: ColorPalette;
    private m_colorOfComfort: ColorPalette;

    constructor(p_indicatorData) {
        var self = this;
        console.log("Constructing TKN_map");
        this.m_geoJSON_data = p_indicatorData;
        this.m_colorPalette = new ColorPalette('#DDDDDD',
            [{ color: '#800026', value: 0 }, { color: '#FFEDA0', value: 25 }, { color: '#F0EDA0', value: 65 }]);
        this.m_colorOfGNP4 = new ColorPalette('#FFEDA0',
            [{ color: '#FED976', value: 0 },
            { color: '#FEB24C', value: 80 },
            { color: '#FD8D3C', value: 160 },
            { color: '#FC4E2A', value: 240 },
            { color: '#E31A1C', value: 320 },
            { color: '#BD0026', value: 400 },
            { color: '#800026', value: 480 }]);

        this.m_colorOfEmision = new ColorPalette('#1a9850',
            [{ color: '#66bd63', value: 4 },
            { color: '#a6d96a', value: 5 },
            { color: '#d9ef8b', value: 6 },
            { color: '#fee08b', value: 8 },
            { color: '#fdae61', value: 10 },
            { color: '#f46d43', value: 12 },
            { color: '#d73027', value: 14 }
        ]);
        this.m_colorOfGNP3 = new ColorPalette('#ff0000',
            [{ color: '#da2400', value: 10000 },
            { color: '#b64800', value: 15000 },
            { color: '#916d00', value: 20000 },
            { color: '#6d9100', value: 30000 },
            { color: '#48b600', value: 40000 },
            { color: '#24da00', value: 50000 },
            { color: '#00ff00', value: 60000 }
        ]);
        this.m_colorOfAirTemp = new ColorPalette('#4575b4',
            [{ color: '#74add1', value: 0 },
            { color: '#abd9e9', value: 4 },
            { color: '#e0f3f8', value: 8 },
            { color: '#fee090', value: 12 },
            { color: '#fdae61', value: 16 },
            { color: '#f46d43', value: 20 },
            { color: '#d73027', value: 24 }
        ]);
        this.m_colorOfComfort = new ColorPalette('#d73027',
            [{ color: '#f46d43', value: 10 },
            { color: '#fdae61', value: 25 },
            { color: '#fee08b', value: 40 },
            { color: '#d9ef8b', value: 55 },
            { color: '#a6d96a', value: 70 },
            { color: '#66bd63', value: 85 },
            { color: '#1a9850', value: 100 }
            ]);
        this.m_colorOfGNP2 = new ColorPalette('#ff0000',
            [{ color: '#da2400', value: 10000 },
            { color: '#b64800', value: 15000 },
            { color: '#916d00', value: 20000 },
            { color: '#6d9100', value: 30000 },
            { color: '#48b600', value: 40000 },
            { color: '#24da00', value: 50000 },
            { color: '#00ff00', value: 60000 }
            ]);
        this.m_colorOfGNP = new ColorPalette('#d73027',
            [{ color: '#f46d43', value: 10000 },
            { color: '#fdae61', value: 15000 },
            { color: '#fee08b', value: 20000 },
            { color: '#d9ef8b', value: 30000 },
            { color: '#a6d96a', value: 40000 },
            { color: '#66bd63', value: 50000 },
            { color: '#1a9850', value: 60000 }
            ]);

        this.m_layer = Layer.none; 
        this.m_map = L.map('pMap', { doubleClickZoom: false}).setView([51.505, 16.09], 4);
        this.m_map.on('update', (e) => {
            this.m_month = e.month;
            this.m_currentUnit = e.unit;
            this.m_variableName = e.var_name;
            this.m_pathway_name = e.pathway_name;
            this.m_global_info.update({ path_name: this.m_pathway_name, var_name: this.m_variableName });
            
            this.m_geojsonHousing.clearLayers();
            this.m_geojsonHousing.addData(this.m_geoJSON_data);
            this.m_geojsonEmision.clearLayers();
            this.m_geojsonEmision.addData(this.m_geoJSON_data);
            this.m_geojsonGNP.clearLayers();
            this.m_geojsonGNP.addData(this.m_geoJSON_data);
            this.m_geojsonTemp.clearLayers();
            this.m_geojsonTemp.addData(this.m_geoJSON_data);
            if (this.m_currentLayer) {
                this.m_map.removeLayer(this.m_currentLayer);
                this.m_map.addLayer(this.m_currentLayer);
                if (this.m_highLight == null)
                    this.m_info.update();
                else {
                    this.m_info.update(this.m_highLight.feature.properties);
                    this.m_highLight.setStyle({
                        weight: 5,
                        color: '#666',
                        dashArray: '',
                        fillOpacity: 0.7
                    });
                }
            }

        });
        this.m_global_info = L.control({ position: 'topleft' });
        this.m_global_info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info');
            this._div.innerHTML = "EU28 Info";
            this._div_content = L.DomUtil.create('div', 'eu28_info_content', this._div);

            this._div_content_path = L.DomUtil.create('div', 'eu28_info_content_path', this._div_content);
            this._div_path_comment = L.DomUtil.create('button', 'eu28_info_content_path_comment', this._div_content);
            this._div_path_comment.innerHTML = 'Comment on Pathway';
            L.DomUtil.addClass(this._div_path_comment, "hide_button");

            this._div_content_var = L.DomUtil.create('div', 'eu28_info_content_var', this._div_content);
            this._div_var_comment = L.DomUtil.create('button', "eu28_info_content_var_comment", this._div_content);
            this._div_var_comment.innerHTML = 'Comment on Indicator';
            L.DomUtil.addClass(this._div_var_comment, "hide_button");
           
            this.update();
            return this._div;
        }
        this.m_global_info.update = function (props) {
            if (props) {
                if (props.path_name) {
                    this._div_content_path.innerHTML = 'Pathway: ' + props.path_name;
                    L.DomUtil.removeClass(this._div_path_comment, "hide_button");
                    
                } else {
                    this._div_content_path.innerHTML = '' 
                    L.DomUtil.addClass(this._div_path_comment, "hide_button");
                }
                if (props.var_name) {
                    this._div_content_var.innerHTML = 'Indicator: ' + props.var_name;
                    L.DomUtil.removeClass(this._div_var_comment, "hide_button");
                }
                else {
                    this._div_content_var.innerHTML = '';
                    L.DomUtil.addClass(this._div_var_comment, "hide_button");
                }
            }
            else {
                this._div_content_path.innerHTML = ''
                L.DomUtil.addClass(this._div_path_comment, "hide_button");
                this._div_content_var.innerHTML = '';
                L.DomUtil.addClass(this._div_var_comment, "hide_button");
            }
        }
        this.m_global_info.addTo(this.m_map);
        this.m_info = L.control();
        this.m_info.onAdd = function(map) {
            this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
            this.update();
            return this._div;
        }
        this.m_info.update = function (props) {
            switch (self.m_layer) {
                case Layer.none: {
                    this._div.innerHTML = '';
                    break;
                }
                case Layer.data1: {
                    this._div.innerHTML = '<h4><b>Data:</b></h4>' + (props ?
                        '<b>' + props.name + '</b><br />CO<sub>2</sub> emissions ' + props.emisionsCO2.value + ' t/person<br><br />'
                        : 'Hover over a country');
                    break;
                }
                case Layer.housing : {this._div.innerHTML = '<h4>Comfort level (0-100 scale)</h4>' + (props ?
                    '<b>' + props.name + '</b><br />' + props.housing
                    : 'Hover over a country');
                    break;
                }
                case Layer.temperature: {
                    this._div.innerHTML = '<h4>Average air temperature</h4>' + (props ?
                        '<b>' + props.name + '</b><br />' + props.temp + ' &#x2103;' //&#x2103 is hexcode for degree celsius 
                        : 'Hover over a country');
                    break;
                }
                case Layer.GNP: {
                    this._div.innerHTML = '<h4>GDP/person in USD</h4>' + (props ?
                        '<b>' + props.name + '</b><br />' + props.GNP
                        : 'Hover over a country');
                    break;
                }
            }
        };
        this.m_info.addTo(this.m_map);

        this.m_legend = L.control({ position: 'bottomright' });
        this.m_legend.onAdd = function (map) {
            this.div = L.DomUtil.create('div', 'info overlayLegend');
            this.div.id = "legendID";
            
            return this.div;
        };
        this.m_legend.addTo(this.m_map);
        this.m_legend.update = function () {
            $('.overlayLegend').empty();
            switch (self.m_layer) {
                case Layer.data1: self.m_colorPalette = self.m_colorOfEmision; break;
                case Layer.housing: self.m_colorPalette = self.m_colorOfComfort; break;
                case Layer.GNP: self.m_colorPalette = self.m_colorOfGNP; break;
                case Layer.temperature: self.m_colorPalette = self.m_colorOfAirTemp; break;
            }
            if (self.m_layer != Layer.none) {
                var legendTable: HTMLTableElement = document.createElement("table");
                var legendHeaderRow: HTMLTableRowElement = document.createElement("tr");
                legendTable.appendChild(legendHeaderRow);
                var legendHeaderValue: HTMLTableDataCellElement = document.createElement("th");
                var legendHeaderColor: HTMLTableDataCellElement = document.createElement("th");
                legendHeaderValue.innerHTML = "Value";
                legendHeaderColor.innerHTML = "Color";
                legendHeaderRow.appendChild(legendHeaderValue);
                legendHeaderRow.appendChild(legendHeaderColor);

                var colors = self.m_colorPalette.getAllColorsAndValues();
                var legendMinRow: HTMLTableRowElement = document.createElement("tr");
                var legendValue: HTMLTableDataCellElement = document.createElement("td");
                var legendColor: HTMLTableDataCellElement = document.createElement("td");
                legendColor.setAttribute("style", "background-color:" + self.m_colorPalette.getMinusInfinityColor());
                var tvf =
                    legendValue.innerHTML = ']-<span id="infin_span">&infin;</span>, ' + colors[0].value + ' ]';
                legendMinRow.appendChild(legendValue);
                legendMinRow.appendChild(legendColor);
                legendTable.appendChild(legendMinRow);

                for (var i = 0; i < colors.length; i++) {
                    var legendRow: HTMLTableRowElement = document.createElement("tr");
                    var legendValue: HTMLTableDataCellElement = document.createElement("td");
                    var legendColor: HTMLTableDataCellElement = document.createElement("td");
                    legendColor.setAttribute("style", "background-color:" + colors[i].color);
                    if (i == colors.length - 1) {
                        legendValue.innerHTML = ']' + colors[i].value + ', <span id="infin_span">&infin;</span>['
                    } else {
                        legendValue.innerHTML = ']' + colors[i].value + ', ' + colors[i + 1].value + ']';
                    }
                    legendRow.appendChild(legendValue);
                    legendRow.appendChild(legendColor);
                    legendTable.appendChild(legendRow);
                }
                this.div.appendChild(legendTable);
                $(".overlayLegend").css("margin-bottom", "55px");
            }
            else {
                this.div.innerHTML = "";
            }
        }
        
        
        var Stamen_Terrain = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.{ext}', {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            subdomains: 'abcd',
            minZoom: 4,
            maxZoom: 9,
            ext: 'png',
            unloadInvisibleTiles: true,
            updateWhenIdle: true,
            reuseTiles: true
        }).addTo(this.m_map);
        
        this.m_geojsonTemp = L.geoJson(p_indicatorData, {
            style: this.setStyleTemp,
            onEachFeature: this.setOnEachFeatureTemp
        }).on('add', () => {
            this.m_geojsonTemp.setStyle((f) => {
                return {
                    fillColor: this.m_colorPalette.getColor(f.properties.temp),
                    weight: 2,
                    opacity: 1,
                    color: 'black',
                    dashArray: '3',
                    fillOpacity: 0.7
                }
                
             
            });
           
            });
        this.m_geojsonEmision = L.geoJson(this.m_geoJSON_data, {
            style: this.setStyleEmision,
            onEachFeature: this.setOnEachFeatureEmision
        })
        this.m_geojsonSocial = L.geoJson(p_indicatorData, {
            style: this.setStyleSocial,
            onEachFeature: this.setOnEachFeatureSocial
        })
        this.m_geojsonHousing = L.geoJson(p_indicatorData, {
            style: this.setStyleHousing,
            onEachFeature: this.setOnEachFeatureHousing
        })
        this.m_geojsonGNP = L.geoJson(p_indicatorData, {
            style: this.setStyleGNP,
            onEachFeature: this.setOnEachFeatureGNP
        })
    }
    public setLayer(p_layer: Layer) {
        this.m_layer = p_layer;
        this.m_info.update();
        this.m_legend.update();
        if (this.m_layer != Layer.none)
            this.updateCurrentLayer(this.m_month, this.m_pathway_name, this.m_currentUnit, this.m_variableName);
    }
    public setStyleTemp = (feature) => {
        if (!this.m_month) this.m_month = 0;
        return {
            fillColor: this.m_colorPalette.getColor(feature.properties.temp),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }
    public setStyleEmision = (feature) => {       
        return {
            fillColor: this.m_colorPalette.getColor(feature.properties.emisionsCO2.value),
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            };      
    }
    public setStyleSocial = (feature) => {
        return {
            fillColor: this.getColorOfSocial(feature.properties.social),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }
    public setStyleHousing = (feature) => {
        return {
            fillColor: this.m_colorPalette.getColor(feature.properties.housing),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }
    public setStyleGNP = (feature) => {
        return {
            fillColor: this.m_colorPalette.getColor(feature.properties.GNP),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }
    public setOnEachFeatureTemp = (feature, layer) => {
        layer.on({
            mouseover: this.highlightFeature,
            mouseout: this.resetHighlightTemp,
        });
    }
    public setOnEachFeatureEmision = (feature, layer) => {
        layer.on({
            mouseover: this.highlightFeature,
            mouseout: this.resetHighlightEmision,
        });
    }
    public setOnEachFeatureSocial = (feature, layer) => {
        layer.on({
            mouseover: this.highlightFeature,
            mouseout: this.resetHighlightSocial,
        });
    }
    public setOnEachFeatureHousing = (feature, layer) => {
        layer.on({
            mouseover: this.highlightFeature,
            mouseout: this.resetHighlightHousing,
        });
    }
    public setOnEachFeatureGNP = (feature, layer) => {
        layer.on({
            mouseover: this.highlightFeature,
            mouseout: this.resetHighlightGNP,
        });
    }
    public getColorOfMonth = (d) => {
        return "rgb(0, 102, " + d*20 + ")";
    }
    public getColorTemp = (d) => {
        return d > 24 ? '#800026' :
            d > 20 ? '#BD0026' :
                d > 16 ? '#E31A1C' :
                    d > 12 ? '#FC4E2A' :
                        d > 8 ? '#FD8D3C' :
                            d > 4 ? '#FEB24C' :
                                d > 0 ? '#FED976' :
                                    '#FFEDA0';
    }
    public getColorOfEmision = (d) => {
        return d > 14 ? '#800026' :
            d > 12 ? '#BD0026' :
                d > 10 ? '#E31A1C' :
                    d > 8 ? '#FC4E2A' :
                        d > 6 ? '#FD8D3C' :
                            d > 5 ? '#FEB24C' :
                                d > 4 ? '#FED976' :
                                    '#FFEDA0';
    }
    public getColorOfSocial(d: number): string {
        return d > 100 ? '#181009' :
            d > 85 ? '#302013' :
                d > 70 ? '#49311c' :
                    d > 55 ? '#614126' :
                        d > 40 ? '#7a5230' :
                            d > 25 ? '#926239' :
                                d > 10 ? '#aa7243' :
                                    '#c3834c'
    }
    public getColorOfHousing(d: number): string {
        return d > 100 ? '#181009' :
            d > 85 ? '#302013' :
                d > 70 ? '#49311c' :
                    d > 55 ? '#614126' :
                        d > 40 ? '#7a5230' :
                            d > 25 ? '#926239' :
                                d > 10 ? '#aa7243' :
                                    '#c3834c'
    }
    public getColorOfGNP(d: number): string {
        return d > 60000 ? '#181009' :
            d > 50000 ? '#302013' :
                d > 40000 ? '#49311c' :
                    d > 30000 ? '#614126' :
                        d > 20000 ? '#7a5230' :
                            d > 15000 ? '#926239' :
                                d > 10000 ? '#aa7243' :
                                    '#c3834c'
    }
    public highlightFeature = (evt) => {
        var layer = evt.target;
        this.m_highLight = evt.target;

        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
        this.m_info.update(layer.feature.properties);
    }
    public resetHighlightTemp = (e) => {
        this.m_geojsonTemp.resetStyle(e.target);
        this.m_highLight = null;
        this.m_info.update();
    }
    public resetHighlightEmision = (e) => {
        this.m_geojsonEmision.resetStyle(e.target);
        this.m_highLight = null;
        this.m_info.update();
    }
    public resetHighlightSocial = (e) => {
        this.m_geojsonSocial.resetStyle(e.target);
        this.m_highLight = null;
        this.m_info.update();
    }
    public resetHighlightHousing = (e) => {
        this.m_geojsonHousing.resetStyle(e.target);
        this.m_highLight = null;
        this.m_info.update();
    }
    public resetHighlightGNP = (e) => {
        this.m_geojsonGNP.resetStyle(e.target);
        this.m_highLight = null;
        this.m_info.update();
    }
public updateCurrentLayer(p_month: number, p_pathway_name?, p_unit?, var_name?) {
        this.m_map.fire("update", { month: p_month, pathway_name: p_pathway_name, var_name: var_name, unit: p_unit });
        var tmp = 0;
        console.log("PAtheqay name: " + p_pathway_name);
    }
    public setConnection(p_connection) {
        this.m_connection = p_connection;
    }
}
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Fill, Stroke, Style, Text, Circle as CircleStyle } from "ol/style";
import * as d3 from "d3";
import * as h from "d3-hsv";
import TileLayer from "ol/layer/Tile";
import { CartoDB, OSM } from "ol/source";

var i0 = h.interpolateHsvLong(h.hsv(120, 60, 0.65), h.hsv(60, 1, 0.9)),
  i1 = h.interpolateHsvLong(h.hsv(60, 1, 0.9), h.hsv(0, 0, 0.95)),
  interpolateTerrain = function(t) {
    return t < 0.5 ? i0(t * 2) : i1((t - 0.5) * 2);
  },
  color = d3.scaleSequential(interpolateTerrain).domain([500, 1000]);

//var url = 'http://test.welllogdata.com/api_endpoint.php?service=get_json&grid_name=zmap_wfmp_baseii&format=xyz'
//var url = 'https://s3.amazonaws.com/welllogdata/wfmpa_json.json'
var url = "https://s3.amazonaws.com/welllogdata/our_data.json";

var data1 = d3.json(url, function(error, volcano) {
  if (error) throw error;
});

data1.then(function(volcano) {
  console.log("rawdata", volcano);
  var contours = d3.contours().size([volcano.width, volcano.height])(
    volcano.depth
  );
  console.log(contours);
  contours.forEach(function(e) {
    geojsonObject.features.push({ type: "Feature", geometry: e });
  });
  var vectorLayer = new VectorLayer({
    source: new VectorSource({
      features: new GeoJSON({
        dataProjection: "EPSG:3857",
        featureProjection: "EPSG:3857"
      }).readFeatures(geojsonObject, {
        dataProjection: "EPSG:3857",
        featureProjection: "EPSG:3857"
      })
    }),
    style: style
  });

  map.addLayer(vectorLayer);
});

var geojsonObject = {
  type: "FeatureCollection",
  crs: {
    type: "name",
    properties: {
      name: "EPSG:3857"
    }
  },
  features: []
};

var style = new Style({
  fill: new Fill({
    color: "rgba(255, 255, 255, 0.6)"
  }),
  stroke: new Stroke({
    color: "black",
    width: 1
  }),
  text: new Text({
    font: "12px Calibri,sans-serif",
    fill: new Fill({
      color: "#000"
    }),
    stroke: new Stroke({
      color: "#fff",
      width: 3
    })
  })
});

var mapConfig = {
  layers: [
    {
      type: "cartodb",
      options: {
        cartocss_version: "2.1.1",
        cartocss: "#layer { polygon-fill: #F00; }",
        sql: "select * from european_countries_e where area > 0"
      }
    }
  ]
};

var cartoDBSource = new CartoDB({
  account: "documentation",
  config: mapConfig
});

var map = new Map({
  layers: [
    new TileLayer({
      source: new OSM()
    }),
    new TileLayer({
      source: cartoDBSource
    })
  ],
  target: "map",
  view: new View({
    projection: "EPSG:3857",
    center: [0, 0],
    zoom: 10
  })
});

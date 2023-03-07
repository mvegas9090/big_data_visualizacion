import * as d3 from "d3";
import * as topojson from "topojson-client";
const spainjson = require("./spain.json");
const d3Composite = require("d3-composite-projections");
import { stats } from "./stats";
import { current } from "./stats";
import { latLongCommunities } from "./communities";

const calculateRadiusBasedOnAffectedCases = (comunidad: string, inputData: any[]) => {
  const entry = inputData.find((item) => item.name === comunidad);

  const maxAffected = inputData.reduce(
  (max, item) => (item.value > max ? item.value : max),
  0
  );
  const affectedRadiusScale = d3
     .scaleLinear()
     .domain([0, maxAffected])
     .range([3, 50]);

  return entry ? affectedRadiusScale(entry.value) : 0;
};

const aProjection = d3Composite.geoConicConformalSpain();

const geoPath = d3.geoPath().projection(aProjection);

const geojson = topojson.feature(spainjson, spainjson.objects.ESP_adm1);

aProjection.fitSize([1024, 800], geojson);

const svg = d3
  .select("body")
  .append("svg")
  .attr("width", 1024)
  .attr("height", 800)
  .attr("style", "background-color: #fff");

svg
  .selectAll("path")
  .data(geojson["features"])
  .enter()
  .append("path")
  .attr("class", "country")
  // use geoPath to convert the data into the current projection
  // https://stackoverflow.com/questions/35892627/d3-map-d-attribute
  .attr("d", geoPath as any);

svg
  .selectAll("circle")
  .data(latLongCommunities)
  .enter()
  .append("circle")
  .attr("class", "affected-marker")
  .attr("r", (d) => calculateRadiusBasedOnAffectedCases(d.name, stats))
  .attr("cx", (d) => aProjection([d.long, d.lat])[0])
  .attr("cy", (d) => aProjection([d.long, d.lat])[1]);


const refresh = (inputData: any[]) => {
  const circles = svg.selectAll("circle");
  circles
    .data(latLongCommunities)
    .merge(circles as any)
    .transition()
    .duration(500)
    .attr("r", d => calculateRadiusBasedOnAffectedCases(d.name, inputData));
};

  document
  .getElementById("previous")
  .addEventListener("click", function handleInitialResults() {
    refresh(stats);
  });
document
  .getElementById("current")
  .addEventListener("click", function handleCurrentResults() {
    refresh(current);
  });

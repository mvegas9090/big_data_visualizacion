# | Master Big Data 2021-23 |
# | Mandatory task | Visualization module |
# | Pinning locations + scale |

Our boss liked a lot the map we have developed, now he wants to focus on Spain affection by City, he wants to
display a map pinning affected locations and scaling that pin according the number of cases affected, something like:

![image|200](https://raw.githubusercontent.com/mvegas9090/big_data_visualizacion/main/gif/animacion.gif)

codesandbox: https://codesandbox.io/s/hopeful-ellis-rlczx

We have to face three challenges here:

- Place pins on a map based on location.
- Scale pin radius based on affected number.
- Spain got canary island that is a territory placed far away, we need to cropt that islands and paste them in a visible
  place in the map.
- Create and configure buttons to switch between different time periods.

# Steps:

- We will take as starting example _00-render-map-hover_, let's copy the content from that folder and execute _npm install_.

```bash
npm install
```

- This time we will Spain topojson info: https://github.com/deldersveld/topojson/blob/master/countries/spain/spain-comunidad-with-canary-islands.json

Let's copy it under the following route _./src/spain.json_

- Now instead of importing _europe.json_ we will import _spain.json_.

_./src/index.ts_

```diff
import * as d3 from "d3";
import * as topojson from "topojson-client";
- const europejson = require("./europe.json");
+ const spainjson = require("./spain.json");
```

- Let's build the spain map instead of europe:

_./src/index.ts_

```diff
const geojson = topojson.feature(
+  spainjson,
-  europejson,
+  spainjson.objects.ESP_adm1
-  europejson.objects.continent_Europe_subunits
);
```

> How do we know that we have to use _spainjson.objects.ESP_adm1_ just by examining
> the _spain.json_ file and by debugging and inspecting what's inside _spainjson_ object.

- If we run the project, we will get some bitter-sweet feelings, we can see a map of spain,
  but it's too smal, and on the other hand, canary islands are shown far away (that's normal,
  but usually in maps these islands are relocated).

- If we run the project we can check that the map is now renders in a proper size and position, let's
  go for the next challenge, we want to reposition Canary Islands, in order to do that we can build a
  map projection that positions that piece of land in another place, for instance for the USA you can
  find Albers USA projection: https://bl.ocks.org/mbostock/2869946, there's a great project created by
  [Roger Veciana](https://github.com/rveciana) that implements a lot of projections for several
  maps:

  - [Project site](https://geoexamples.com/d3-composite-projections/)
  - [Github project](https://github.com/rveciana/d3-composite-projections)

Let's install the library that contains this projections:

```bash
npm install d3-composite-projections --save
```

- Let's import it in our _index.ts_ (we will use require since we don't have typings).

```diff
import * as d3 from "d3";
import * as topojson from "topojson-client";
const spainjson = require("./spain.json");
const d3Composite = require("d3-composite-projections");
```

- Let's change the projection we are using (we will need to tweak as well the
  _scale_ and _translate_ values):

_./index.ts_

```diff
const aProjection = d3Composite
  .geoConicConformalSpain()
  // Let's make the map bigger to fit in our resolution
  .scale(3300)
  // Let's center the map
  .translate([500, 400]);
```

- If we run the project, voila ! we got the map just the way we want it.

- Now we want to display a circle in the middle of each community (comunidad autónoma),
  we have collected the latitude and longitude for each community, let's add them to our
  project.

_./src/communities.ts_

```typescript
export const latLongCommunities = [
  {
    name: "Madrid",
    long: -3.70256,
    lat: 40.4165
  },
  {
    name: "Andalucía",
    long: -4.5,
    lat: 37.6
  },
  {
    name: "Valencia",
    long: -0.37739,
    lat: 39.45975
  },
  {
    name: "Murcia",
    long: -1.13004,
    lat: 37.98704
  },
  {
    name: "Extremadura",
    long: -6.16667,
    lat: 39.16667
  },
  {
    name: "Cataluña",
    long: 1.86768,
    lat: 41.82046
  },
  {
    name: "País Vasco",
    long: -2.75,
    lat: 43.0
  },
  {
    name: "Cantabria",
    long: -4.03333,
    lat: 43.2
  },
  {
    name: "Asturias",
    long: -5.86112,
    lat: 43.36662
  },
  {
    name: "Galicia",
    long: -7.86621,
    lat: 42.75508
  },
  {
    name: "Aragón",
    long: -1.0,
    lat: 41.0
  },
  {
    name: "Castilla y León",
    long: -4.45,
    lat: 41.383333
  },
  {
    name: "Castilla La Mancha",
    long: -3.000033,
    lat: 39.500011
  },
  {
    name: "Islas Canarias",
    long: -15.5,
    lat: 28.0
  },
  {
    name: "Islas Baleares",
    long: 2.52136,
    lat: 39.18969
  },
  {
    name: "La Rioja",
    long: -2.44373,
    lat: 42.4650
  },
  {
    name: "Navarra",
    long: -1.676069,
    lat: 42.695391
  }
];
```

- Let's import it:

_./src/index.ts_

```diff
import * as d3 from "d3";
import * as topojson from "topojson-client";
+ import { latLongCommunities } from "./communities";
```

- And let's append at the bottom of the _index_ file a
  code to render a circle on top of each community:

_./src/index.ts_

```typescript
const circles = svg.selectAll("circle");

circles
  .data(latLongCommunities)
  .enter()
  .append("circle")
  .attr("r", d => calculateRadiusBasedOnAffectedCases(d.name))
  .attr("cx", d => aProjection([d.long, d.lat])[0])
  .attr("cy", d => aProjection([d.long, d.lat])[1]);
```

- Nice ! we got an spot on top of each community, now is time to
  make this spot size relative to the number of affected cases per community.
  
- Now let's create buttons in the HTML code like this:
_./src/index.html

```diff
  <body>
    <div class = "buttons">
      <button id="previous">Previous results</button>
      <button id="current">Current results</button>
    </div>
    <script type="module" src="./index.ts"></script>
  </body>
```
- Also a css styles have been created for the buttons:
_./src/buttons.css

```diff
.buttons{

  width: 1100px;
  height: 30px;
  margin: 3px;
}
#previous,#current{

  width: 520px;
  height: 100%;
  background: #000;
  font-size: 20px;
  font-family: Arial, Helvetica, sans-serif;
  color: #fff;
  transition-duration: 0.3s;
  border: none;
  cursor:pointer;
}

#current{
  position: relative;
  left: 0px;
}

#previous:hover,#current:hover  {
  background-color: #fff;
  color: #000;
  border: solid;
  border-width: 1px;
}
```
-After this we just need to configure the behaviour of these buttons using typescript:

```diff
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
```

- Now we only have to add the statistics to be able to visualize them:

_./stats.ts_

```typescript
export const stats = [
  {
    name: "Madrid",
    value: 174,
  },
  {
    name: "La Rioja",
    value: 39,
  },
  {
    name: "Andalucía",
    value: 34,
  },
  {
    name: "Cataluña",
    value: 24,
  },
  {
    name: "Valencia",
    value: 30,
  },
  {
    name: "Murcia",
    value: 0,
  },
  {
    name: "Extremadura",
    value: 6,
  },
  {
    name: "Castilla La Mancha",
    value: 16,
  },
  {
    name: "País Vasco",
    value: 45,
  },
  {
    name: "Cantabria",
    value: 10,
  },
  {
    name: "Asturias",
    value: 5,
  },
  {
    name: "Galicia",
    value: 3,
  },
  {
    name: "Aragón",
    value: 11,
  },
  {
    name: "Castilla y León",
    value: 19,
  },
  {
    name: "Islas Canarias",
    value: 18,
  },
  {
    name: "Islas Baleares",
    value: 6,
  },
];

//https://www.sanidad.gob.es/profesionales/saludPublica/ccayes/alertasActual/nCov/documentos/Actualizacion_661_COVID-19.pdf
export const current = [
  {
    name: "Madrid",
    value: 1537
  },
  {
    name: "La Rioja",
    value: 13
  },
  {
    name: "Andalucía",
    value: 779
  },
  {
    name: "Cataluña",
    value: 584
  },
  {
    name: "Valencia",
    value: 583
  },
  {
    name: "Murcia",
    value: 62
  },
  {
    name: "Extremadura",
    value: 124
  },
  {
    name: "Castilla La Mancha",
    value: 569
  },
  {
    name: "País Vasco",
    value: 271
  },
  {
    name: "Cantabria",
    value: 45
  },
  {
    name: "Asturias",
    value: 177
  },
  {
    name: "Galicia",
    value: 821
  },
  {
    name: "Aragón",
    value: 133
  },
  {
    name: "Castilla y León",
    value: 812
  },
  {
    name: "Islas Canarias",
    value: 373
  },
  {
    name: "Islas Baleares",
    value: 116
  },
  {
    name: "Navarra",
    value: 76
  }
];
```

- Let's import it into our index.ts

_./src/index.ts_

```diff
import * as d3 from "d3";
import * as topojson from "topojson-client";
const spainjson = require("./spain.json");
const d3Composite = require("d3-composite-projections");
import { latLongCommunities } from "./communities";
+ import { stats } from "./stats";
```

- Let's calculate circles based on the maximum number of affected of all communities:

_./src/index.ts_

```typescript
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
```

- Let's tie it up with the circle rendering code that we created above:

_./src/index.ts_

```diff
svg
  .selectAll("circle")
  .data(latLongCommunities)
  .enter()
  .append("circle")
  .attr("class", "affected-marker")
  .attr("r", (d) => calculateRadiusBasedOnAffectedCases(d.name, stats))
  .attr("cx", (d) => aProjection([d.long, d.lat])[0])
  .attr("cy", (d) => aProjection([d.long, d.lat])[1]);
```

- Let's add some styles, we will just use a white background and
  add some transparency to let the user see the spot and the map under that spot.
  
_./src/map.css_

```diff
.country {
  stroke-width: 1;
  stroke: #000;
  fill: #fff;
}

.affected-marker {
  stroke-width: 1;
  stroke: #afa;
  fill: #0e0;
  fill-opacity: 0.7;
}
```
- Let's apply this style to the black circles that we are rendering:

_./src/index.ts_

```diff
svg
  .selectAll("circle")
  .data(latLongCommunities)
  .enter()
  .append("circle")
+  .attr("class", "affected-marker")
  .attr("r", d => calculateRadiusBasedOnAffectedCases(d.name))
  .attr("cx", d => aProjection([d.long, d.lat])[0])
  .attr("cy", d => aProjection([d.long, d.lat])[1]);
```

- Just to wrap up let's remove features that we are not using for this chart
  (highlight a given community on mouse hover).

_./src/index.ts_

```diff
svg
  .selectAll("path")
  .data(geojson["features"])
  .enter()
  .append("path")
  .attr("class", "country")
  // use geoPath to convert the data into the current projection
  // https://stackoverflow.com/questions/35892627/d3-map-d-attribute
  .attr("d", geoPath as any);
```

./src/map.css

```diff
.country {
  stroke-width: 1;
  stroke: #000;
  fill: #fff;
}

.affected-marker {
  stroke-width: 1;
  stroke: #afa;
  fill: #0e0;
  fill-opacity: 0.7;
}
```



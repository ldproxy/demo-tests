import { init } from "@catsjs/core";
import qs from "qs";
import { featuresMatch, shouldIncludeId } from "../expectFunctions.js";

const { api, setup, vars } = await init();

const CONTENT_TYPE = "Content-Type";
const GEO_JSON = "application/geo+json";
const JSON_CONTENT_TYPE = "application/json";

const collectionFeatures = "allAeronauticCrvFeatures";
const ENVELOPE_COLLECTION = "envelopeCollection";
const LIMIT = 250;

await setup("fetch AeronauticCrv Collection", async () =>
  api
    .get(`/daraa/collections/AeronauticCrv`)
    .accept(JSON_CONTENT_TYPE)
    .expect(200)
    .expect(CONTENT_TYPE, JSON_CONTENT_TYPE)
    .expect((res) => {
      vars.save(
        ENVELOPE_COLLECTION,
        `ENVELOPE(${res.body.extent.spatial.bbox[0].join(",")})`
      );
    })
);

await setup("fetch all AeronauticCrv features", async () =>
  api
    .get(`/daraa/collections/AeronauticCrv/items?limit=${LIMIT}`)
    .expect(200)
    .expect(CONTENT_TYPE, GEO_JSON)
    .expect((res) => vars.save(collectionFeatures, res.body))
);

const idCrv = vars.load(collectionFeatures).features[7].id;
const lonCrv =
  vars.load(collectionFeatures).features[7].geometry.coordinates[0][0][0];
const latCrv =
  vars.load(collectionFeatures).features[7].geometry.coordinates[0][0][1];
const delta = 0.02;
// prettier-ignore
const envelopeCrv = `ENVELOPE(${lonCrv - delta},${latCrv - delta},${lonCrv + delta},${latCrv + delta})`;
const envelopeCrv4326 = `ENVELOPE(${latCrv - delta},${lonCrv - delta},${
  latCrv + delta
},${lonCrv + delta})`;
const polygonCrv = `POLYGON((${lonCrv - delta} ${latCrv},${lonCrv} ${
  latCrv - delta
},${lonCrv + delta} ${latCrv},${lonCrv} ${latCrv + delta},${
  lonCrv - delta
} ${latCrv}))`;
const polygonCrv4326 = `POLYGON((${latCrv} ${lonCrv - delta}, ${
  latCrv - delta
} ${lonCrv}, ${latCrv} ${lonCrv + delta}, ${
  latCrv + delta
} ${lonCrv}, ${latCrv} ${lonCrv - delta}))`;

describe(
  {
    title: "intersects",
    description:
      "Ensure that all queries involving operator **intersects** work correctly. <br/>\
      Collections: [Daraa - Aeronautic (Curves)](https://demo.ldproxy.net/daraa/collections/AeronauticCrv/items?f=html)",
  },
  () => {
    const tests = [
      {
        query: { filter: "s_InterSectS(geometry,geometry)" },
        filter: (f) => true,
        expect: featuresMatch,
      },
      {
        query: {
          filter: `s_InterSectS(geometry,${vars.load(ENVELOPE_COLLECTION)})`,
        },
        filter: (f) => true,
        expect: featuresMatch,
      },
      {
        query: {
          filter: `s_InterSectS(${vars.load(ENVELOPE_COLLECTION)},geometry)`,
        },
        filter: (f) => true,
        expect: featuresMatch,
      },
      {
        query: {
          filter: `s_InterSectS(geometry,${envelopeCrv})`,
        },
        filter: (f) => f.id === idCrv,
        withBody: async (body) => {
          vars.save("test4res", body);
        },
        expect: shouldIncludeId,
      },

      {
        query: {
          filter: `s_InterSectS(${envelopeCrv},geometry)`,
        },
        filter: (f) => f.id === idCrv,
        expect: shouldIncludeId,
      },
      {
        query: {
          filter: `s_InterSectS(${envelopeCrv4326},geometry)`,
          "filter-crs": "http://www.opengis.net/def/crs/EPSG/0/4326",
        },
        filter: null,
        getExpected: () => vars.load("test4res"),
        expect: featuresMatch,
      },
      {
        query: {
          filter: `s_InterSectS(geometry,${polygonCrv})`,
        },
        filter: (f) => f.id === idCrv,
        withBody: async (body) => {
          vars.save("test6res", body);
        },
        expect: shouldIncludeId,
      },
      {
        query: {
          filter: `s_InterSectS(geometry, ${polygonCrv4326})`,
          "filter-crs": "http://www.opengis.net/def/crs/EPSG/0/4326",
        },
        filter: null,
        getExpected: () => vars.load("test6res"),
        expect: featuresMatch,
      },
    ];

    for (const test of tests) {
      it(qs.stringify(test.query, { encode: false }), () =>
        //Data is selected using filter

        api
          .get("/daraa/collections/AeronauticCrv/items")
          .query({ limit: LIMIT, ...test.query })

          // Success and returns GeoJSON

          .expect(200)
          .expect(CONTENT_TYPE, GEO_JSON)

          // Saves response if it is needed later

          .expect(async (res) => {
            if (test.withBody) {
              await test.withBody(res.body);
            }

            // Either calls shouldIncludeId or featuresMatch

            test.expect(res.body, test, vars.load(collectionFeatures));
          })
      );
    }
  }
);

import { init } from "@catsjs/core";
import qs from "qs";
import {
  featuresMatch,
  numberCheckSubtraction,
  shouldIncludeId,
  shouldNotIncludeId,
} from "../expectFunctions.js";

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

const lonCrv =
  vars.load(collectionFeatures).features[7].geometry.coordinates[0][0][0];
const latCrv =
  vars.load(collectionFeatures).features[7].geometry.coordinates[0][0][1];
const delta = 0.02;
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
const idCrv = vars.load(collectionFeatures).features[7].id;
const pointCrv = `POINT(${lonCrv} ${latCrv})`;
const pointCrv4326 = `POINT(${latCrv} ${lonCrv})`;

describe(
  {
    title: "within",
    description:
      "Ensure that all queries involving operator **within** work correctly. <br/>\
      Collections: [Daraa - Aeronautic (Curves)](https://demo.ldproxy.net/daraa/collections/AeronauticCrv/items?f=html)",
  },
  () => {
    const tests = [
      {
        query: { filter: `s_WithiN(geometry,${polygonCrv})` },
        withBody: async (body) => {
          vars.save("test1res", body);
        },
        filter: (f) => f.id === idCrv,
        expect: shouldIncludeId,
        additional: (body) => {
          body.should.have.property("numberReturned").which.is.greaterThan(0);
        },
      },
      {
        query: {
          filter: `s_WithiN(geometry,${polygonCrv4326})`,
          "filter-crs": "http://www.opengis.net/def/crs/EPSG/0/4326",
        },
        getExpected: () => vars.load(test1res),
        filter: null,
        expect: featuresMatch,
      },
      {
        query: { filter: `NoT s_WithiN(geometry,${polygonCrv})` },
        withBody: async (body) => {
          vars.save("test3res", body);
        },
        filter: (f) => f.id === idCrv,
        expect: shouldNotIncludeId,
        additional: numberCheckSubtraction,
      },
      {
        query: {
          filter: `NoT s_WithiN(geometry,${polygonCrv4326})`,
          "filter-crs": "http://www.opengis.net/def/crs/EPSG/0/4326",
        },
        getExpected: () => vars.load(test3res),
        expect: featuresMatch,
        filter: null,
      },
      {
        query: {
          filter: `s_WithiN(${pointCrv}, ${polygonCrv})`,
        },
        withBody: async (body) => {
          vars.save("test5res", body);
        },
        expect: featuresMatch,
        filter: null,
      },
      {
        query: {
          filter: `s_WithiN(${pointCrv4326}, ${polygonCrv4326})`,
          "filter-crs": "http://www.opengis.net/def/crs/EPSG/0/4326",
        },
        getExpected: () => vars.load(test5res),
        expect: featuresMatch,
        filter: null,
      },
      {
        query: {
          filter: `NoT s_WithiN(geometry,${polygonCrv})`,
        },
        withBody: async (body) => {
          vars.save("test7res", body);
        },
        expect: (body) =>
          body.should.have.property("numberReturned").which.equals(12),
        filter: null,
      },
      {
        query: {
          filter: `NoT s_WithiN(geometry,${polygonCrv4326})`,
          "filter-crs": "http://www.opengis.net/def/crs/EPSG/0/4326",
        },
        getExpected: () => vars.load(test7res),
        expect: featuresMatch,
        filter: null,
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
            test.additional
              ? test.additional(
                  res.body,
                  collectionFeatures,
                  vars.load(test1res)
                )
              : null;
          })
      );
    }
  }
);

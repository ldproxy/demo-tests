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

const delta = 0.02;
const lonCrv =
  vars.load(collectionFeatures).features[7].geometry.coordinates[0][0][0];
const latCrv =
  vars.load(collectionFeatures).features[7].geometry.coordinates[0][0][1];
const pointCrv = `POINT(${lonCrv} ${latCrv})`;
const pointCrv4326 = `POINT(${latCrv} ${lonCrv})`;
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
    title: "spatial operators",
  },
  () => {
    describe(
      {
        title: "touches",
        description:
          "Ensure that all queries involving operator **touches** work correctly. <br/>\
      Collections: [Daraa - Aeronautic (Curves)](https://demo.ldproxy.net/daraa/collections/AeronauticCrv/items?f=html)",
      },
      () => {
        const tests = [
          {
            query: { filter: `s_ToUcHeS(geometry,${pointCrv})` },
            withBody: async (body) => {
              vars.save("test1res", body);
            },
            filter: (f) => f.id === idCrv,
            expect: shouldIncludeId,
            additional: (body) => {
              body.should.have
                .property("numberReturned")
                .which.is.greaterThan(0);
            },
            additional1: (body) => {
              body.should.have
                .property("numberReturned")
                .which.is.greaterThan(1);
            },
          },
          {
            query: {
              filter: `s_ToUcHeS(geometry,${pointCrv4326})`,
              "filter-crs": "http://www.opengis.net/def/crs/EPSG/0/4326",
            },
            getExpected: () => vars.load("test1res"),
            filter: null,
            expect: featuresMatch,
          },
          {
            query: {
              filter: `s_ToUcHeS(geometry,${polygonCrv})`,
            },
            withBody: async (body) => {
              vars.save("test3res", body);
            },
            filter: null,
            expect: (body) =>
              body.should.have.property("numberReturned").which.equals(0),
          },
          {
            query: {
              filter: `s_ToUcHeS(geometry,${polygonCrv4326})`,
              "filter-crs": "http://www.opengis.net/def/crs/EPSG/0/4326",
            },
            getExpected: () => vars.load("test3res"),
            filter: null,
            expect: featuresMatch,
          },
          {
            query: {
              filter: `s_ToUcHeS(geometry, geometry)`,
            },
            filter: null,
            expect: (body) =>
              body.should.have.property("numberReturned").which.equals(0),
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
                test.additional ? test.additional(res.body) : null;
                test.additional1 ? test.additional1(res.body) : null;
              })
          );
        }
      }
    );
  }
);

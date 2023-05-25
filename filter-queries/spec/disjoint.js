/*
import { init } from "@catsjs/core";
import qs from "qs";
import chai from "chai";
chai.should();

const { api, setup, vars } = await init();

const CONTENT_TYPE = "Content-Type";
const GEO_JSON = "application/geo+json";
const JSON = "application/json";

const AERONAUTIC_CRV_FEATURES = "allAeronauticCrvFeatures";
const ENVELOPE_COLLECTION = "envelopeCollection";
const LIMIT = 250;

await setup("fetch AeronauticCrv Collection", async () =>
  api
    .get(`/daraa/collections/AeronauticCrv`)
    .accept(JSON)
    .expect(200)
    .expect(CONTENT_TYPE, JSON)
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
    .expect((res) => vars.save(AERONAUTIC_CRV_FEATURES, res.body))
);

const lonCrv = vars.load(AERONAUTIC_CRV_FEATURES).features[7].geometry
  .coordinates[0][0][0];
const latCrv = vars.load(AERONAUTIC_CRV_FEATURES).features[7].geometry
  .coordinates[0][0][1];
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
const test7Res = api
  .get("/daraa/collections/AeronauticCrv/items")
  .query({ limit: LIMIT, filter: `s_InterSectS(geometry,${polygonCrv})` });
const test1Res = api
  .get("/daraa/collections/AeronauticCrv/items")
  .query({ limit: LIMIT, filter: `NoT s_DisJoinT(geometry,${polygonCrv})` });

describe(
  {
    title: "disjoint",
    description:
      "Ensure that all queries involving operator **disjoint** work correctly. <br/>\
      Collections: [Daraa - Aeronautic (Curves)](https://demo.ldproxy.net/daraa/collections/AeronauticCrv/items?f=html)",
  },
  () => {
    const tests = [
      {
        query: { filter: `NoT s_DisJoinT(geometry,${polygonCrv})` },
        filter: async (f) => {
          return test7Res.body.features.some(
            (feature) => feature.properties.id === f.properties.id
          );
        },
      },
      {
        query: {
          filter: `NoT s_DisJoinT(geometry,${polygonCrv4326})`,
        },
        filter: async (f) => {
          return test1Res.body.features.some(
            (feature) => feature.properties.id === f.properties.id
          );
        },
      },
      //getQuery4326?
      {
        query: {
          filter: `NoT s_DisJoinT(geometry,${polygonCrv4326})`,
        },
        filter: async (f) => {
          return test1Res.body.features.some(
            (feature) => feature.properties.id === f.properties.id
          );
        },
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

          // returns correct amount of features

          .expect((res) => {
            const expected = vars
              .load(AERONAUTIC_CRV_FEATURES)
              .features.filter(test.filter);

            res.body.should.have
              .property("numberReturned")
              .which.equals(expected.length);

            //returns the expected features:

            const actual = res.body.features;

            for (let i = 0; i < actual.length; i++) {
              actual[i].should.have.property("id").which.equals(expected[i].id);
              actual[i].should.have
                .property("type")
                .which.equals(expected[i].type);
              actual[i].should.have
                .property("geometry")
                .which.deep.equals(expected[i].geometry);
              actual[i].should.have
                .property("properties")
                .which.deep.equals(expected[i].properties);
            }
          })
      );
    }
  }
);
*/

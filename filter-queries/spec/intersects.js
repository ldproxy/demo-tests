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
    .get(`/collections/AeronauticCrv`)
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
    .get(`/collections/AeronauticCrv/items?limit=${LIMIT}`)
    .expect(200)
    .expect(CONTENT_TYPE, GEO_JSON)
    .expect((res) => vars.save(AERONAUTIC_CRV_FEATURES, res.body))
);

const idCrv = vars.load(AERONAUTIC_CRV_FEATURES).features[7].id;
const lonCrv = vars.load(AERONAUTIC_CRV_FEATURES).features[7].geometry
  .coordinates[0][0][0];
const latCrv = vars.load(AERONAUTIC_CRV_FEATURES).features[7].geometry
  .coordinates[0][0][1];
const delta = 0.02;
const envelopeCrv = `ENVELOPE(${lonCrv - delta},${latCrv - delta},${
  lonCrv + delta
},${latCrv + delta})`;
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
      },
      {
        query: {
          filter: `s_InterSectS(geometry,${vars.load(ENVELOPE_COLLECTION)})`,
        },
        filter: (f) => true,
      },
      {
        query: {
          filter: `s_InterSectS(${vars.load(ENVELOPE_COLLECTION)},geometry)`,
        },
        filter: (f) => true,
      },
      {
        query: {
          filter: `s_InterSectS(geometry,${envelopeCrv})`,
        },
        filter: (f) => f.id === idCrv,
      },
      {
        query: {
          filter: `s_InterSectS(${envelopeCrv},geometry)`,
        },
        filter: (f) => f.id === idCrv,
      },
      {
        query: {
          filter: `s_InterSectS(${envelopeCrv4326},geometry)`,
        },
        filter: (f) => f.id === envelopeCrv,
      },
      {
        query: {
          filter: `s_InterSectS(geometry,${polygonCrv})`,
        },
        filter: (f) => f.id === idCrv,
      },
      {
        query: {
          filter: `s_InterSectS(geometry, ${polygonCrv4326})`,
        },
        filter: async (f) => {
          const propertyAndLiteral3 = await getRequest(
            restClient,
            AERONAUTIC_CRV_PATH,
            getQuery(`s_InterSectS(geometry, ${polygonCrv})`)
          );
          return propertyAndLiteral3.body.features.some(
            (feature) => feature.id === f.id
          );
        },
      },
    ];

    for (const test of tests) {
      it(qs.stringify(test.query, { encode: false }), () =>
        //Data is selected using filter

        api
          .get("/collections/AeronauticCrv/items")
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

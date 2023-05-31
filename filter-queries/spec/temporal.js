import { init } from "@catsjs/core";
import qs from "qs";
import { featuresMatch } from "../expectFunctions.js";
import chai from "chai";
chai.should();

const { api, setup, vars } = await init();

const CONTENT_TYPE = "Content-Type";
const GEO_JSON = "application/geo+json";
const CultureFeatures = "allCulturePntFeatures";
const BoundaryFeatures = "allBoundaryFeatures";
const LIMIT = 250;

await setup("fetch all CulturePnt features", async () =>
  api
    .get(`/daraa/collections/CulturePnt/items?limit=${LIMIT}`)
    .expect(200)
    .expect(CONTENT_TYPE, GEO_JSON)
    .expect((res) => vars.save(CultureFeatures, res.body))
);

await setup("fetch all Boundary features", async () =>
  api
    .get(`/cshapes/collections/boundary/items?limit=${LIMIT}`)
    .expect(200)
    .expect(CONTENT_TYPE, GEO_JSON)
    .expect((res) => vars.save(BoundaryFeatures, res.body))
);

describe(
  {
    title: "temporal operators",
  },
  () => {
    describe(
      {
        title: "t_intersects",
        description:
          "Ensure that all queries involving operator **t_intersects** work correctly. <br/>\
      Collections: [Daraa - Cultural Points](https://demo.ldproxy.net/daraa/collections/CulturePnt/items?f=html)",
      },
      () => {
        console.log("aaa", vars.load(CultureFeatures).features[0].properties);

        const tests = [
          {
            query: {
              filter: `t_IntErSectS(ZI001_SDV, INTERVAL('2011-12-01T00:00:00Z','2011-12-31T23:59:59Z'))`,
            },
            withBody: (body) => {
              vars.save("test1res", body);
            },
            filter: (f) =>
              f.properties.ZI001_SDV > "2011-12" &&
              f.properties.ZI001_SDV < "2012",
            expect: featuresMatch,
          },
          {
            query: {
              filter: `t_IntErSectS(ZI001_SDV, INTERVAL('..','2011-12-31T23:59:59Z'))`,
            },
            withBody: (body) => {
              vars.save("test2res", body);
            },
            filter: (f) => f.properties.ZI001_SDV < "2012",
            expect: featuresMatch,
          },
          {
            query: {
              filter: `t_IntErSectS(ZI001_SDV, INTERVAL('2012-01-01T00:00:00Z','..'))`,
            },
            withBody: (body) => {
              vars.save("test3res", body);
            },
            filter: (f) => f.properties.ZI001_SDV > "2012",
            expect: featuresMatch,
          },
          {
            query: {
              filter: `t_IntErSectS(ZI001_SDV, INTERVAL('..','..'))`,
            },
            withBody: (body) => {
              vars.save("test4res", body);
            },
            filter: () => true,
            expect: featuresMatch,
          },
          {
            query: {
              filter: `t_IntErSectS(ZI001_SDV,InterVaL('2011-12-27T00:00:00Z','2011-12-27T23:59:59Z'))`,
            },
            withBody: (body) => {
              vars.save("test5res", body);
            },
            filter: (f) =>
              f.properties.ZI001_SDV > "2011-12-27" &&
              f.properties.ZI001_SDV < "2011-12-28",
            expect: featuresMatch,
          },
          {
            query: {
              filter: `t_IntErSectS(ZI001_SDV, TIMESTAMP('2011-12-26T20:55:27Z'))`,
            },
            withBody: (body) => {
              vars.save("test6res", body);
            },
            filter: (f) => f.properties.ZI001_SDV == "2011-12-26T20:55:27Z",
            expect: featuresMatch,
          },
          {
            query: {
              filter: `t_IntErSectS(ZI001_SDV, ZI001_SDV)`,
            },
            filter: () => true,
            expect: featuresMatch,
          },
          {
            query: {
              filter: `t_IntErSectS(INTERVAL('2011-12-01T00:00:00Z','2011-12-31T23:59:59Z'), ZI001_SDV)`,
            },
            filter: null,
            getExpected: () => vars.load("test1res").features,
            expect: featuresMatch,
          },
          {
            query: {
              filter: `t_IntErSectS(INTERVAL('..','2011-12-31T23:59:59Z'), ZI001_SDV)`,
            },
            filter: null,
            getExpected: () => vars.load("test2res").features,
            expect: featuresMatch,
          },
          {
            query: {
              filter: `t_IntErSectS(INTERVAL('2012-01-01T00:00:00Z','..'), ZI001_SDV)`,
            },
            filter: null,
            getExpected: () => vars.load("test3res").features,
            expect: featuresMatch,
          },
          {
            query: {
              filter: `t_IntErSectS(INTERVAL('..','..'), ZI001_SDV)`,
            },
            filter: null,
            getExpected: () => vars.load("test4res").features,
            expect: featuresMatch,
          },
          {
            query: {
              filter: `t_IntErSectS(InterVaL('2011-12-27T00:00:00Z','2011-12-27T23:59:59Z'), ZI001_SDV)`,
            },
            filter: null,
            getExpected: () => vars.load("test5res").features,
            expect: featuresMatch,
          },
          {
            query: {
              filter: `t_IntErSectS(TIMESTAMP('2011-12-26T20:55:27Z'), ZI001_SDV)`,
            },
            filter: null,
            getExpected: () => vars.load("test6res").features,
            expect: featuresMatch,
          },
          {
            query: {
              filter: `t_IntErSectS(TIMESTAMP('2011-12-26T20:55:27Z'), INTERVAL('2011-01-01','2011-12-31'))`,
            },
            filter: () => true,
            expect: featuresMatch,
          },
          {
            query: {
              filter: `t_IntErSectS(INTERVAL('..','2010-12-26'), INTERVAL('2011-01-01','2011-12-31'))`,
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
              .get("/daraa/collections/CulturePnt/items")
              .query({ limit: LIMIT, ...test.query })

              // Success and returns GeoJSON

              .expect(200)
              .expect(CONTENT_TYPE, GEO_JSON)

              // Saves response if it is needed later

              .expect((res) => {
                if (test.withBody) {
                  test.withBody(res.body);
                }

                // Either calls shouldIncludeId or featuresMatch

                test.expect(res.body, test, vars.load(CultureFeatures));
              })
          );
        }
      }
    );
    describe(
      {
        title: "t_intersects",
        description:
          "Ensure that all queries involving operator **t_intersects** work correctly. <br/>\
      Collections: [Cshapes - Boundary](https://demo.ldproxy.net/cshapes/collections/boundary/items?f=html)",
      },
      () => {
        const tests = [
          {
            query: {
              filter: `CASEI(name) LIKE CASEI('%Germany%') AND T_INTERSECTS(INTERVAL(cowbegin,cowend),INTERVAL('1955-01-01','1990-10-02'))`,
            },
            filter: (f) =>
              f.properties.name.toLowerCase().startsWith("germany") &&
              !(
                f.properties.cowend < "1955-01-01" ||
                f.properties.cowbegin >= "1990-10-03"
              ),
            expect: featuresMatch,
          },
          {
            query: {
              filter: `T_INTERSECTS(INTERVAL(cowbegin,'..'),INTERVAL('..',cowend))`,
            },
            filter: null,
            expect: (body) => {
              body.should.have
                .property("numberReturned")
                .which.equals(vars.load(BoundaryFeatures).length);
            },
          },
        ];

        for (const test of tests) {
          it(qs.stringify(test.query, { encode: false }), () =>
            //Data is selected using filter

            api
              .get("/cshapes/collections/boundary/items")
              .query({ limit: LIMIT, ...test.query })

              // Success and returns GeoJSON

              .expect(200)
              .expect(CONTENT_TYPE, GEO_JSON)

              // Saves response if it is needed later

              .expect((res) => {
                if (test.withBody) {
                  test.withBody(res.body);
                }

                // Either calls shouldIncludeId or featuresMatch

                test.expect(res.body, test, vars.load(BoundaryFeatures));
              })
          );
        }
      }
    );
  }
);

import { init } from "@catsjs/core";
import qs from "qs";
import {
  featuresMatch,
  numberCheckSubtraction,
  shouldIncludeId,
  shouldNotIncludeId,
  firstFeatureMatches,
} from "../expectFunctions.js";

const { api, setup, vars } = await init();

const CONTENT_TYPE = "Content-Type";
const GEO_JSON = "application/geo+json";
const JSON_CONTENT_TYPE = "application/json";

const AeronauticFeatures = "allAeronauticCrvFeatures";
const CultureFeatures = "allCulturePntFeatures";
const TestDisjoint = "testForDisjoint";
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
        `BBOX(${res.body.extent.spatial.bbox[0].join(",")})`
      );
    })
);

await setup("fetch all AeronauticCrv features", async () =>
  api
    .get(`/daraa/collections/AeronauticCrv/items?limit=${LIMIT}`)
    .expect(200)
    .expect(CONTENT_TYPE, GEO_JSON)
    .expect((res) => vars.save(AeronauticFeatures, res.body))
);

await setup("fetch all CulturePnt features", async () =>
  api
    .get(`/daraa/collections/CulturePnt/items?limit=${LIMIT}`)
    .expect(200)
    .expect(CONTENT_TYPE, GEO_JSON)
    .expect((res) => vars.save(CultureFeatures, res.body))
);

const idCrv = vars.load(AeronauticFeatures).features[7].id;
const delta = 0.02;
const lonCrv =
  vars.load(AeronauticFeatures).features[7].geometry.coordinates[0][0][0];
const latCrv =
  vars.load(AeronauticFeatures).features[7].geometry.coordinates[0][0][1];
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
// prettier-ignore
const envelopeCrv = `BBOX(${lonCrv - delta},${latCrv - delta},${lonCrv + delta},${latCrv + delta})`;
const envelopeCrv4326 = `BBOX(${latCrv - delta},${lonCrv - delta},${
  latCrv + delta
},${lonCrv + delta})`;
const lonPnt =
  vars.load(CultureFeatures).features[0].geometry.coordinates[0][0];
const latPnt =
  vars.load(CultureFeatures).features[0].geometry.coordinates[0][1];
const pointPnt = `POINT(${lonPnt} ${latPnt})`;
const pointPnt4326 = `POINT(${latPnt} ${lonPnt})`;

await setup("fetch response for s_disjoint tests", async () =>
  api
    .get("/daraa/collections/AeronauticCrv/items")
    .query({ limit: LIMIT, filter: `s_InterSectS(geometry,${polygonCrv})` })
    .expect(200)
    .expect(CONTENT_TYPE, GEO_JSON)
    .expect((res) => vars.save(TestDisjoint, res.body))
);

describe(
  {
    title: "spatial operators",
  },
  () => {
    describe(
      {
        title: "s_intersects",
        description:
          "Ensure that all queries involving operator **s_intersects** work correctly. <br/>\
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
              filter: `s_InterSectS(geometry,${vars.load(
                ENVELOPE_COLLECTION
              )})`,
            },
            filter: (f) => true,
            expect: featuresMatch,
          },
          {
            query: {
              filter: `s_InterSectS(${vars.load(
                ENVELOPE_COLLECTION
              )},geometry)`,
            },
            filter: (f) => true,
            expect: featuresMatch,
          },
          {
            query: {
              filter: `s_InterSectS(geometry,${envelopeCrv})`,
            },
            filter: (f) => f.id === idCrv,
            withBody: (body) => {
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
            getExpected: () => vars.load("test4res").features,
            expect: featuresMatch,
          },
          {
            query: {
              filter: `s_InterSectS(geometry,${polygonCrv})`,
            },
            filter: (f) => f.id === idCrv,
            withBody: (body) => {
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
            getExpected: () => vars.load("test6res").features,
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

              .expect((res) => {
                if (test.withBody) {
                  test.withBody(res.body);
                }

                // Either calls shouldIncludeId or featuresMatch

                test.expect(res.body, test, vars.load(AeronauticFeatures));
              })
          );
        }
      }
    );
    describe(
      {
        title: "s_equals",
        description:
          "Ensure that all queries involving operator **s_equals** work correctly. <br/>\
          Collections: [Daraa - Cultural Points](https://demo.ldproxy.net/daraa/collections/CulturePnt/items?f=html)",
      },
      () => {
        const tests = [
          {
            query: {
              filter: `s_EqualS(geometry, ${pointPnt})`,
            },
            withBody: (body) => {
              vars.save("test1res", body);
            },
            filter: null,
            expect: firstFeatureMatches,
            additional: (body) => {
              body.should.have.property("numberReturned").which.equals(1);
            },
          },
          {
            query: {
              filter: `s_EqualS(geometry, ${pointPnt4326})`,
              "filter-crs": "http://www.opengis.net/def/crs/EPSG/0/4326",
            },
            getExpected: () => vars.load("test1res").features,
            filter: null,
            expect: featuresMatch,
          },
          {
            query: {
              filter: `NoT s_EqualS(geometry, ${pointPnt})`,
            },
            withBody: (body) => {
              vars.save("test3res", body);
            },
            filter: null,
            expect: (body) => {
              return (
                body.numberReturned ===
                vars.load(CultureFeatures).numberReturned - 1
              );
            },
          },
          {
            query: {
              filter: `NoT s_EqualS(geometry, ${pointPnt4326})`,
              "filter-crs": "http://www.opengis.net/def/crs/EPSG/0/4326",
            },
            getExpected: () => vars.load("test3res").features,
            filter: null,
            expect: featuresMatch,
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
                test.additional ? test.additional(res.body) : null;
              })
          );
        }
      }
    );
    describe(
      {
        title: "s_disjoint",
        description:
          "Ensure that all queries involving operator **s_disjoint** work correctly. <br/>\
          Collections: [Daraa - Aeronautic (Curves)](https://demo.ldproxy.net/daraa/collections/AeronauticCrv/items?f=html)",
      },
      () => {
        const tests = [
          {
            query: { filter: `NoT s_DisJoinT(geometry,${polygonCrv})` },
            filter: null,
            withBody: (body) => {
              vars.save("test1res", body);
            },
            getExpected: () => vars.load(TestDisjoint).features,
            expect: featuresMatch,
          },
          {
            query: {
              filter: `NoT s_DisJoinT(geometry,${polygonCrv4326})`,
              "filter-crs": "http://www.opengis.net/def/crs/EPSG/0/4326",
            },
            filter: null,
            getExpected: () => vars.load("test1res").features,
            expect: featuresMatch,
          },
          {
            query: { filter: `NoT s_DisJoinT(geometry,${polygonCrv})` },
            filter: (f) => f.id === idCrv,
            withBody: (body) => {
              vars.save("test3res", body);
            },
            getExpected: () => vars.load("test1res").features,
            expect: shouldNotIncludeId,
            additional: numberCheckSubtraction,
          },
          {
            query: {
              filter: `NoT s_DisJoinT(geometry,${polygonCrv4326})`,
              "filter-crs": "http://www.opengis.net/def/crs/EPSG/0/4326",
            },
            getExpected: () => vars.load("test3res").features,
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

              .expect((res) => {
                if (test.withBody) {
                  test.withBody(res.body);
                }

                // Either calls shouldIncludeId or featuresMatch

                test.expect(res.body, test, vars.load(AeronauticFeatures));
                test.additional
                  ? test.additional(
                      res.body,
                      vars.load(AeronauticFeatures),
                      vars.load(TestDisjoint)
                    )
                  : null;
              })
          );
        }
      }
    );
    describe(
      {
        title: "s_touches",
        description:
          "Ensure that all queries involving operator **s_touches** work correctly. <br/>\
      Collections: [Daraa - Aeronautic (Curves)](https://demo.ldproxy.net/daraa/collections/AeronauticCrv/items?f=html)",
      },
      () => {
        const tests = [
          {
            query: { filter: `s_ToUcHeS(geometry,${pointCrv})` },
            withBody: (body) => {
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
            getExpected: () => vars.load("test1res").features,
            filter: null,
            expect: featuresMatch,
          },
          {
            query: {
              filter: `s_ToUcHeS(geometry,${polygonCrv})`,
            },
            withBody: (body) => {
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
            getExpected: () => vars.load("test3res").features,
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

              .expect((res) => {
                if (test.withBody) {
                  test.withBody(res.body);
                }

                // Either calls shouldIncludeId or featuresMatch

                test.expect(res.body, test, vars.load(AeronauticFeatures));
                test.additional ? test.additional(res.body) : null;
                test.additional1 ? test.additional1(res.body) : null;
              })
          );
        }
      }
    ),
      describe(
        {
          title: "s_within",
          description:
            "Ensure that all queries involving operator **s_within** work correctly. <br/>\
          Collections: [Daraa - Aeronautic (Curves)](https://demo.ldproxy.net/daraa/collections/AeronauticCrv/items?f=html)",
        },
        () => {
          const tests = [
            {
              query: { filter: `s_WithiN(geometry,${polygonCrv})` },
              withBody: (body) => {
                vars.save("test1res", body);
              },
              filter: (f) => f.id === idCrv,
              expect: shouldIncludeId,
              additional: (body) => {
                body.should.have
                  .property("numberReturned")
                  .which.is.greaterThan(0);
              },
            },
            {
              query: {
                filter: `s_WithiN(geometry,${polygonCrv4326})`,
                "filter-crs": "http://www.opengis.net/def/crs/EPSG/0/4326",
              },
              getExpected: () => vars.load("test1res").features,
              filter: null,
              expect: featuresMatch,
            },
            {
              query: { filter: `NoT s_WithiN(geometry,${polygonCrv})` },
              withBody: (body) => {
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
              getExpected: () => vars.load("test3res").features,
              expect: featuresMatch,
              filter: null,
            },
            {
              query: {
                filter: `s_WithiN(${pointCrv}, ${polygonCrv})`,
              },
              withBody: (body) => {
                vars.save("test5res", body);
              },
              expect: featuresMatch,
              filter: () => true,
            },
            {
              query: {
                filter: `s_WithiN(${pointCrv4326}, ${polygonCrv4326})`,
                "filter-crs": "http://www.opengis.net/def/crs/EPSG/0/4326",
              },
              getExpected: () => vars.load("test5res").features,
              expect: featuresMatch,
              filter: null,
            },
            {
              query: {
                filter: `NoT s_WithiN(geometry,${polygonCrv})`,
              },
              withBody: (body) => {
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
              getExpected: () => vars.load("test7res").features,
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

                .expect((res) => {
                  if (test.withBody) {
                    test.withBody(res.body);
                  }

                  // Either calls shouldIncludeId or featuresMatch

                  test.expect(res.body, test, vars.load(AeronauticFeatures));
                  test.additional
                    ? test.additional(
                        res.body,
                        vars.load(AeronauticFeatures),
                        vars.load("test1res")
                      )
                    : null;
                })
            );
          }
        }
      );
    describe(
      {
        title: "s_overlaps",
        description:
          "Ensure that all queries involving operator **s_overlaps** work correctly. <br/>\
          Collections: [Daraa - Cultural Points](https://demo.ldproxy.net/daraa/collections/CulturePnt/items?f=html)",
      },
      () => {
        const tests = [
          {
            query: {
              filter: `s_OvErLaPs(geometry, ${pointPnt})`,
            },
            withBody: (body) => {
              vars.save("test1res", body);
            },
            filter: null,
            expect: (body) => {
              body.should.have.property("numberReturned").which.equals(0);
            },
          },
          {
            query: {
              filter: `s_OvErLaPs(geometry, ${pointPnt4326})`,
              "filter-crs": "http://www.opengis.net/def/crs/EPSG/0/4326",
            },
            getExpected: () => vars.load("test1res").features,
            filter: null,
            expect: featuresMatch,
          },
          {
            query: {
              filter: `s_OvErLaPs(geometry, geometry)`,
            },
            filter: null,
            expect: (body) => {
              body.should.have.property("numberReturned").which.equals(0);
            },
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
                test.additional ? test.additional(res.body) : null;
              })
          );
        }
      }
    );
    describe(
      {
        title: "s_crosses",
        description:
          "Ensure that all queries involving operator **s_crosses** work correctly. <br/>\
          Collections: [Daraa - Aeronautic (Curves)](https://demo.ldproxy.net/daraa/collections/AeronauticCrv/items?f=html)",
      },
      () => {
        const tests = [
          {
            query: { filter: `s_CrOsSeS(geometry,${polygonCrv})` },
            withBody: (body) => {
              vars.save("test1res", body);
            },
            filter: null,
            expect: (body) => {
              body.should.have.property("numberReturned").which.is.equals(1);
            },
          },
          {
            query: {
              filter: `s_CrOsSeS(geometry,${polygonCrv4326})`,
              "filter-crs": "http://www.opengis.net/def/crs/EPSG/0/4326",
            },
            getExpected: () => vars.load("test1res").features,
            filter: null,
            expect: featuresMatch,
          },
          {
            query: {
              filter: `s_CrOsSeS(geometry, geometry)`,
            },
            filter: null,
            expect: (body) => {
              body.should.have.property("numberReturned").which.equals(0);
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

              // Saves response if it is needed later

              .expect((res) => {
                if (test.withBody) {
                  test.withBody(res.body);
                }

                // Either calls shouldIncludeId or featuresMatch

                test.expect(res.body, test, vars.load(AeronauticFeatures));
              })
          );
        }
      }
    );
  }
);

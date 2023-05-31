import { init } from "@catsjs/core";
import qs from "qs";
import { featuresMatch } from "../expectFunctions.js";
import chai from "chai";
chai.should();

const { api, setup, vars } = await init();

const CONTENT_TYPE = "Content-Type";
const GEO_JSON = "application/geo+json";
const collectionFeatures = "allCulturePntFeatures";
const LIMIT = 250;

await setup("fetch all CulturePnt features", async () =>
  api
    .get(`/daraa/collections/CulturePnt/items?limit=${LIMIT}`)
    .expect(200)
    .expect(CONTENT_TYPE, GEO_JSON)
    .expect((res) => vars.save(collectionFeatures, res.body))
);

describe(
  {
    title: "simple operators",
  },
  () => {
    describe(
      {
        title: "between",
        description:
          "Ensure that all queries involving operator **between** work correctly. <br/>\
      Collections: [Daraa - Cultural Points](https://demo.ldproxy.net/daraa/collections/CulturePnt/items?f=html)",
      },
      () => {
        const tests = [
          {
            query: { filter: "ZI037_REL BeTweeN ZI037_REL AnD ZI037_REL" },
            filter: (f) => {
              const zi037Rel = f.properties.ZI037_REL;
              return (
                typeof zi037Rel === "number" &&
                zi037Rel >= zi037Rel &&
                zi037Rel <= zi037Rel
              );
            },
            expect: featuresMatch,
          },
          {
            query: { filter: "ZI037_REL not BeTweeN ZI037_REL AnD ZI037_REL" },
            filter: (f) => false,
            expect: featuresMatch,
          },
          {
            query: { filter: "ZI037_REL BeTweeN 0 AnD 10" },
            filter: (f) => {
              const zi037Rel = f.properties.ZI037_REL;
              return (
                typeof zi037Rel === "number" && zi037Rel >= 0 && zi037Rel <= 10
              );
            },
            expect: featuresMatch,
          },
          {
            query: { filter: "ZI037_REL BeTweeN 0 AnD 11" },
            filter: (f) => {
              const zi037Rel = f.properties.ZI037_REL;
              return (
                typeof zi037Rel === "number" && zi037Rel >= 0 && zi037Rel <= 11
              );
            },
            expect: featuresMatch,
          },
          {
            query: { filter: "ZI037_REL NoT BeTweeN 0 AnD 10" },
            filter: (f) => {
              const zi037Rel = f.properties.ZI037_REL;
              return (
                typeof zi037Rel === "number" &&
                !(zi037Rel >= 0 && zi037Rel <= 10)
              );
            },
            expect: featuresMatch,
          },
          {
            query: { filter: "ZI037_REL NoT BeTweeN 0 AnD 11" },
            filter: (f) => {
              const zi037Rel = f.properties.ZI037_REL;
              return (
                typeof zi037Rel === "number" &&
                !(zi037Rel >= 0 && zi037Rel <= 11)
              );
            },
            expect: featuresMatch,
          },
          {
            query: { filter: "6 BeTweeN 0 AnD ZI037_REL" },
            filter: (f) => {
              const zi037Rel = f.properties.ZI037_REL;
              return typeof zi037Rel === "number" && zi037Rel >= 6;
            },
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

                test.expect(res.body, test, vars.load(collectionFeatures));
              })
          );
        }
      }
    );
    describe(
      {
        title: "eq",
        description:
          "Ensure that all queries involving operator **eq** work correctly. <br/>\
          Collections: [Daraa - Cultural Points](https://demo.ldproxy.net/daraa/collections/CulturePnt/items?f=html)",
      },
      () => {
        const tests = [
          {
            query: { filter: "F_CODE=F_CODE" },
            filter: (f) => true,
            expect: featuresMatch,
          },
          {
            query: { filter: "F_CODE='AL030'" },
            filter: (f) => f.properties.F_CODE == "AL030",
            expect: featuresMatch,
          },
          {
            query: { filter: "'AL030'=F_CODE" },
            filter: (f) => f.properties.F_CODE == "AL030",
            expect: featuresMatch,
          },
          {
            query: { F_CODE: "AL030" },
            filter: (f) => f.properties.F_CODE == "AL030",
            expect: featuresMatch,
          },
          {
            query: { filter: "ZI037_REL=11" },
            filter: (f) => f.properties.ZI037_REL == 11,
            expect: featuresMatch,
          },
          {
            query: { filter: "'A'='A'" },
            filter: (f) => true,
            expect: featuresMatch,
          },
          {
            query: { filter: "\"F_CODE\"='AL030'" },
            filter: (f) => f.properties.F_CODE == "AL030",
            expect: featuresMatch,
          },
          {
            query: { filter: "ZI001_SDV=TIMESTAMP('2011-12-26T20:55:27Z')" },
            filter: (f) => f.properties.ZI001_SDV === "2011-12-26T20:55:27Z",
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

                test.expect(res.body, test, vars.load(collectionFeatures));
              })
          );
        }
      }
    );
    describe(
      {
        title: "gt",
        description:
          "Ensure that all queries involving operator **gt** work correctly. <br/>\
          Collections: [Daraa - Cultural Points](https://demo.ldproxy.net/daraa/collections/CulturePnt/items?f=html)",
      },
      () => {
        const tests = [
          {
            query: { filter: "F_CODE>F_CODE" },
            filter: (f) => false,
            expect: featuresMatch,
          },
          {
            query: { filter: "F_CODE>'AL030'" },
            filter: (f) => f.properties.F_CODE > "AL030",
            expect: featuresMatch,
          },
          {
            query: { filter: "ZI037_REL>11" },
            filter: (f) => f.properties.ZI037_REL > 11,
            expect: featuresMatch,
          },
          {
            query: { filter: "ZI037_REL>0" },
            filter: (f) => f.properties.ZI037_REL > 0,
            expect: featuresMatch,
          },
          {
            query: { filter: "'AL030'>F_CODE" },
            filter: (f) => f.properties.F_CODE < "AL030",
            expect: featuresMatch,
          },
          {
            query: { filter: "'A'>'A'" },
            filter: (f) => false,
            expect: featuresMatch,
          },
          {
            query: { filter: "ZI001_SDV>TIMESTAMP('2011-12-26T20:55:27Z')" },
            filter: (f) => f.properties.ZI001_SDV > "2011-12-26T20:55:27Z",
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

                test.expect(res.body, test, vars.load(collectionFeatures));
              })
          );
        }
      }
    );
    describe(
      {
        title: "gteq",
        description:
          "Ensure that all queries involving operator **gteq** work correctly. <br/>\
          Collections: [Daraa - Cultural Points](https://demo.ldproxy.net/daraa/collections/CulturePnt/items?f=html)",
      },
      () => {
        const tests = [
          {
            query: { filter: "F_CODE>=F_CODE" },
            filter: (f) => true,
            expect: featuresMatch,
          },
          {
            query: { filter: "F_CODE>='AL030'" },
            filter: (f) => f.properties.F_CODE >= "AL030",
            expect: featuresMatch,
          },
          {
            query: { filter: "ZI037_REL>=11" },
            filter: (f) => f.properties.ZI037_REL >= 11,
            expect: featuresMatch,
          },
          {
            query: { filter: "ZI037_REL>=10" },
            filter: (f) => f.properties.ZI037_REL >= 10,
            expect: featuresMatch,
          },
          {
            query: { filter: "'AL030'>=F_CODE" },
            filter: (f) => f.properties.F_CODE <= "AL030",
            expect: featuresMatch,
          },
          {
            query: { filter: "'A'>='A'" },
            filter: (f) => true,
            expect: featuresMatch,
          },
          {
            query: { filter: "ZI001_SDV>=TIMESTAMP('2011-12-26T20:55:27Z')" },
            filter: (f) => f.properties.ZI001_SDV >= "2011-12-26T20:55:27Z",
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

                test.expect(res.body, test, vars.load(collectionFeatures));
              })
          );
        }
      }
    );
    describe(
      {
        title: "in",
        description:
          "Ensure that all queries involving operator **in** work correctly. <br/>\
          Collections: [Daraa - Cultural Points](https://demo.ldproxy.net/daraa/collections/CulturePnt/items?f=html)",
      },
      () => {
        const tests = [
          {
            query: {
              filter: "CASEI(F_CODE) iN (CASEI('AL030'), CASEI('AL012'))",
            },
            filter: (f) => {
              const fCode = f.properties.F_CODE.toLowerCase();
              return fCode === "al012" || fCode === "al030";
            },
            expect: featuresMatch,
          },
          {
            query: { filter: "F_CODE NoT iN ('AL030', 'AL012')" },
            filter: (f) => {
              const fCode = f.properties.F_CODE;
              return fCode !== "AL012" && fCode !== "AL030";
            },
            expect: featuresMatch,
          },
          {
            query: {
              filter: "ZI037_REL iN (11, 12)",
            },
            filter: (f) => {
              const ZI037_REL = f.properties.ZI037_REL;
              return (
                ZI037_REL !== undefined &&
                (ZI037_REL === 11 || ZI037_REL === 12)
              );
            },
            expect: featuresMatch,
          },
          {
            query: {
              filter: "ZI037_REL not iN (11, 12)",
            },
            filter: (f) => {
              const ZI037_REL = f.properties.ZI037_REL;
              return (
                ZI037_REL !== undefined &&
                !(ZI037_REL === 11 || ZI037_REL === 12)
              );
            },
            expect: featuresMatch,
          },
          {
            query: {
              filter:
                "ZI001_SDV IN (TIMESTAMP('2011-12-26T20:55:27Z'),TIMESTAMP('2021-10-10T10:10:10Z'),TIMESTAMP('2011-12-27T18:39:59Z'))",
            },
            filter: (f) => {
              const ZI001_SDV = f.properties.ZI001_SDV;
              return (
                ZI001_SDV === "2011-12-26T20:55:27Z" ||
                ZI001_SDV === "2021-10-10T10:10:10Z" ||
                ZI001_SDV === "2011-12-27T18:39:59Z"
              );
            },
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

                test.expect(res.body, test, vars.load(collectionFeatures));
              })
          );
        }
      }
    );
    describe(
      {
        title: "like",
        description:
          "Ensure that all queries involving operator **like** work correctly. <br/>\
          Collections: [Daraa - Cultural Points](https://demo.ldproxy.net/daraa/collections/CulturePnt/items?f=html)",
      },
      () => {
        const tests = [
          {
            query: { filter: "F_CODE LiKe 'AL0%'" },
            filter: (f) => f.properties.F_CODE.startsWith("AL0"),
            expect: featuresMatch,
          },
          {
            query: { filter: "F_CODE LiKe 'AL0__'" },
            filter: (f) =>
              f.properties.F_CODE.startsWith("AL0") &&
              f.properties.F_CODE.length === 5,
            expect: featuresMatch,
          },
          {
            query: { filter: "CASEI(F_CODE) LiKe casei('al0__')" },
            filter: (f) =>
              f.properties.F_CODE.match(/^AL0/i) &&
              f.properties.F_CODE.length === 5,
            expect: featuresMatch,
          },
          {
            query: { filter: "CASEI(F_CODE) LiKe casei('al0%')" },
            filter: (f) => f.properties.F_CODE.match(/^AL0/i),
            expect: featuresMatch,
          },
          {
            //To Do: Prüfen, ob der Response falsch ist. Bei case-sensitive Vergleich müssten 0 zurückkommen
            query: { filter: "F_CODE LiKe 'al0%'" },
            filter: (f) => f.properties.F_CODE.startsWith("al0"),
            expect: featuresMatch,
          },
          {
            query: { filter: "F_CODE LiKe '%''%'" },
            filter: (f) => f.properties.F_CODE.includes("'"),
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

                test.expect(res.body, test, vars.load(collectionFeatures));
              })
          );
        }
      }
    );
    describe(
      {
        title: "lt",
        description:
          "Ensure that all queries involving operator **lt** work correctly. <br/>\
          Collections: [Daraa - Cultural Points](https://demo.ldproxy.net/daraa/collections/CulturePnt/items?f=html)",
      },
      () => {
        const tests = [
          {
            query: { filter: "F_CODE<F_CODE" },
            filter: (f) => false,
            expect: featuresMatch,
          },
          {
            query: { filter: "F_CODE<'AL030'" },
            filter: (f) => f.properties.F_CODE < "AL030",
            expect: featuresMatch,
          },
          {
            query: { filter: "ZI037_REL<11" },
            filter: (f) => f.properties.ZI037_REL < 11,
            expect: featuresMatch,
          },
          {
            query: { filter: "ZI037_REL<12" },
            filter: (f) => f.properties.ZI037_REL < 12,
            expect: featuresMatch,
          },
          {
            query: { filter: "'AL030'<F_CODE" },
            filter: (f) => f.properties.F_CODE > "AL030",
            expect: featuresMatch,
          },
          {
            query: { filter: "'A'<'A'" },
            filter: (f) => false,
            expect: featuresMatch,
          },
          {
            query: { filter: "ZI001_SDV<TIMESTAMP('2011-12-26T20:55:27Z')" },
            filter: (f) => f.properties.ZI001_SDV < "2011-12-26T20:55:27Z",
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

                test.expect(res.body, test, vars.load(collectionFeatures));
              })
          );
        }
      }
    );
    describe(
      {
        title: "lteq",
        description:
          "Ensure that all queries involving operator **lteq** work correctly. <br/>\
          Collections: [Daraa - Cultural Points](https://demo.ldproxy.net/daraa/collections/CulturePnt/items?f=html)",
      },
      () => {
        const tests = [
          {
            query: { filter: "F_CODE<=F_CODE" },
            filter: (f) => true,
            expect: featuresMatch,
          },
          {
            query: { filter: "F_CODE<='AL030'" },
            filter: (f) => f.properties.F_CODE <= "AL030",
            expect: featuresMatch,
          },
          {
            query: { filter: "ZI037_REL<=11" },
            filter: (f) => f.properties.ZI037_REL <= 11,
            expect: featuresMatch,
          },
          {
            query: { filter: "ZI037_REL<=10" },
            filter: (f) => f.properties.ZI037_REL <= 10,
            expect: featuresMatch,
          },
          {
            query: { filter: "'AL030'<=F_CODE" },
            filter: (f) => f.properties.F_CODE >= "AL030",
            expect: featuresMatch,
          },
          {
            query: { filter: "'A'<='A'" },
            filter: (f) => true,
            expect: featuresMatch,
          },
          {
            query: { filter: "ZI001_SDV<=TIMESTAMP('2011-12-26T20:55:27Z')" },
            filter: (f) => f.properties.ZI001_SDV <= "2011-12-26T20:55:27Z",
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

                test.expect(res.body, test, vars.load(collectionFeatures));
              })
          );
        }
      }
    );
    describe(
      {
        title: "neq",
        description:
          "Ensure that all queries involving operator **neq** work correctly. <br/>\
          Collections: [Daraa - Cultural Points](https://demo.ldproxy.net/daraa/collections/CulturePnt/items?f=html)",
      },
      () => {
        const tests = [
          {
            query: { filter: "F_CODE<>F_CODE" },
            filter: (f) => false,
            expect: featuresMatch,
          },
          {
            query: { filter: "F_CODE<>'AL030'" },
            filter: (f) => f.properties.F_CODE !== "AL030",
            expect: featuresMatch,
          },
          {
            query: { filter: "ZI037_REL<>11" },
            filter: (f) =>
              typeof f.properties.ZI037_REL === "number" &&
              f.properties.ZI037_REL !== 11,
            expect: featuresMatch,
          },
          {
            query: { filter: "ZI037_REL<>10" },
            filter: (f) =>
              typeof f.properties.ZI037_REL === "number" &&
              f.properties.ZI037_REL !== 10,
            expect: featuresMatch,
          },
          {
            query: { filter: "'AL030'<>F_CODE" },
            filter: (f) => f.properties.F_CODE !== "AL030",
            expect: featuresMatch,
          },
          {
            query: { filter: "'A'<>'A'" },
            filter: (f) => false,
            expect: featuresMatch,
          },
          {
            query: { filter: "ZI001_SDV<>TIMESTAMP('2011-12-26T20:55:27Z')" },
            filter: (f) => f.properties.ZI001_SDV !== "2011-12-26T20:55:27Z",
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

                test.expect(res.body, test, vars.load(collectionFeatures));
              })
          );
        }
      }
    );
    describe(
      {
        title: "null",
        description:
          "Ensure that all queries involving operator **null** work correctly. <br/>\
          Collections: [Daraa - Cultural Points](https://demo.ldproxy.net/daraa/collections/CulturePnt/items?f=html)",
      },
      () => {
        const tests = [
          {
            query: { filter: "ZI037_REL iS NulL" },
            filter: (f) => f.properties.ZI037_REL === undefined,
            expect: featuresMatch,
          },
          {
            query: { filter: "ZI037_REL iS not NulL" },
            filter: (f) => f.properties.ZI037_REL !== undefined,
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

                test.expect(res.body, test, vars.load(collectionFeatures));
              })
          );
        }
      }
    );
  }
);

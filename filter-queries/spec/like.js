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

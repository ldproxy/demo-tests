import { init } from "@catsjs/core";
import qs from "qs";
import chai from "chai";
import { featuresMatch } from "../expectFunctions.js";
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

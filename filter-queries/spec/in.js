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
    title: "in",
    description:
      "Ensure that all queries involving operator **in** work correctly. <br/>\
      Collections: [Daraa - Cultural Points](https://demo.ldproxy.net/daraa/collections/CulturePnt/items?f=html)",
  },
  () => {
    const tests = [
      {
        query: { filter: "CASEI(F_CODE) iN (CASEI('AL030'), CASEI('AL012'))" },
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
            ZI037_REL !== undefined && (ZI037_REL === 11 || ZI037_REL === 12)
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
            ZI037_REL !== undefined && !(ZI037_REL === 11 || ZI037_REL === 12)
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

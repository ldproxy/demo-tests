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
            typeof zi037Rel === "number" && !(zi037Rel >= 0 && zi037Rel <= 10)
          );
        },
        expect: featuresMatch,
      },
      {
        query: { filter: "ZI037_REL NoT BeTweeN 0 AnD 11" },
        filter: (f) => {
          const zi037Rel = f.properties.ZI037_REL;
          return (
            typeof zi037Rel === "number" && !(zi037Rel >= 0 && zi037Rel <= 11)
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

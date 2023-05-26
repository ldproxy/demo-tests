/*
import { init } from "@catsjs/core";
import qs from "qs";
import chai from "chai";
import { featuresMatch, shouldIncludeId } from "../expectFunctions.js";
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

const lonPnt =
  vars.load(collectionFeatures).features[0].geometry.coordinates[0];
const latPnt =
  vars.load(collectionFeatures).features[0].geometry.coordinates[1];
const pointPnt = `POINT(${lonPnt} ${latPnt})`;

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
        query: {
          filter: `s_EqualS(geometry, ${pointPnt})`,
        },
        filter: async (f) => {
          return test7Res.body.features.some(
            (feature) => feature.properties.id === f.properties.id
          );
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
*/

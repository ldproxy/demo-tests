import { init } from "@catsjs/core";
import qs from "qs";
import chai, { expect } from "chai";
import {
  featuresMatch,
  firstFeatureMatches,
  numberCheckSubtract1,
} from "../expectFunctions.js";
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
const pointPnt4326 = `POINT(${latPnt} ${lonPnt})`;

describe(
  {
    title: "equals",
    description:
      "Ensure that all queries involving operator **equals** work correctly. <br/>\
      Collections: [Daraa - Cultural Points](https://demo.ldproxy.net/daraa/collections/CulturePnt/items?f=html)",
  },
  () => {
    const tests = [
      {
        query: {
          filter: `s_EqualS(geometry, ${pointPnt})`,
        },
        withBody: async (body) => {
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
        getExpected: () => vars.load(test1res),
        filter: null,
        expect: featuresMatch,
      },
      {
        query: {
          filter: `s_EqualS(geometry, ${pointPnt})`,
        },
        withBody: async (body) => {
          vars.save("test3res", body);
        },
        filter: null,
        expect: numberCheckSubtract1,
      },
      {
        query: {
          filter: `s_EqualS(geometry, ${pointPnt4326})`,
          "filter-crs": "http://www.opengis.net/def/crs/EPSG/0/4326",
        },
        getExpected: () => vars.load(test3res),
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

          .expect(async (res) => {
            if (test.withBody) {
              await test.withBody(res.body);
            }

            // Either calls shouldIncludeId or featuresMatch

            test.expect(res.body, test, vars.load(collectionFeatures));
            test.additional ? test.additional(res.body) : null;
          })
      );
    }
  }
);

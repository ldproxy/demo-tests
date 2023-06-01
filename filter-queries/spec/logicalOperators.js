import { init } from "@catsjs/core";
import qs from "qs";
import { featuresMatch } from "../expectFunctions.js";

const { api, setup, vars } = await init();

const CONTENT_TYPE = "Content-Type";
const GEO_JSON = "application/geo+json";

const CultureFeatures = "allCulturePntFeatures";
const LIMIT = 250;

await setup("fetch all CulturePnt features", async () =>
  api
    .get(`/daraa/collections/CulturePnt/items?limit=${LIMIT}`)
    .expect(200)
    .expect(CONTENT_TYPE, GEO_JSON)
    .expect((res) => vars.save(CultureFeatures, res.body))
);

describe(
  {
    title: "logical operators",
    description:
      "Ensure that all queries involving operator **logical operators** work correctly. <br/>\
      Collections: [Daraa - Cultural Points](https://demo.ldproxy.net/daraa/collections/CulturePnt/items?f=html)",
  },
  () => {
    const tests = [
      {
        query: {
          filter: `F_CODE=F_CODE AnD NoT (F_CODE='AL030' oR ((T_AFTER(ZI001_SDV, TIMESTAMP('2011-12-31T23:59:59Z')) aNd ZI037_REL iS nULL)))`,
        },
        filter: (f) =>
          !(
            f.properties.F_CODE == "AL030" ||
            (f.properties.ZI001_SDV > "2011-12-31T23:59:59Z" &&
              f.properties.ZI037_REL == undefined)
          ),
        expect: featuresMatch,
      },
      {
        query: {
          filter: `F_CODE='AL030' or F_CODE='AL012'`,
        },
        filter: (f) =>
          f.properties.F_CODE == "AL030" || f.properties.F_CODE == "AL012",
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
          })
      );
    }
  }
);

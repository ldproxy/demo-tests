import { init } from "@catsjs/core";
import qs from "qs";
import chai from "chai";
chai.should();

const { api, setup, vars } = await init();

const CONTENT_TYPE = "Content-Type";
const GEO_JSON = "application/geo+json";
const CULTURE_PNT_FEATURES = "allCulturePntFeatures";
const LIMIT = 250;

await setup("fetch all CulturePnt features", async () =>
  api
    .get(`/daraa/collections/CulturePnt/items?limit=${LIMIT}`)
    .expect(200)
    .expect(CONTENT_TYPE, GEO_JSON)
    .expect((res) => vars.save(CULTURE_PNT_FEATURES, res.body))
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
      },
      {
        query: { filter: "F_CODE>='AL030'" },
        filter: (f) => f.properties.F_CODE >= "AL030",
      },
      {
        query: { filter: "ZI037_REL>=11" },
        filter: (f) => f.properties.ZI037_REL >= 11,
      },
      {
        query: { filter: "ZI037_REL>=10" },
        filter: (f) => f.properties.ZI037_REL >= 10,
      },
      {
        query: { filter: "'AL030'>=F_CODE" },
        filter: (f) => f.properties.F_CODE <= "AL030",
      },
      {
        query: { filter: "'A'>='A'" },
        filter: (f) => true,
      },
      {
        query: { filter: "ZI001_SDV>=TIMESTAMP('2011-12-26T20:55:27Z')" },
        filter: (f) => f.properties.ZI001_SDV >= "2011-12-26T20:55:27Z",
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

          // returns correct amount of features

          .expect((res) => {
            const expected = vars
              .load(CULTURE_PNT_FEATURES)
              .features.filter(test.filter);

            res.body.should.have
              .property("numberReturned")
              .which.equals(expected.length);

            //returns the expected features:

            const actual = res.body.features;

            for (let i = 0; i < actual.length; i++) {
              actual[i].should.have.property("id").which.equals(expected[i].id);
              actual[i].should.have
                .property("type")
                .which.equals(expected[i].type);
              actual[i].should.have
                .property("geometry")
                .which.deep.equals(expected[i].geometry);
              actual[i].should.have
                .property("properties")
                .which.deep.equals(expected[i].properties);
            }
          })
      );
    }
  }
);

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
    .get(`/collections/CulturePnt/items?limit=${LIMIT}`)
    .expect(200)
    .expect(CONTENT_TYPE, GEO_JSON)
    .expect((res) => vars.save(CULTURE_PNT_FEATURES, res.body))
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
            zi037Rel !== null && zi037Rel >= zi037Rel && zi037Rel <= zi037Rel
          );
        },
      },
      {
        query: { filter: "ZI037_REL not BeTweeN ZI037_REL AnD ZI037_REL" },
        filter: (f) => false,
      },
      {
        query: { filter: "ZI037_REL BeTweeN 0 AnD 10" },
        filter: (f) => {
          const zi037Rel = f.properties.ZI037_REL;
          return zi037Rel !== null && zi037Rel >= 0 && zi037Rel <= 10;
        },
      },
      {
        query: { filter: "ZI037_REL BeTweeN 0 AnD 11" },
        filter: (f) => {
          const zi037Rel = f.properties.ZI037_REL;
          return zi037Rel !== null && zi037Rel >= 0 && zi037Rel <= 11;
        },
      },
      {
        query: { filter: "ZI037_REL NoT BeTweeN 0 AnD 10" },
        filter: (f) => {
          const zi037Rel = f.properties.ZI037_REL;
          return zi037Rel !== null && !(zi037Rel >= 0 && zi037Rel <= 10);
        },
      },
      {
        query: { filter: "ZI037_REL NoT BeTweeN 0 AnD 11" },
        filter: (f) => {
          const zi037Rel = f.properties.ZI037_REL;
          return zi037Rel !== null && !(zi037Rel >= 0 && zi037Rel <= 11);
        },
      },
      {
        query: { filter: "6 BeTweeN 0 AnD ZI037_REL" },
        filter: (f) => {
          const zi037Rel = f.properties.ZI037_REL;
          return zi037Rel !== null && zi037Rel <= 6;
        },
      },
    ];

    for (const test of tests) {
      it(qs.stringify(test.query, { encode: false }), () =>
        //Data is selected using filter

        api
          .get("/collections/CulturePnt/items")
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

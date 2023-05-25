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
      },
      {
        query: { filter: "F_CODE LiKe 'AL0__'" },
        filter: (f) =>
          f.properties.F_CODE.startsWith("AL0") &&
          f.properties.F_CODE.length === 5,
      },
      {
        query: { filter: "CASEI(F_CODE) LiKe casei('al0__')" },
        filter: (f) =>
          f.properties.F_CODE.match(/^AL0/i) &&
          f.properties.F_CODE.length === 5,
      },
      {
        query: { filter: "CASEI(F_CODE) LiKe casei('al0%')" },
        filter: (f) => f.properties.F_CODE.match(/^AL0/i),
      },
      {
        //To Do: Prüfen, ob der Response falsch ist. Bei case-sensitive Vergleich müssten 0 zurückkommen
        query: { filter: "F_CODE LiKe 'al0%'" },
        filter: (f) => f.properties.F_CODE.startsWith("al0"),
      },
      {
        query: { filter: "F_CODE LiKe '%''%'" },
        filter: (f) => f.properties.F_CODE.includes("'"),
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

/*
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

const lonPnt =
  vars.load(CULTURE_PNT_FEATURES).features[0].geometry.coordinates[0];
const latPnt =
  vars.load(CULTURE_PNT_FEATURES).features[0].geometry.coordinates[1];
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

          // returns correct amount of features

          .expect((res) => {
            const expected = vars
              .load(CULTURE_PNT_FEATURES)
              .features.filter(test.filter);

            res.body.should.have.property("numberReturned").which.equals(1);

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
*/

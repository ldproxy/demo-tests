import { init } from "@catsjs/core";
import chai from "chai";
chai.should();

const { api, setup, vars } = await init();

const CONTENT_TYPE = "Content-Type";
const GEO_JSON = "application/geo+json";

const AERONAUTIC_CRV_FEATURES = "allAeronauticCrvFeatures";
const LIMIT = 250;

await setup("fetch all AeronauticCrv features", async () =>
  api
    .get(`/daraa/collections/AeronauticCrv/items?limit=${LIMIT}`)
    .expect(200)
    .expect(CONTENT_TYPE, GEO_JSON)
    .expect((res) => vars.save(AERONAUTIC_CRV_FEATURES, res.body))
);

export const featuresMatch = (body, test) => {
  const expected = test.getExpected
    ? test.getExpected
    : vars.load(AERONAUTIC_CRV_FEATURES).features.filter(test.filter);

  body.should.have.property("numberReturned").which.equals(expected.length);

  //returns the expected features:

  const actual = body.features;

  for (let i = 0; i < actual.length; i++) {
    actual[i].should.have.property("id").which.equals(expected[i].id);
    actual[i].should.have.property("type").which.equals(expected[i].type);
    actual[i].should.have
      .property("geometry")
      .which.deep.equals(expected[i].geometry);
    actual[i].should.have
      .property("properties")
      .which.deep.equals(expected[i].properties);
  }
};

export const shouldIncludeId = (body, test) => {
  body.features.includes(test.filter);
};

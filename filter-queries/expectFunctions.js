import chai from "chai";
chai.should();

export const featuresMatch = (body, test, collectionFeatures) => {
  const expected = test.getExpected
    ? test.getExpected
    : collectionFeatures.features.filter(test.filter);

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

import { types } from "@catsjs/core";
import { request } from "@catsjs/http";
import qs from "qs";

export const featuresMatch = (reference, featureFilter) => (res) => {
  const expected = reference.features.filter(featureFilter);

  res.body.should.have.property("numberReturned").which.equals(expected.length);

  const actual = res.body.features;

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

const featureQuery = (opts, api) => {
  const { collection, limit = 250, query = {} } = opts;

  return request(
    {
      ...opts,
      path: `/daraa/collections/${collection}/items`,
      query: { ...query, limit },
    },
    api
  );
};

const featureQuerySetup = (opts, cats) => {
  const { save: saveAs } = opts;
  const { api, vars } = cats;

  return featureQuery(opts, api)
    .then((result) => {
      if (saveAs) {
        vars.save(saveAs, result.body);
      }
    })
    .catch((e) => {
      if (saveAs) {
        vars.save(saveAs, {});
      }
    });
};

const featureMatcher = (params, response, cats) => {
  const { source, filter } = params;
  const { vars } = cats;
  const featureFilter = new Function("feature", `return ${filter};`);

  return response.expect(featuresMatch(vars.load(source), featureFilter));
};

export default {
  type: types.dsl,
  name: "filter",
  parameters: {},
  dsl: {
    actions: {
      "feature-query": featureQuerySetup,
    },
    creators: {
      "feature-query": {
        init: (opts, params) => ({
          ...opts,
          title: opts.title || qs.stringify(params.query, { encode: false }),
        }),
        execute: featureQuery,
      },
    },
    assertions: {
      "feature-matcher": featureMatcher,
    },
  },
};

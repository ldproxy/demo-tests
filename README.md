# demo-tests

API tests for the [demo configuration](https://github.com/ldproxy/demo). 

These tests are data-specific, so it does not make sense to use them with other configurations or APIs.

## Test Projects

- **filter-queries** <br/>Validates the correct implementation of filters using the [Daraa API](https://demo.ldproxy.net/daraa) and [CShapes API](https://demo.ldproxy.net/cshapes).

## Installation

```sh
npm install
```

## Usage

By default the tests are executed against the official deployment at https://demo.ldproxy.net. 
<br/>The default can be changed in the `.catsrc.yml` of every test project or it can be overriden using the environment variable `CATS_API`.

To execute all test projects against a local ldproxy:

```sh
CATS_API=http://localhost:7080/rest/services npm run all
```

To execute a single test project, for example `filter-queries`:

```sh
npm run filter-queries
```

An HTML report will be saved in the `report` directory of the test projects.

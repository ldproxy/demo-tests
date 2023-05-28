# demo-tests

API tests for the [demo configuration](https://github.com/ldproxy/demo). 

These tests are data-specific, so it does not make sense to use them with other configurations or APIs.

## Test Projects

- **filter-queries** <br/>Validates the correct implementation of filters using the [Daraa API](https://demo.ldproxy.net/daraa) and [CShapes API](https://demo.ldproxy.net/cshapes).

## Usage

### Docker

The easiest way to execute the tests is by running the docker image:

```sh
docker run --rm -t ghcr.io/ldproxy/demo-tests:next
```

By default the tests are executed against the official deployment at https://demo.ldproxy.net. 
<br/>The default can be overriden using the environment variable `CATS_API`:

```sh
docker run --rm -t \ 
  -e CATS_API=https://my-ldproxy/demo \ 
  ghcr.io/ldproxy/demo-tests:next
```

To only execute a single test project, for example `filter-queries`:

```sh
docker run --rm -t \ 
  -e CATS_API=https://my-ldproxy/demo \ 
  -e FILTER_QUERIES=true \
  ghcr.io/ldproxy/demo-tests:next
```

If you want to access the generated HTML report, you can use a volume or a bind mount, for example to the current directory: 

```sh
docker run --rm -t \ 
  -e CATS_API=https://my-ldproxy/demo \ 
  -e FILTER_QUERIES=true \
  -v ./reports:/reports \
  ghcr.io/ldproxy/demo-tests:next
```

### Node.js

To execute the tests from the source you need Node.js. First install the dependencies:

```sh
npm install
```

To execute all test projects against a local ldproxy:

```sh
CATS_API=http://localhost:7080/rest/services npm run all
```

To execute a single test project, for example `filter-queries`:

```sh
npm run filter-queries
```

An HTML report will be saved to the `reports` directory.

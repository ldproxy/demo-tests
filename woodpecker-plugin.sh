#!/bin/sh

i=0
REPORT_DIR="reports"

# TODO: cats reportDir and reportFilename

if [ "$API" != "" ]; then
  export CATS_API="$API"
fi
if [ "$PLUGIN_API" != "" ]; then
  export CATS_API="$PLUGIN_API"
fi

if [ "$PLUGIN_REPORT_DIR" != "" ]; then
  REPORT_DIR="$PLUGIN_REPORT_DIR"
fi

if [ "$CI_WORKSPACE" != "" ]; then
  export CATS_REPORT_DIR="$CI_WORKSPACE/$REPORT_DIR"
fi

if [ "$FILTER_QUERIES" = "true" -o "$PLUGIN_FILTER_QUERIES" = "true" ]; then
  i=$((i+1))
  npm run filter-queries
fi

if [ "$PLUGIN_ALL" = "true" -o $i -eq 0 ]; then
  npm run all
fi

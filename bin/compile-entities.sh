#!/bin/bash

printf "Compiling...\n"
gulp
printf "Writing entities...\n"
node ./dist/index.js entities

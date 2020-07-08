#!/bin/bash

printf "Deleting ALL data & structure and importing new data. Do you want to continue?\e[1m [\e[33my/N\e[39m] \e[0m" > /dev/tty
read REPLY
case $REPLY in
    y*|Y*)
        ;;
    *)
        exit
        ;;
esac

printf "Compiling...\n"
gulp
printf "Starting DB import...\n"
node ./dist/index.js import
#!/bin/sh
case $1 in
    on|ON)
        printf "Turning off maintenance mode\n"
        docker-compose -f docker-compose-prod.yml exec nginx touch maintenance_on
        printf "Maintenance mode: ON\n";;
    off|OFF)
        printf "Turning off maintenance mode\n"
        docker-compose -f docker-compose-prod.yml exec nginx rm -f maintenance_on
        printf "Maintenance mode: OFF\n";;
    *) printf "Invalid option. Use arguments 'on' or 'off'.\n";;
esac

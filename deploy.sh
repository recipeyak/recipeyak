#!/bin/sh

# set context to recipeyak — this will break on machines not configured
# for access via docker-machine (i.e. every machine but wombat)
eval $(docker-machine env recipeyak)

# pull new files
docker pull cdignam/recipemanager_nginx:latest
docker pull cdignam/recipemanager_django:latest
docker pull cdignam/recipemanager_react:latest

# update containers
docker-compose -f docker-compose-deploy.yml up --build -d

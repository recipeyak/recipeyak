#!/bin/sh
# Copy files from build/ (our current WORKDIR) to the volume mounted at dist
cp -a build/* dist
tail -f /dev/null

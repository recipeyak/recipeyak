#!/bin/sh
# Copy files from build/ (our current WORKDIR) to the volume mounted at dist
cd build && cp -a . ../dist
tail -f /dev/null

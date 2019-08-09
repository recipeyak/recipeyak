FROM redis:5.0.5-buster@sha256:c6f7f0782e6671949dd514c2d1a777bce35d91613d3981713247c61a828282ab
COPY redis.conf /usr/local/etc/redis/redis.conf
CMD [ "redis-server", "/usr/local/etc/redis/redis.conf" ]

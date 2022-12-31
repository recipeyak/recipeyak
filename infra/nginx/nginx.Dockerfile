FROM nginx:1.13.8-alpine@sha256:c8ff0187cc75e1f5002c7ca9841cb191d33c4080f38140b9d6f07902ababbe66

COPY general_headers.conf /etc/nginx/headers.d/
COPY nginx.conf /etc/nginx/conf.d/
RUN rm /etc/nginx/conf.d/default.conf
RUN mkdir -p /var/www
WORKDIR /var/www
COPY maintenance.html .
COPY 404.html .
COPY 50x.html .
HEALTHCHECK CMD curl --fail http://localhost/healthz

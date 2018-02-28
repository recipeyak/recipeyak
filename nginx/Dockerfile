FROM nginx:1.13.8-alpine

COPY nginx.conf /etc/nginx/conf.d/
RUN rm /etc/nginx/conf.d/default.conf
RUN mkdir -p /var/www
WORKDIR /var/www
COPY maintenance.html .
COPY 404.html .
COPY 50x.html .
ARG GIT_SHA
RUN sh -c 'sed -i s/\<%=GIT_SHA=%\>/"$GIT_SHA"/ /etc/nginx/conf.d/nginx.conf && grep Proxy /etc/nginx/conf.d/nginx.conf'

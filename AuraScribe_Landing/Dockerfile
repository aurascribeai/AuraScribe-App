# Build stage
FROM node:18 AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build


# Production stage
FROM nginx:1.25-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
RUN rm -rf /var/cache/nginx && mkdir -p /var/cache/nginx/client_temp && \
    mkdir -p /var/run/nginx && \
    chown -R nginx:nginx /var/cache/nginx /var/run/nginx
USER root
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

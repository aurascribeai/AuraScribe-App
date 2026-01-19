FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
ARG VITE_API_BASE_URL=http://34.19.193.244:5000
ARG VITE_API_KEY=
RUN VITE_API_BASE_URL=$VITE_API_BASE_URL VITE_API_KEY=$VITE_API_KEY npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

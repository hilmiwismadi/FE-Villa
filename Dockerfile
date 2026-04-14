FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

ARG VITE_AUTH_SERVICE_URL=https://yutaka-auth.izcy.tech
ARG VITE_ORDER_SERVICE_URL=https://yutaka-order.izcy.tech
ARG VITE_PROMO_SERVICE_URL=https://yutaka-promo.izcy.tech

ENV VITE_AUTH_SERVICE_URL=$VITE_AUTH_SERVICE_URL
ENV VITE_ORDER_SERVICE_URL=$VITE_ORDER_SERVICE_URL
ENV VITE_PROMO_SERVICE_URL=$VITE_PROMO_SERVICE_URL

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

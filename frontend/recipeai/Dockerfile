# Stage 1: Build the React application
FROM node:20-alpine AS build
RUN apk update && apk upgrade
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Install gettext for envsubst and copy the template
RUN apk add --no-cache gettext
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Expose a default port (will be overridden by Railway's PORT)
EXPOSE 8080

# When the container starts, substitute the environment variables
# and then start Nginx.
CMD ["/bin/sh", "-c", "envsubst < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]

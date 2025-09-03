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
COPY nginx.conf /etc/nginx/conf.d/default.conf
# When the container starts, Nginx will automatically serve the files from /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

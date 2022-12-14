from node:16.14.2-alpine-3.14
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

# Path: dockerfile
from nginx:1.19 
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /app/build .
ENTRYPOINT ["nginx", "-g", "daemon off;"]

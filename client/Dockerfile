FROM node:16.15.1-alpine



WORKDIR /app

COPY package.json ./
RUN npm install 

COPY ./ ./
ENV NEXT_TELEMETRY_DISABLED 1

CMD ["npm", "run", "dev"]
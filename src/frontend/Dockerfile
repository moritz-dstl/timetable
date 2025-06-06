FROM node:24-alpine
WORKDIR /app
COPY . .
RUN npm install
ENV VITE_API_ENDPOINT=http://localhost:8000
EXPOSE 3000
CMD ["npm", "run", "dev"]
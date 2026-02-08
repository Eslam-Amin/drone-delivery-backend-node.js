# 1. Use an official Node.js runtime as a parent image
FROM node:20-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package files FIRST to take advantage of Docker caching
COPY package*.json ./
COPY prisma ./prisma/

# 4. Install dependencies inside the container
RUN npm install

# 5. Generate Prisma Client 
RUN npx prisma generate

# 6. Copy the rest of your app source code
COPY . .

# 7. Build the TypeScript code
RUN npm run build

# 8. Expose the port your app runs on
EXPOSE 3000

# 9. Wait for DB to be ready, run migrations, then start the app
# Note: In a real prod app, migrations are usually run separately, 
# but this is the easiest way to "just run it".
CMD npx prisma migrate deploy && npx prisma db seed && npm start
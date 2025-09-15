FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source code
COPY . .

# For development, we'll use the dev server
# TODO: Fix TypeScript errors and enable production build

EXPOSE 3000

# Use Vite dev server for development
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
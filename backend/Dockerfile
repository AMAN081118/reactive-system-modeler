FROM node:18-bullseye

# Install build tools for C++ compilation
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Build native modules
RUN npm run build:native || echo "Native build optional"

EXPOSE 5000

CMD ["npm", "start"]

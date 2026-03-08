FROM node:20-alpine

WORKDIR /workspace

COPY package.json package-lock.json* ./
RUN npm install

COPY apps/web/package.json apps/web/package.json
COPY packages/config packages/config
COPY packages/types packages/types
COPY packages/ui packages/ui
RUN npm install --prefix apps/web

COPY . .

WORKDIR /workspace/apps/web

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]

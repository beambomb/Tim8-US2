FROM node:22-alpine

WORKDIR /app

# Install production dependencies first to leverage Docker layer caching
COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev

# Copy backend source files as non-root node user (UID 1000 for Hugging Face Spaces)
COPY --chown=node:node . .

USER node

ENV NODE_ENV=production
ENV PORT=7860

EXPOSE 7860

CMD ["npm", "start"]

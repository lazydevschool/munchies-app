# Use the official Node.js LTS Alpine image as the base
FROM node:lts-alpine

# Set up PNPM with caching capability
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Set the working directory in the container
WORKDIR /usr/src/app

# Create store directory and set permissions
RUN mkdir -p /pnpm/store && \
    chown -R node:node /pnpm/store /usr/src/app

# Switch to non-root user
USER node

# Copy package.json and pnpm-lock.yaml (if available)
COPY --chown=node:node package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Start the application
CMD ["pnpm", "dev"]
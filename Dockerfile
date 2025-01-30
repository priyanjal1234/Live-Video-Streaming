FROM ubuntu:focal
# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    software-properties-common

# Install Node.js
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get install -y nodejs

# Install FFmpeg
RUN apt-get update \
    && apt-get install -y ffmpeg

# Install nodemon globally
RUN npm install -g nodemon

# Clean up
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /home/app

# Expose the port the app runs on
EXPOSE 3000

# Start the application with nodemon
CMD ["nodemon", "index.js"]

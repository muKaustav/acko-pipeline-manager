# FROM node:18-bullseye

# WORKDIR /app

# RUN apt-get update && \
#     apt-get install -y \
#         python3 \
#         python3-pip \
#         python3-venv \
#         libpq-dev \
#     && apt-get clean \
#     && rm -rf /var/lib/apt/lists/*

# RUN pip3 install --upgrade pip && pip3 install meltano

# COPY package*.json ./
# RUN npm install

# COPY requirements.txt ./
# RUN pip3 install -r requirements.txt

# COPY etl/ ./etl/
# WORKDIR /app/etl
# RUN meltano install

# WORKDIR /app
# COPY . .

# ENV MELTANO_CLI_LOG_LEVEL=error

# EXPOSE 8000

# CMD ["npm", "start"]

FROM node:18-bullseye
WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y \
        python3 \
        python3-pip \
        python3-venv \
        libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip and install meltano
RUN pip3 install --upgrade pip && pip3 install meltano

# Install npm packages
COPY package*.json ./
RUN npm ci

# Install Python requirements
COPY requirements.txt ./
RUN pip3 install -r requirements.txt

# Copy ETL files and install meltano
COPY etl/ ./etl/
WORKDIR /app/etl
RUN meltano install
WORKDIR /app

# Copy the rest of the application
COPY . .

ENV MELTANO_CLI_LOG_LEVEL=error
EXPOSE 8000

# Make sure all dependencies are installed before starting
CMD ["sh", "-c", "npm install && npm start"]
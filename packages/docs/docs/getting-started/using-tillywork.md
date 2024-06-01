---
sidebar_position: 2
description: The different ways to get started
---

# Deployment

To get started using tillywork, choose how you're going to use our application.

## Cloud

The easiest way is signing up to our cloud deployment at [https://tilly.work](https://tilly.work) which will enable you to get started immediately.

## Docker Hub

For personal use or testing purposes, you can run the application through our Docker image released on Docker Hub.

### Prerequisites

You need to have Docker installed and the Docker engine running.

### 1. Create a Postgres Database

To run tillywork, you need a Postgres database to connect to. The easiest way is running a Postgres docker image.

```
docker run --name tillywork-db -e POSTGRES_DB=tillywork -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=12345678 -p 5432:5432 -d postgres:16.3-bullseye
```

### 2. Run tillywork

Run the image from Docker Hub passing in the database information:

```
docker run --name tillywork -e TW_DB_HOST=host.docker.internal -e TW_DB_NAME=tillywork -e TW_DB_USERNAME=postgres -e TW_DB_PASSWORD=12345678 -e TW_SECRET_KEY=tillywork -d -p 80:80 tillywork/tillywork:latest
```

## Docker Compose

For companies and production use, use Docker compose to get set up.

### Prerequisites

You need to have Git and Docker installed and the Docker engine running.

### 1. Clone the repository

```
git clone https://github.com/tillywork/tillywork.git
```

### 2. Create environment variables

Create a copy of the .env.example file in the project root and rename it to .env:

```
cp .env.example .env
```

### 3. Run tillywork

Run the Docker compose file:

```
docker compose -p tillywork up -d
```

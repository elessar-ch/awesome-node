# Awesome Node Image
This image serves as a simple example how to create a Docker image for a
NodeJS application.

## Endpoints
The application responds to a GET request to `/` with a hello world string
and to `/random-nr` with a random number chosen by fair dice roll.

## Configuration
The port on which the application listens to, can be configured through the
environment variable `PORT`.
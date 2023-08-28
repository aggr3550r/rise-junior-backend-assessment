# rise-junior-backend-assessment
This repository houses code built in partial fulfillment of the interview process for a junior backend engineer role at RiseVest

## Description

This is a simple cloud backup system that is powered with ExpressJS, TypeScript, PostgreSQL and TypeORM - a combination of top choice modern technology. It is built in partial fulfilment of the interview requirements at RiseVest.

## Functionalities

The idea of the app is one that allows users to upload files to a remote storage so it acts as backups for the ones they already have locally. 

## Running the app

In order to run the app, the first thing you need to do is create a .env file in the root of your project. The .env file should be like the one below
```bash
DATABASE_URL="postgresql://victor:killshot@host.docker.internal:5432/earnipay_datastore?schema=public"
JWT_SECRET=e3376540-31b5-11ed-a261-0242ac120002
JWT_EXPIRES_IN=24h
JWT_COOKIE_EXPIRES_IN=24
```

With that out of the way, there are two possible paths along which to proceed enumerated below:
### * Docker Compose
### * Dockerfile

#### Docker Compose 
To run the app using _docker compose_ take the following steps:
- Setup:
  Fire up Docker Desktop to make sure that the Docker daemon is up and running

- Build docker image:
  Run the following command in the terminal from the root directory of the project: 
```
docker-compose --build
```

- Start docker container:
  Run the following command in the terminal from the root directory of the project.

#### Dockerfile
To run the app using the Dockerfile provided, take the following steps:
- Setup:
  Fire up Docker Desktop to make sure that the Docker daemon is up and running
  
- Build docker image:
  Run the following command in the terminal from the root directory of the project:
 ```
 docker build -t rest-image .
 ```
 
 - Map the host port to the container port, mount the .env file in your project as a volume onto the image in the container and then run the container:
  The above step can be achieved by running the following command from the root directory of your project:
 ```
 docker run -p 8000:80 /path/to/local/app/.env:/path/to/container/app/.env rise-image
 ```
  For example, this is the command I personally use:
 ```
 docker run -p 8000:80 -v /Users/victor/Desktop/rise-junior-backend-assessment/.env:/app/.env rise-image:01
 ```
That should do it, your Todo API is up and ready for use @ http://localhost:8000/api/v1 ! 

## Test

To run the unit tests in the application use the following command:

```bash
# unit tests
$ npm run test
```


- Author - [Victor Uche](https://github.com/aggr3550r/)


## License

Nest is [MIT licensed](LICENSE).


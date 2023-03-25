# Barry McAndrews' Personal Website 
[![Deploy Website to Production S3](https://github.com/barrymcandrews/personal-website/actions/workflows/deploy-prod.yml/badge.svg)](https://github.com/barrymcandrews/personal-website/actions/workflows/deploy-prod.yml)

Welcome to the source code of my [personal website](https://www.bmcandrews.com).

## Installation

To setup this project locally run the following:
```
$ git clone https://github.com/barrymcandrews/personal-website.git
$ cd personal-website
$ yarn install
```
To run the project in development mode:
```
$ yarn start
```

To build the production version of the site:
```
$ yarn build
```

## Deployment

Since this project compiles into a static website, it is hosted in an S3 bucket. 
Any new commits on the master branch will trigger a GitHub Action for the deployment. 
This action builds the project using `yarn build` and copies the result to S3.

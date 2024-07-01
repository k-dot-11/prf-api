# Scrape-TM

This is a Node.js application that uses Puppeteer to scrape data from a given URL and Express.js to expose an endpoint that triggers the scraping process.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have Node.js and npm installed on your machine. This project was built using Node.js version v20.12.2 and npm version 10.8.1.

### Installing

1. Clone the repository: `git clone <repository-url>`
2. Install the dependencies: `npm install`

### Running the application

To start the application, run the following command in your terminal:

```sh
npm start
```

This will start the server on port 5678.

### Usage

Make a POST request to the /createForm endpoint with a JSON body containing the url and isHomeTeam parameters. The server will scrape the data from the provided URL and return the response.
# Country Data API

## Overview
This is a RESTful API built with Node.js and Express.js that fetches, stores, and serves data about countries and their currencies. It uses a MySQL database for persistence and dynamically generates a summary image of the data.

## Features
- **Express.js**: Serves as the web server framework for routing and handling API requests.
- **MySQL2**: Provides a robust, promise-based driver for interacting with the MySQL database.
- **Axios**: Manages HTTP requests to fetch data from external sources (RestCountries API, Exchange Rate API).
- **Node-Canvas**: Enables server-side image generation to create dynamic data summaries as PNG files.
- **dotenv**: Handles loading of environment variables from a `.env` file for secure configuration.

## Getting Started
### Installation
1.  Clone the repository:
    ```bash
    git clone https://github.com/pemzyj/country_currency.git
    cd country_currency
    ```
2.  Install the required dependencies:
    ```bash
    npm install
    ```
3.  Set up your environment variables by creating a `.env` file in the root directory. See the section below.

4.  Start the development server:
    ```bash
    npm run dev
    ```

### Environment Variables
Create a `.env` file in the project root and add the following variables:

```
# Server Configuration
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=countries_db
DB_PORT=3306
```

## API Documentation
### Base URL
`http://localhost:3000`

### Endpoints
#### POST /countries/refresh
Refreshes the database with the latest country and currency data from external APIs. This operation can be time-consuming.

**Request**:
No request body required.

**Response**:
*   **200 OK**
    ```json
    {
      "message": "Countries refreshed successfully",
      "total_countries": 250
    }
    ```

**Errors**:
- **500 Internal Server Error**: A failure occurred during the database transaction or data processing.
- **503 Service Unavailable**: The external RestCountries or Exchange Rate API could not be reached.

---
#### GET /countries
Retrieves a list of all countries. Supports filtering by region and currency, and sorting by name or GDP.

**Request**:
*   **Query Parameters (optional)**:
    *   `region` (string): Filters countries by region (e.g., `Africa`).
    *   `currency` (string): Filters countries by currency code (e.g., `USD`).
    *   `sort` (string): Sorts the results. Available options: `gdp_desc`, `gdp_asc`, `name_asc`, `name_desc`.

**Response**:
*   **200 OK**
    ```json
    [
      {
        "id": 1,
        "name": "Nigeria",
        "capital": "Abuja",
        "region": "Africa",
        "population": 206139589,
        "currency_code": "NGN",
        "exchange_rate": "1480.5000",
        "estimated_gdp": "208851493077.34",
        "flag_url": "https://flagcdn.com/ng.svg",
        "last_refreshed_at": "2024-05-22T18:00:00.000Z"
      },
      {
        "id": 2,
        "name": "United States",
        "capital": "Washington, D.C.",
        "region": "Americas",
        "population": 329484123,
        "currency_code": "USD",
        "exchange_rate": "1.0000",
        "estimated_gdp": "494226184500.00",
        "flag_url": "https://flagcdn.com/us.svg",
        "last_refreshed_at": "2024-05-22T18:00:00.000Z"
      }
    ]
    ```

**Errors**:
- **500 Internal Server Error**: Failed to retrieve data from the database.

---
#### GET /countries/:name
Retrieves detailed information for a single country specified by its name.

**Request**:
*   **Path Parameter**:
    *   `name` (string): The full name of the country (e.g., `Nigeria`).

**Response**:
*   **200 OK**
    ```json
    {
      "id": 1,
      "name": "Nigeria",
      "capital": "Abuja",
      "region": "Africa",
      "population": 206139589,
      "currency_code": "NGN",
      "exchange_rate": "1480.5000",
      "estimated_gdp": "208851493077.34",
      "flag_url": "https://flagcdn.com/ng.svg",
      "last_refreshed_at": "2024-05-22T18:00:00.000Z"
    }
    ```

**Errors**:
- **404 Not Found**: The specified country does not exist in the database.
- **500 Internal Server Error**: Failed to retrieve data from the database.

---
#### DELETE /countries/:name
Deletes a country from the database.

**Request**:
*   **Path Parameter**:
    *   `name` (string): The full name of the country to delete (e.g., `Nigeria`).

**Response**:
*   **200 OK**
    ```json
    {
      "message": "Country deleted successfully"
    }
    ```

**Errors**:
- **404 Not Found**: The specified country does not exist in the database.
- **500 Internal Server Error**: Failed to delete the record from the database.

---
#### GET /status
Provides metadata about the dataset, including the total number of countries and the last refresh timestamp.

**Request**:
No request body or parameters required.

**Response**:
*   **200 OK**
    ```json
    {
      "total_countries": 250,
      "last_refreshed_at": "2024-05-22T18:00:00.000Z"
    }
    ```

**Errors**:
- **500 Internal Server Error**: Failed to retrieve metadata from the database.

---
#### GET /countries/image
Returns a dynamically generated PNG image that summarizes the dataset, including the top 5 countries by estimated GDP.

**Request**:
No request body or parameters required.

**Response**:
*   **200 OK**: The response body will be a PNG image (`Content-Type: image/png`).

**Errors**:
- **404 Not Found**: The summary image has not been generated yet. Run the `POST /countries/refresh` endpoint first.
- **500 Internal Server Error**: An error occurred while trying to send the image file.

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)
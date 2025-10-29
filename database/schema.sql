CREATE DATABASE country_currency;
USE country_currency;

CREATE TABLE CountryFields (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    capital VARCHAR(255) DEFAULT NULL,
    region VARCHAR(255) DEFAULT NULL,
    population BIGINT NOT NULL,
    currency_code VARCHAR(10) NOT NULL,
    exchange_rate DECIMAL(18,6) NOT NULL,
    estimated_gdp DECIMAL(18,2),
    flag_url VARCHAR(500) DEFAULT NULL,
    last_refreshed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);



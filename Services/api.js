import axios from "axios";

const COUNTRIES_API = 'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies';
const EXCHANGE_API = 'https://open.er-api.com/v6/latest/USD';

export async function fetchCountries() {
  try {
    const response = await axios.get(COUNTRIES_API, { timeout: 10000 });
    return response.data;
  } catch (error) {
    throw new Error('Could not fetch data from RestCountries API');
  }
}

export async function fetchExchangeRates() {
  try {
    const response = await axios.get(EXCHANGE_API, { timeout: 10000 });
    return response.data.rates;
  } catch (error) {
    throw new Error('Could not fetch data from Exchange Rate API');
  }
}
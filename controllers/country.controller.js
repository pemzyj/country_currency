import pool from '../database.js';
import { fetchCountries, fetchExchangeRates } from '../Services/api.js';
import { generateSummaryImage } from "../Services/imageGenerator.js";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getRandomMultiplier() {
  return Math.random() * (2000 - 1000) + 1000;
}

export async function refreshCountries(req, res) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const [countriesData, exchangeRates] = await Promise.all([
      fetchCountries(),
      fetchExchangeRates()
    ]);

    for (const country of countriesData) {
      const name = country.name;
      const capital = country.capital || null;
      const region = country.region || null;
      const population = country.population;
      const flagUrl = country.flag || null;

      let currencyCode = null;
      let exchangeRate = null;
      let estimatedGdp = 0;

      if (country.currencies && country.currencies.length > 0) {
        currencyCode = country.currencies[0].code;
        
        if (exchangeRates[currencyCode]) {
          exchangeRate = exchangeRates[currencyCode];
          const multiplier = getRandomMultiplier();
          estimatedGdp = (population * multiplier) / exchangeRate;
        } else {
          exchangeRate = null;
          estimatedGdp = null;
        }
      }

      const [existing] = await connection.query(
        'SELECT id FROM countries WHERE LOWER(name) = LOWER(?)',
        [name]
      );

      if (existing.length > 0) {
        await connection.query(
          `UPDATE countries 
           SET capital = ?, region = ?, population = ?, currency_code = ?, 
               exchange_rate = ?, estimated_gdp = ?, flag_url = ?, 
               last_refreshed_at = NOW()
           WHERE id = ?`,
          [capital, region, population, currencyCode, exchangeRate, estimatedGdp, flagUrl, existing[0].id]
        );
      } else {
        await connection.query(
          `INSERT INTO countries 
           (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [name, capital, region, population, currencyCode, exchangeRate, estimatedGdp, flagUrl]
        );
      }
    }

    const [countResult] = await connection.query('SELECT COUNT(*) as count FROM countries');
    const totalCountries = countResult[0].count;

    await connection.query(
      'UPDATE refresh_metadata SET last_refreshed_at = NOW(), total_countries = ? WHERE id = 1',
      [totalCountries]
    );

    await connection.commit();

    try {
      const [topCountries] = await connection.query(
        'SELECT name, estimated_gdp FROM countries WHERE estimated_gdp IS NOT NULL ORDER BY estimated_gdp DESC LIMIT 5'
      );

      const [metadata] = await connection.query('SELECT last_refreshed_at FROM refresh_metadata WHERE id = 1');

      generateSummaryImage({
        totalCountries,
        topCountries,
        lastRefreshed: metadata[0].last_refreshed_at
      });
      
      console.log('Summary image generated successfully');
    } catch (imageError) {
      console.warn('Image generation failed (non-critical):', imageError.message);
    }

    res.json({
      message: 'Countries refreshed successfully',
      total_countries: totalCountries
    });

  } catch (error) {
    await connection.rollback();
    
    if (error.message.includes('Could not fetch data')) {
      return res.status(503).json({
        error: 'External data source unavailable',
        details: error.message
      });
    }

    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
}

export async function getAllCountries(req, res) {
  try {
    const { region, currency, sort } = req.query;
    
    let query = 'SELECT * FROM countries WHERE 1=1';
    const params = [];

    if (region) {
      query += ' AND LOWER(region) = LOWER(?)';
      params.push(region);
    }

    if (currency) {
      query += ' AND LOWER(currency_code) = LOWER(?)';
      params.push(currency);
    }

    if (sort === 'gdp_desc') {
      query += ' ORDER BY estimated_gdp DESC';
    } else if (sort === 'gdp_asc') {
      query += ' ORDER BY estimated_gdp ASC';
    } else if (sort === 'name_asc') {
      query += ' ORDER BY name ASC';
    } else if (sort === 'name_desc') {
      query += ' ORDER BY name DESC';
    }

    const [countries] = await pool.query(query, params);
    res.json(countries);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getCountryByName(req, res) {
  try {
    const { name } = req.params;
    const [countries] = await pool.query(
      'SELECT * FROM countries WHERE LOWER(name) = LOWER(?)',
      [name]
    );

    if (countries.length === 0) {
      return res.status(404).json({ error: 'Country not found' });
    }

    res.json(countries[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteCountry(req, res) {
  try {
    const { name } = req.params;
    const [result] = await pool.query(
      'DELETE FROM countries WHERE LOWER(name) = LOWER(?)',
      [name]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Country not found' });
    }

    res.json({ message: 'Country deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getStatus(req, res) {
  try {
    const [metadata] = await pool.query(
      'SELECT total_countries, last_refreshed_at FROM refresh_metadata WHERE id = 1'
    );

    res.json({
      total_countries: metadata[0].total_countries,
      last_refreshed_at: metadata[0].last_refreshed_at
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getImage(req, res) {
  try {
    const imagePath = path.join(__dirname, '..', 'cache', 'summary.png');
    
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Summary image not found' });
    }

    res.sendFile(imagePath);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
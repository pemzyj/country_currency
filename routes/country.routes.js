import {Router} from 'express';
import { fetchCountryData, fetchExchangeRate } from '../API/api.js';
import { pool } from '../database.js';

const router = Router();


const countryData = await fetchCountryData();
const exchangeData = await fetchExchangeRate();

//check if object.keys would work
const enrichedData = countryData.map(country => {
  const currencyCode = country.currencies?.[0]?.code; 
  const rate = exchangeData.rates[currencyCode]; 
  
  return {
    ...country,
    exchangeRate: rate || null 
  };
});



const countryWithGDP = enrichedData.map(country=>{
    const population = country.population;
    const exchange_rate = country.exchangeRate;
    const randomMultiplier = Math.random() * (2000 - 1000) + 1000;
    const estimated_gdp = population * randomMultiplier / exchange_rate;
    return {
        ...country, estimated_gdp: estimated_gdp || null
    };
})

import { pool } from './db.js'; 

router.post('/countries/refresh', async (req, res) => {
    const { countryWithGDP } = req.body;

    if (!Array.isArray(countryWithGDP) || countryWithGDP.length === 0) {
        return res.status(400).json({ error: "No countries provided" });
    }

    try {
        for (const country of countryWithGDP) {
            const { name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url } = country;

            if (!name || !population || !currency_code) {
                return res.status(400).json({
                    error: "validation failed",
                    details: {
                        ...( !name && { name: "is required" } ),
                        ...( !population && { population: "is required" } ),
                        ...( !currency_code && { currency_code: "is required" } )
                    }
                });
            }

            await pool.query(
                `INSERT INTO CountryFields 
                (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [name, capital || null, region || null, population, currency_code, exchange_rate, estimated_gdp || null, flag_url || null]
            );
        }

        res.status(201).json({ message: "Countries inserted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database insert failed" });
    }
});

router.get('/countries', async (req, res) => {
    try {
        const { region, currency, sort } = req.query;

        let query = 'SELECT * FROM CountryFields WHERE 1=1';
        const params = [];

        if (region) {
            query += ' AND region = ?';
            params.push(region);
        }

        if (currency) {
            query += ' AND currency_code = ?';
            params.push(currency);
        }

        if (sort) {
            if (sort === 'gdp_desc') query += ' ORDER BY estimated_gdp DESC';
            else if (sort === 'gdp_asc') query += ' ORDER BY estimated_gdp ASC';
            else if (sort === 'population_desc') query += ' ORDER BY population DESC';
            else if (sort === 'population_asc') query += ' ORDER BY population ASC';
        }

        const [rows] = await pool.query(query, params);
        res.status(200).json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch countries' });
    }
});

router.get('/countries/:name', async (req, res) => {
    try {
        const { name } = req.params;

        if (!name) {
            return res.status(400).json({ error: "Country name is required" });
        }

        const [rows] = await pool.query(
            'SELECT * FROM CountryFields WHERE name = ? LIMIT 1',
            [name]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: `Country '${name}' not found` });
        }

        res.status(200).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch country" });
    }
});


router.get('/status', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                COUNT(*) AS total_countries, 
                MAX(last_refreshed_at) AS last_refreshed_at 
            FROM CountryFields
        `);

        res.status(200).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch status" });
    }
});

router.delete('/countries/:name', async (req, res) => {
    try {
        const { name } = req.params;

        if (!name) {
            return res.status(400).json({ error: "Country name is required" });
        }

        const [result] = await pool.query(
            'DELETE FROM CountryFields WHERE name = ?',
            [name]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: `Country '${name}' not found` });
        }

        res.status(200).json({ message: `Country '${name}' deleted successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete country" });
    }
});




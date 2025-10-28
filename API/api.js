export async function fetchCountryData () {
    try{
        const res = await fetch('https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies', {timeout: 10000});
        if (!res.ok) {
            return res.status(400).json({error: 'API not available'});
        }
        const data = await res.json();
        return data;
    }catch(err) {
        console.error(err.message);
        return {message: 'API is nor available at this moment. Please check back later'};
    }
    
}

export async function fetchExchangeRate () {
    try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD', {timeout: 10000});
        if (!res.ok) {
            return res.status(400).json({error: 'Exchange rate API is not available'});
        }
        const data = await res.json();
        return data;
    }catch (err) {
        console.error(err.message);
        return {message: 'Exchange rate API is not available at the moment. Please check back later'};
    }
}
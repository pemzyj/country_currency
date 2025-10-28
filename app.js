import express from 'express';
import 'dotenv/config';
import { router } from './routes/country.routes.js';


const app = express();

app.use(express.json());
app.use('/api', router);


const PORT = process.env.PORT;



app.listen(PORT, '0.0.0.0', ()=>{
    console.log(`Server is running on port ${PORT}`);
})
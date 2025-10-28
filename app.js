import express from 'express';
import 'dotenv/config';


const app = express();

app.use(express.json());


const PORT = process.env.PORT;



app.listen(PORT, '0.0.0.0', ()=>{
    console.log(`Server is running on port ${PORT}`);
})
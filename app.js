import express from 'express';
import 'dotenv/config';
import {initDatabase}  from './database.js';
import router from './routes/country.routes.js';



const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/countries', router);
app.use('/status', router);

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
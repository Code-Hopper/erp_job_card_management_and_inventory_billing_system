import express from "express"
import dotenv from "dotenv"
import routes from './routes/index.js';

dotenv.config();

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'ERP API running',
    status: 'ok',
  });
});

app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

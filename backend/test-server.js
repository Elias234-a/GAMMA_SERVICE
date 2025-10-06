import express from 'express';
import logger from './config/logger.js';

const app = express();
const PORT = 5000;

app.get('/', (req, res) => {
  res.json({ message: 'Test server working' });
});

app.listen(PORT, () => {
  logger.info(`Test server running on port ${PORT}`);
});

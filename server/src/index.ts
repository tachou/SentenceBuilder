import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import { deviceIdMiddleware } from './middleware/deviceId.js';
import wordListsRouter from './routes/wordLists.js';
import progressRouter from './routes/progress.js';
import badgesRouter from './routes/badges.js';

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '500kb' }));

app.use('/api', deviceIdMiddleware);

app.use('/api/word-lists', wordListsRouter);
app.use('/api/progress', progressRouter);
app.use('/api/badges', badgesRouter);

async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`SentenceBuilder API running on http://localhost:${PORT}`);
  });
}

start();

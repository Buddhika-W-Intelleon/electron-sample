import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();

// Allow frontend (Vite default port: 5173)
app.use(cors({
  origin: 'http://localhost:5173', // You can allow multiple later
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

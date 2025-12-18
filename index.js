import express from 'express';
import userRouter from './routes/user.routes.js';
import urlRouter from './routes/url.routes.js';

const app = express();
const PORT = process.env.PORT ?? 8000;

app.use(express.json());

app.use('/user', userRouter);

app.use('/', urlRouter);

app.get('/', (req, res) => {
  return res.json({ message: 'home' });
});

app.listen(PORT, () => {
  console.log(`app is running on port: ${PORT}`);
});

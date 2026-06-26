import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ZodError } from 'zod';
import { authRouter } from './routes/auth.js';
import { coursesRouter } from './routes/courses.js';
import { availabilityRouter } from './routes/availability.js';
import { usersRouter } from './routes/users.js';
import { groupsRouter } from './routes/groups.js';
import { requireAuth } from './middleware/requireAuth.js';

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173'
  })
);
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', app: 'StudySync API' });
});

app.use('/api/auth', authRouter);
app.use('/api/courses', requireAuth, coursesRouter);
app.use('/api/availability', requireAuth, availabilityRouter);
app.use('/api/users', requireAuth, usersRouter);
app.use('/api/groups', requireAuth, groupsRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation error.',
      issues: error.flatten()
    });
  }

  console.error(error);
  return res.status(500).json({ message: 'Internal server error.' });
});

app.listen(port, () => {
  console.log(`StudySync API running on http://localhost:${port}`);
});

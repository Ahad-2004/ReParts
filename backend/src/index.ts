import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import listingsRouter from './routes/listings';
import uploadRouter from './routes/upload';
import chatRouter from './routes/chat';
import adminRouter from './routes/admin';

dotenv.config();

process.on('unhandledRejection', (reason) => {
    // eslint-disable-next-line no-console
    console.error('Unhandled Rejection at:', reason);
});

process.on('uncaughtException', (err) => {
    // eslint-disable-next-line no-console
    console.error('Uncaught Exception:', err);
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api/listings', listingsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/chat', chatRouter);
app.use('/api/admin', adminRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

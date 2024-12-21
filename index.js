// index.js
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import globalErrorHandler from './src/middlewares/globalErrorHandler.js';
import router from './src/routes/index.js';

//load dotenv
dotenv.config();

// Initialize Express app
const app = express();

app.use(
  cors({
    origin: '*', // Replace '*' with your WordPress site URL if needed
    methods: ['POST'],
  }),
);

app.use(cors());
// app.use(cors(['http://localhost:3000', 'https://areoforge.com']));
// Middleware
app.use(bodyParser.json()); // For parsing application/json

//define a test route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use('/api/v1', router);

app.use((req, res, next) => {
  console.log(`Unhandled route: ${req.method} ${req.path}`);
  next();
});

app.use(globalErrorHandler);

// Set up the server to listen on port 3000
const port = 5000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

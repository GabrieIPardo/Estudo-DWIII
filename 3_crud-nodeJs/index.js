const express = require('express');
const bodyParser = require('body-parser');
const todoRoutes = require('./routes/todoRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/todos', todoRoutes);

// Error middleware
app.use(errorMiddleware);

// Start sever
app.listen(PORT, () => {
    console.log(`Server está rodando em: http://localhost:${PORT}`);
})
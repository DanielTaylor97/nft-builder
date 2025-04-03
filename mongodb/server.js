const connect = require("./connect");
const docs = require("./documentRoutes");
const express = require("express");
const cors = require("cors");

const app = express();  // Instantiate express app

const PORT = 3001;  // Backend port

app.use(cors());
app.use(express.json());
app.use(docs);  // Mounting the routes to make them available to the frontend

app.listen(PORT, () => {
    connect.connect();
    console.log(`Successfully connected on port ${PORT}`);
});   // Instantiate the server



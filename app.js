require('dotenv').config();
const express = require('express');
const app = express();
const knjiznica = require('./routes/knjiznica');

app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(express.static('public'));
app.use('/api', knjiznica);

// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
    console.log("error: " + err.stack);
    console.log("error: " + err.name);
    console.log("error: " + err.code);

    res.status(500).json({
        errorMessage: err.message || "Something went rely wrong",
    });
});




const port = process.env.PORT || 3010;
app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});
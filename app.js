require('dotenv').config();
const express = require('express');
const app = express();
const port = 3010;
const knjiznica = require('./routes/knjiznica');


app.use(express.static('public'));
app.use('/api', knjiznica);





app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});
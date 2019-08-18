/**
 * Created by Cristi Arde on 8/18/2019.
 */

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.get('/', (req, res, next) => {
    res.send('Hello world');
})

app.listen(3000);
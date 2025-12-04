import express from 'express';

import cadastro from './routes/cadastro.js';
import csv from './routes/csv.js';
import json from './routes/json.js';
import pdf from './routes/pdf.js';

const app = express();
const port = 3000;


app.use('/cadastro', cadastro);
app.use('/csv', csv);
app.use('/json', json);
app.use('/pdf', pdf);

app.use('/', express.static('static'));

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
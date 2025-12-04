import express from 'express';

import cadastro from './routes/cadastro.js';

const app = express();
const port = 3000;


app.use('/cadastro', cadastro);

app.use('/', express.static('static'));

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
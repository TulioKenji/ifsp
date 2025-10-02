const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send("GET")
})

app.post('/', (req, res) => {
    res.send("POST")
})

app.put('/', (req, res) => {
    res.send("PUT")
})

app.patch('/', (req, res) => {
    res.send("PATCH")
})

app.delete('/', (req, res) => {
    res.send("DELETE")
})

app.get('/user', (req, res) => {
    res.send("tulio");
})

//

app.get('/product', (req, res) => {
    res.send(`<ul><li>Tekpix 3000</li><li>3000$</li></ul>`);
})

app.post('/product', (req, res) => {
    res.send("TEKPIX ADICIONADA")
})

app.put('/product', (req, res) => {
    res.send("NOME MUDADO PARA: TEKPIX 3000 PRECO: 2000$")
})

app.patch('/product', (req, res) => {
    res.send("PRECO MUDADO PARA: 3000$")
})

app.delete('/product', (req, res) => {
    res.send("FALIU A TEKPIX")
})


app.listen(port, () => {
  console.log(`Servidor rodando em HTTP//localhost:${port}`)

})
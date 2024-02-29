
const express = require('express')
const https = require('https');
const app = express()
const port = 5000

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})

//Story #0
app.get('/api/ping', (req, res) => {
  res.send('Pong')
})
app.get('/', (req, res) => {
  res.send('Welcome on the app')
})

//Story #1
let productId = 0
const catalogueUrl = "http://microservices.tp.rjqu8633.odns.fr/api/products"
const stockUrl = "https://api-stock.vercel.app/api/stock/" + productId + '/movement'

app.use(express.json());

app.post('/api/supply', async (req, res) => {
  try {
    const response = await fetch(catalogueUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    productId = data[0].ean

    const postResponse = await fetch(stockUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data[0]),
    });

    if (!postResponse.ok) {
      throw new Error(`HTTP error! status: ${postResponse.status}`);
    }
    const postData = await postResponse.json();

    res.status(200).json(postData);
  } catch (error) {
    console.error(error);
    res.status(500).send(`Error making API call: ${error.message}`);
  }
});
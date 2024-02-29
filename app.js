
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
const product = {
  productId: 1,
  ean: 'EAN13',
  name: "Iphone",
  description: "New phone",
  purchasePricePerUnit: 1400,
  quantity: 12
};

app.use(express.json());

app.post('/api/supply', (req, res) => {
  const options = {
    hostname: 'api-stock.vercel.app',
    port: 443,
    path: `/api/stock/${product.productId}/movement`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const reqApi = https.request(options, (resApi) => {
    let body = '';
    resApi.on('data', (chunk) => {
      body += chunk;
    });

    resApi.on('end', () => {
      res.status(200).send(body);
    });
  });

  reqApi.on('error', (error) => {
    console.error(error);
    res.status(500).send('Erreur lors de l\'appel à l\'API externe');
  });

  reqApi.write(JSON.stringify(product));
  reqApi.end();
});
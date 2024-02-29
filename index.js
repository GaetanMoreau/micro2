const express = require('express');
const https = require('https');
const app = express();
const port = 5000;

app.use(express.json());

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

app.get('/api/ping', (req, res) => {
  res.send('Pong');
});

app.get('/', (req, res) => {
  res.send('Welcome on the app');
});

app.post('/api/supply', async (req, res) => {
  const { supplyId, products } = req.body;

  try {
    for (const product of products) {
      const stockMovement = {
        productId: product.ean,
        quantity: product.quantity,
        status: 'Supply',
      };

      await sendStockMovement(stockMovement);
    }

    res.status(204).send();
  } catch (error) {
    console.error('Failed to process supply:', error);
    res.status(500).send('Internal Server Error');
  }
});

async function sendStockMovement(stockMovement) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api-stock.vercel.app',
      path: `/api/stock/${stockMovement.productId}/movement`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      if (res.statusCode === 204) {
        resolve();
      } else {
        reject(new Error(`Failed to send stock movement with status code: ${res.statusCode}`));
      }
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(JSON.stringify(stockMovement));
    req.end();
  });
}

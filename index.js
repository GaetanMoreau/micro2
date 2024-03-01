const express = require('express');
const https = require('https');
const http = require('http');
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

const catalogueUrl = "http://microservices.tp.rjqu8633.odns.fr/api/products"

app.post('/api/supply', async (req, res) => {
  let { supplyId, products } = req.body;

  const response = await fetch(catalogueUrl);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();

  const existingProducts = products.filter(product => data.some(p => p.ean === product.ean));

  try {
    if (existingProducts.length > 0) {
      for (const existingProduct of existingProducts) {
        const stockMovement = {
          productId: data.find(p => p.ean === existingProduct.ean)._id,
          quantity: existingProduct.quantity,
          status: 'Supply',
        };
        if (stockMovement.quantity < 0) {
          console.error('La quantité ne peux pas être négative');
        } else {
          await sendStockMovement(stockMovement);
        }
      }
    } else {
      for (const product of products) {
        const newProduct = {
          productId: "",
          ean: product.ean,
          name: product.name,
          description: product.description,
          categories: product.categories,
          price: product.price,
        };
        await (createNewProduct(newProduct))
      }
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

async function createNewProduct(newProduct) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'microservices.tp.rjqu8633.odns.fr',
      path: `/api/products`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
      });
      if (res.statusCode === 201) {
        resolve();
      } else {
        reject(new Error(`Failed to add product to catalog with status code: ${res.statusCode}, ${res.body}`));
      }
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(JSON.stringify(newProduct));

    req.end();
  });
}

app.post('/api/supply-needed', async (req, res) => {
  let { productId } = req.body;
  try {
    if (productId) {
      const response = await fetch(catalogueUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const productToSupply = data.find((element) => element._id === productId)

      await (askForSupply(productToSupply))
    } else {
      console.error("Il n'y a pas d'id de produit")
    }

    res.status(204).send();
  } catch (error) {
    console.error('Failed to process supply:', error);
    res.status(500).send('Internal Server Error');
  }
});

async function askForSupply(productToSupply) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'microservices.tp.rjqu8633.odns.fr',
      path: `/api/supply-request`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 204) {
        resolve();
      } else {
        reject(new Error(`Failed to add product to catalog with status code: ${res.statusCode}, ${res.body}`));
      }
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(JSON.stringify(productToSupply.ean));
    req.end();
  });
}
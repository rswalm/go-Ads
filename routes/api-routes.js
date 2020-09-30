const Sequelize = require('sequelize');
const fs = require('fs');
const db = require('../models');
const multerUpload = require('../middleware/upload');

function gridDisplay(dbProducts) {
  const result = [];
  let temp = [];
  for (let i = 0; i < dbProducts.length; i += 1) {
    temp.push(dbProducts[i]);
    if (temp.length === 3) {
      result.push(temp);
      temp = [];
    }
  }
  if (temp.length > 0) {
    result.push(temp);
  }
  return result;
}

module.exports = (app) => {
  app.get('/', (req, res) => {
    db.Products.findAll({
      limit: 3,
      order: [['product_id', 'DESC']],
    })
      .then((dbProducts) => {
        res.render('index', { products: dbProducts });
      });
  });

  // Get route for returning products which have deals
  app.get('/deals', (req, res) => {
    db.Products.findAll({
      order: Sequelize.literal('rand()'), limit: 4,
    })
      .then((dbProduct) => {
        const result = gridDisplay(dbProduct);
        res.render('products', { products: result });
      });
  });

  // GET route for retrieving a single product (not used)
  app.get('/api/products/:product_id', (req, res) => {
    db.Products.findOne({
      where: {
        product_id: req.params.product_id,
      },
    })
      .then((dbProduct) => {
        res.json(dbProduct);
      });
  });

  // POST route for saving a new product
  app.post('/api/postProduct', multerUpload.single('image'), (req, res) => {
    console.log(req.body);
    console.log(req.file);
    const imgData = Buffer.from(fs.readFileSync(req.file.path)).toString('base64');
    db.Products.create({
      product_name: req.body.product_name,
      price: req.body.price,
      category: req.body.category,
      description: req.body.description,
      img_data: imgData,
      img_url: req.body.img_url,
    })
      .then((dbProduct) => {
        res.json(dbProduct);
      })
      .catch((err) => {
        res.json({ error: err.message });
      });
  });

  // POST route for ADD TO CART
  app.post('/api/cart', (req, res) => {
    db.Cart.create({
      product_name: req.body.product_name,
      price: req.body.price,

    })
      .then((dbCart) => {
        res.json(dbCart);
      });
  });

  // DELETE route for deleting PRODUCTS FROM CART
  app.delete('/api/cart/:cart_id', (req, res) => {
    db.Cart.destroy({
      where: {
        cart_id: req.params.cart_id,
      },
    })
      .then((dbCart) => {
        res.json(dbCart);
      }).catch((error) => res.json(error))
  });

  // GET ROUTE FOR DISPLAYING ALL ITEMS IN CART

  app.get('/cart', (req, res) => {
    db.Cart.findAll({
      raw: true
    })
      .then((dbCart) => {


        res.render('cart', { cartItems: dbCart })
      });
  });

  // Displaying items in confirmation

  app.get('/confirmation', (req, res) => {
    db.Cart.findAll({
      raw: true
    })
      .then((dbCart) => {


        res.render('orderConfirmation', { cartItems: dbCart })

      });
  });


  // Displaying items in checkout

  app.get('/checkout', (req, res) => {
    db.Cart.findAll({
      raw: true
    })
      .then((dbCart) => {


        res.render('checkout', { cartItems: dbCart })

      });
  });

  // GET route to display all the products based on category
  app.get('/products', (req, res) => {
    const whereCondition = {};
    if (req.query.category) {
      whereCondition.category = req.query.category;
    }

    db.Products.findAll({
      where: whereCondition,
    })
      .then((dbProducts) => {
        const result = gridDisplay(dbProducts);
        res.render('products', { products: result });
      });
  });

  // GET route for search keyword
  app.get('/search', (req, res) => {
    db.Products.findAll({
      limit: 10,
      where: {
        product_name: {
          [Sequelize.Op.like]: `%${req.query.keyword}%`,
        },
      },
    })
      .then((dbProduct) => {
        const result = gridDisplay(dbProduct);
        res.render('products', { products: result });
      });
  });

  // PUT route for updating products in cart
  app.put('/api/products', (req, res) => {
    db.Products.update(req.body,
      {
        where: {
          product_id: req.body.product_id,
        },
      })
      .then((dbProduct) => {
        res.json(dbProduct);
      });
  });
};

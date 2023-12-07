const userController = require('./controllers/userController')
const productController = require('./controllers/productController')
const cartController = require('./controllers/cartController')
const express = require('express')
const router = express.Router()

// Users
router.post('/insertUser', (req, res) => userController.insertUser(req, res))
router.post('/login', (req, res) => userController.login(req, res))
router.get('/findUserById/:userId', (req, res) => userController.findUserById(req, res))
router.put('/blockUser', (req, res) => userController.blockUser(req, res))

// Products
router.post('/creayeProduct', (req, res) => productController.createProduct(req, res))
router.get('/findProductByField/:field/:value', (req, res) => productController.findProductByField(req, res))
router.post(`/insertProduct`, (req, res) => productController.insertProduct(req,res))

// Carts
router.post('/insertCart', (req, res) => cartController.insertCart(req, res))
router.get('/findCartsByUser/:userId', (req, res) => cartController.findCartsByUser(req, res))
module.exports = router
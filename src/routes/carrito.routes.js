const express = require('express')
const router = express.Router()
const { addProductCarrito } = require('../controllers/carrito.controller')

// router.get('/carrito', renderCarritoForm)

router.post('/:id', addProductCarrito)

module.exports = router
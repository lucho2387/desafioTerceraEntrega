const express = require('express')
const router = express.Router()
const { 
        renderPorductoForm, 
        createNewProduct, 
        listProducts, 
        renderEditForm, 
        updateProduct, 
        deleteProduct,
        renderAddForm 
} = require('../controllers/productos.controllers')

const { isAuthenticated } = require('../middlewares/auth')

// Nuevo producto
router.get('/producto',isAuthenticated, renderPorductoForm)

router.post('/producto',isAuthenticated, createNewProduct)

// Actualizar Producto
// router.get('/:id',isAuthenticated, renderEditForm)

// router.put('/:id',isAuthenticated, updateProduct)

// Agregar producto al Carrito
router.get('/:id',isAuthenticated, renderAddForm)

// Eliminar Productos
router.delete('/:id',isAuthenticated, deleteProduct)

module.exports = router

const carritoCtrl = {}

const Carrito = require('../models/Carrito')
const Producto = require('../models/Producto')

// carritoCtrl.renderCarritoForm =  (req, res) => {
//     const carrito =  Carrito.find()
// //     console.log(carrito)
// //     res.render('cart/list-cart', { carrito })
//     res.render('cart/list-cart', { carrito })
// }

carritoCtrl.addProductCarrito =  async (req, res) => {
    const producto = await Producto.findById(req.params.id).lean()
    // console.log(producto)
    const nuevoCarrito = new Carrito ({productos: producto})
    await nuevoCarrito.save() 
    res.redirect('/productos')
}

module.exports = carritoCtrl
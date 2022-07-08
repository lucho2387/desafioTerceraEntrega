const indexCtrl = {}

const Producto = require('../models/Producto')

indexCtrl.renderIndex = async (req, res) => {
    const productos = await Producto.find().lean()
    res.render('index',{ productos })
    // console.log(productos)
}

// indexCtrl.renderNosotros = (req, res) => {
//     res.render('nosotros')
// }

module.exports = indexCtrl
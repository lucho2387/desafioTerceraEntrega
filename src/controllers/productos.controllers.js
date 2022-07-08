const productosCtrl = {}

const Producto = require('../models/Producto')
const Usuario = require('../models/Usuario')
const winston = require('winston')

const logger = winston.createLogger({
    level: 'warn',
    transports : [
        new winston.transports.Console({ level:'verbose' }),
        new winston.transports.File({ filename: 'warn.log', level:'warning' }),
        new winston.transports.File({ filename: 'error.log', level:'error' })
    ]
 })

productosCtrl.renderPorductoForm = (req, res) => {
    logger.info({ruta: req.url,metodo: req.method})
    res.render('products/new-product')
}

productosCtrl.createNewProduct = async (req, res) => {
try {
        const {nombre,descripcion,codigo,imagen,precio,stock} = req.body
        if(nombre && descripcion && codigo && precio && imagen && stock) {
            const nuevoProducto = new Producto ({nombre,descripcion,codigo,imagen,precio,stock})
            await nuevoProducto.save() 
            req.flash('mensaje', 'El producto fue guardado correctamente')
            // res.status(200).json({mensaje: "El producto fue guardado correctamente", id: nuevoProducto._id})
            res.redirect('/productos') 
            logger.info({ruta: req.url,metodo: req.method})
        }else {
            logger.error("Faltaron Completar campos")
            res.status(500).json({error:"Los datos son requeridos"})
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

productosCtrl.renderEditForm = async (req, res) => {
    const producto = await Producto.findById(req.params.id).lean()
    res.render('products/edit-product', { producto })
    logger.info({ruta: req.url,metodo: req.method})
}

productosCtrl.updateProduct = async (req, res) => {
    const { nombre, descripcion, codigo, imagen, precio, stock } = req.body
    await Producto.findByIdAndUpdate(req.params.id, { nombre, descripcion, codigo, imagen, precio, stock })
    req.flash('mensaje', 'El producto fue actualizado correctamente')
    logger.info({ruta: req.url,metodo: req.method})
    res.redirect('/productos')
}

productosCtrl.renderAddForm = async (req, res) => {
    const producto = await Producto.findById(req.params.id).lean()
    res.render('products/add-product', { producto })
    logger.info({ruta: req.url,metodo: req.method})
}

productosCtrl.deleteProduct = async (req, res) => {
    await Producto.findByIdAndDelete(req.params.id)
    req.flash('mensaje', 'El producto fue eliminado correctamente')
    logger.info({ruta: req.url,metodo: req.method})
    res.redirect('/productos')
}

module.exports = productosCtrl

// exports.renderPorductoForm = (req, res) => {
//         res.json({mensaje:'Formulario de un Nuevo Producto'})
// }

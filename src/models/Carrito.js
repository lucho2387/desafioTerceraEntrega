const { Schema, model } = require('mongoose')


const CarritoSchema = new Schema (
    {
    productos: [
        {
            type: Object,
        }
    ],
    total: {
        type:Number
    }
    },
    {
        timestamps: true,
        versionKey: false
    }
)

module.exports = model('Carrito', CarritoSchema)
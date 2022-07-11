const express = require('express')
const cookieParser = require("cookie-parser")
const handlebars = require('express-handlebars')
const path =  require('path')
const morgan = require('morgan')
const methodOverride = require('method-override')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const MongoStore = require("connect-mongo")
// const parseArgs = require('minimist')
// const { fork } = require('child_process')
const cluster = require('cluster');
const numCPUs = require('os').cpus().length
// const http = require('http')
const compression = require('compression')
const winston = require('winston')
const dotenv = require('dotenv')
dotenv.config();
require('./database')
const { createTransport } = require('nodemailer')
const twilio = require('twilio')


const logger = winston.createLogger({
    level: 'warn',
    transports : [
        new winston.transports.Console({ level:'verbose' }),
        new winston.transports.File({ filename: 'warn.log', level:'warn' }),
        new winston.transports.File({ filename: 'error.log', level:'error' })
    ]
 })


const advancedOptions = {
    useNewUrlParser: true,
    useunifiedTopology: true
}


const Producto = require('./models/Producto')
const Usuario = require('./models/Usuario')
const Carrito = require('./models/Carrito')
const { isAuthenticated } = require('./middlewares/auth')
const { NAME, NAME_DATABASE, PASSWORD } = process.env

// // Inicializacion
const app = express()
app.set('port', process.env.PORT || 8080)
// require('./config/passport')

// const PORT = parseInt(process.argv[2])
const modoCluster = process.argv[2] == 'CLUSTER'

require('./config/passport')


if(modoCluster || !modoCluster){
    
    app.set("views", path.join(__dirname, "views"));

    // Motor de Plantilla (Handlebars)
    app.engine(
        ".hbs",
        handlebars.engine({
        defaultLayout: "main",
        layoutsDir: path.join(app.get("views"), "layouts"),
        partialsDir: path.join(app.get("views"), "partials"),
        extname: ".hbs",
        })
    );
    app.set("view engine", ".hbs");

    // Middlewares
    app.use(morgan('dev'))
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }));
    app.use(methodOverride('_method'))
    app.use(cookieParser())
    app.use(session({
        store: MongoStore.create({
            mongoUrl: `mongodb+srv://${NAME}:${PASSWORD}@cluster0.9xnml.mongodb.net/${NAME_DATABASE}?retryWrites=true&w=majority`,
            mongoOptions: advancedOptions
        }),
        secret: 'secret',
        resave: true,
        saveUninitialized: true,
        cookie: {
            maxAge: 6000000
        }
    }))
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())
    // app.use(compression())


    // Variables Globales
    app.use((req, res, next) => {
    res.locals.mensaje = req.flash('mensaje')
    res.locals.error = req.flash('error')
    // res.locals.error = req.flash('error')
    res.locals.user = req.user || null;
    next()
    })

    app.get('/productos',isAuthenticated, async (req, res) => {
        const user = req.user
        const usuario = await Usuario.findById(user).lean()
        const productos = await Producto.find().lean()
        logger.info({ruta: req.url,metodo: req.method})
        res.render('products/list-products', {usuario, productos})

    })

    app.get('/carrito',isAuthenticated, async (req, res) => {
        const carrito = await Carrito.find().lean()
        const productos = await Producto.find().lean()
        // const nombre  = JSON.stringify(carrito)
        res.render('cart/list-cart', { carrito, productos })
    })

    app.get('/usuario/salir', async (req, res) => {
        const user = req.user
        const usuario = await Usuario.findById(user).lean()
        req.logout()
        req.flash('mensaje', `Hasta Luego ${usuario.nombre}`)
        logger.info({ruta: req.url,metodo: req.method})
        res.redirect('/usuario/login')
    })


    app.get('/info', async (req, res) => {
        const util = require('util');
        const directorio = process.cwd()
        const ruta = process.execPath
        const procesoId = process.pid
        const nombrePlataforma = process.platform
        const versionNode = process.version
        const argumentoEntrada = process.argv
        const memoriaReservada = util.inspect(process.memoryUsage().rss)
        const totalCPUs = require('os').cpus().length
        logger.info({ruta: req.url,metodo: req.method})
        res.render('process/info',{directorio,ruta,procesoId,nombrePlataforma,versionNode,argumentoEntrada,memoriaReservada,totalCPUs})
    })

    app.get("/compra", async (req, res) => {

        // Mensaje al Administrador
        // console.log(req.user)
        const nombre = req.user.nombre
        const email = req.user.email
        const carrito = await Carrito.find().lean()
        const asunto = "Nuevo Pedido"
        const datosCarrito = JSON.stringify(carrito)
        const mensaje =  `<div>
                            <h3>Productos del Carrito${datosCarrito}</h3> 
                        </div>
                        <div>
                            <h3>Nombre del Usuario: ${nombre}</h3>  
                        </div>
                        <div>
                            <h3>Correo del Usuario: ${email}</h3>
                        </div>
                        `

        const transporter = createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSEMAIL
            }
        });

        const mailOptions = {
            from: 'Servidor Node.js',
            to: process.env.EMAIL,
            subject: asunto,
            html: mensaje,
        }

        try {
            const info = await transporter.sendMail(mailOptions)
            console.log(info)
         } catch (error) {
            console.log(error)
         }

        // Mensaje al Usuario

        const client = twilio(process.env.ACCOUNTSID, process.env.AUTHTOKEN)

        try {
            const message = await client.messages.create({
                body: 'Su pedido ha sido recibido y se encuentra en proceso',
                from: process.env.FROMMESSAGE,
                to: process.env.TOMESSAGE
            })
            console.log(message)
        } catch (error) {
            console.log(error)
        }
        
        // Mensaje de Whatsapp
        try {
            const messageWhatsapp = await client.messages.create({
                from: process.env.FROMMESSAGEWHATSAPP,
                body: mensaje,
                to: process.env.TOMESSAGEWHATSAPP
            })
            console.log(messageWhatsapp.sid)
        } catch (error) {
            console.log(error)
        }
        res.redirect('/productos')
    })

    app.get("/perfil", async (req, res) => {
        const user = {
            nombre: req.user.nombre,
            email: req.user.email,
            direccion: req.user.direccion,
            edad: req.user.edad,
            telefono: req.user.telefono,
            avatar: req.user.avatar,
        }
        // console.log(user);
        res.render('users/perfil', user)
    })


    // Rutas
    app.use(require('./routes/index.routes'))
    app.use(require('./routes/productos.routes'))
    app.use(require('./routes/usuarios.routes'))
    app.use(require('./routes/random.routes'))
    app.use(require('./routes/carrito.routes'))

    // Archivos Estaticos
    app.use(express.static(path.join(__dirname, "public")));
}

app.listen(app.get('port'), () => {
    console.log('Servidor corriendo en el puerto:', app.get('port'))
})



 


const usuariosCtrl = {}
const passport = require('passport')
const { createTransport } = require('nodemailer')

const Usuario = require('../models/Usuario')

usuariosCtrl.renderRegistroForm = (req, res) => {
    res.render('users/register')
}

usuariosCtrl.register = async (req, res) => {
    const errors = []
    const { nombre, email, direccion, edad, telefono, avatar, password, confirmPassword } = req.body

    if(password !== confirmPassword){
        errors.push({text: 'Las contraseñas no coiciden'})
    }

    if(password.length < 4){
        errors.push({text: 'La contraseña debe contener mas de 4 caracteres'})
    }

    if(errors.length > 0){
        res.render('users/register', {
            errors,
            nombre,
            email,
            direccion,
            edad,
            telefono,
            avatar,
            password,
            confirmPassword
        })
    }else {
        const emailUsuario = await Usuario.findOne({ email: email })
        if(emailUsuario){
            req.flash('error', 'El correo ya existe')
            res.redirect('/usuario/registro')
        }else {
            const nuevoUsuario = new Usuario({nombre, email, direccion, edad, telefono, avatar, password})
            nuevoUsuario.password = await nuevoUsuario.encriptarContraseña(password)
            await nuevoUsuario.save()
            req.flash('mensaje', 'El usuario fue registrado correctamente')

            const asunto = "Nuevo Registro"
            const datosUsuario = JSON.stringify(nuevoUsuario)
            const mensaje = datosUsuario

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
                transporter.sendMail(mailOptions)
                res.redirect('/usuario/login')
            } catch (error) {
                console.log(error)
            }
            // res.redirect('/usuario/login')
        }   
    }
}

usuariosCtrl.renderLoginForm = (req, res) => {
    res.render('users/login')
}

usuariosCtrl.login = passport.authenticate('local', {
    failureRedirect: '/usuario/login',
    successRedirect: '/productos',
    failureFlash: true,
    
})

module.exports = usuariosCtrl

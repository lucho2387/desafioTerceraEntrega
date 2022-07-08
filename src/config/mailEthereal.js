const { createTransport } = require('nodemailer')

const TEST_MAIL = "percival.rolfson@ethereal.email"
// const asunto = process.argv[2]
// const mensaje = process.argv[3]
const asunto = "Nuevo Registro"
const mensaje = "Datos del Registro"

const transporter = createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: TEST_MAIL,
        pass: 'Cn2JAXyADwhzEDUypM'
    }
});

// const mailOptions = {
//     from: 'Servidor Node.js',
//     to: TEST_MAIL,
//     subject: 'Mail de prueba desde Node.js',
//     html: '<h1 style="color: blue;">Se registro el usuario <span style="color: green;">correctamente con Nodemailer</span></h1>'
//  }

const mailOptions = {
    from: 'Servidor Node.js',
    to: TEST_MAIL,
    subject: asunto,
    html: mensaje,
 }

 try {
    const info = transporter.sendMail(mailOptions)
    console.log(info)
 } catch (error) {
    console.log(error)
 }
 
 
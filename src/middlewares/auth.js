const auth = {}
const winston = require('winston')

const logger = winston.createLogger({
    level: 'warn',
    transports : [
        new winston.transports.Console({ level:'verbose' }),
        new winston.transports.File({ filename: 'warn.log', level:'warn' }),
        new winston.transports.File({ filename: 'error.log', level:'error' })
    ]
 })

auth.isAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()) {
        
        return next()
    }
    req.flash('error', 'Ruta no autorizada')
    res.redirect('/usuario/login')
    logger.warn('Ruta no autorizada')
}

auth.isAuthenticatedLogin = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next()
    }
    req.flash('error', 'El tiempo de session a expirado')
    res.redirect('/usuario/login')
}

module.exports = auth

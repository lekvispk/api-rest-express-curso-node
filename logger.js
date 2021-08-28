
// Exportando un midleWare en un archivo independiente
// importarlo del a siguiente manera: 
// const logger = require('./logger'); 
function log( req, res , next ){
    console.log('Logging........');
    next();
}

module.exports = log;
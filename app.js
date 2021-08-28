const debug = require('debug')('app:inicio');
// windows: setx DEBUG "app:inicio"
const dbDebug = require('debug')('app:db');
// windows: setx DEBUG "app:inicio, app:db"
// windows: setx DEBUG "app:*"
const { response } = require('express');

// windows: setx NODE_ENV "production" y probar en un neuvo terminal 
const config = require('config');
//const logger = require('./logger');
const Joi = require('@hapi/joi');
const morgan = require('morgan');


const express = require('express');
const app = express();

app.use(express.json()); //body
app.use(express.urlencoded({extended:true}));// queryString
app.use(express.static('public'))

//app.use(logger)

//Configuracion de entornos
console.log ( 'Aplicacion: ' +  config.get('nombre') );
console.log ( 'BD Server: ' +  config.get('configDB.host') );

// uso de middleware morgan
if( app.get('env') === 'development'){
    console.log( ' desarollo sin Morgan '); 
}
if( app.get('env') === 'production'){
    //console.log( ' con morgan en produccion');
    app.use(morgan('tiny'));
    debug('Morgan debug');
} 

//transacciones de BD 
debug('Trabajando con base de datos');
debug('morgan habilitado');
/*
app.use( function( req, res , next ){
    console.log('Autenticando........');
    next();
})
*/

const usuarios = [
    { id:1,  nombre:'Juan'},
    { id:2,  nombre:'Grover'},
    { id:3,  nombre:'Ana'}
]

app.get( '/' , (req,res) =>{
    res.send('Hola mundo desde Express.');
});

app.get( '/api/usuarios' , (req,res) =>{
    res.send( usuarios );
});
/*
app.get( '/api/usuarios/:year/:mes' , (req,res) =>{
    //res.send( req.params.year );
    //ver todos los parametros  configuradosp or url 
   // res.send( req.params );
   //ver los parametros que llegan por query string 
    res.send( req.query );
});
*/
app.get( '/api/usuarios/:id' , (req,res) =>{
    
    let usuario = existeUsuario(req.params.id); // usuarios.find(u => u.id === parseInt(req.params.id) );
    if( !usuario ){
        res.status(404).send('El usuario no fue encontrado');
    }

    res.send(usuario);
});

app.post( '/api/usuarios' , (req,res) =>{
/*
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    });
*/
    const { error , value } = validarUSuario(req.body.nombre);//schema.validate({ nombre: req.body.nombre });
    if( !error){
        const usuario = {
            id : usuarios.length+1,
            nombre : value.nombre
        }
    
        usuarios.push( usuario );
        res.send( usuario );
    }else{
        res.status(400).send( error.details[0].message );
    }

/*
    if( !req.body.nombre || req.body.nombre.length <= 2 ){
        res.status(400).send('Debe ingresar un nombre, con minimo 3 caracteres');
        return;
    }
    
 
*/
});

app.put( '/api/usuarios/:id' , (req,res) =>{

    //let usuario = usuarios.find(u => u.id === parseInt(req.params.id) );
    let usuario = existeUsuario(req.params.id);
    if( !usuario ){ 
        res.status(404).send('El usuario no fue encontrado');  
        return;   
    }
    /*
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    });
    */
    //const { error , value } = schema.validate({ nombre: req.body.nombre });
    const { error , value } =validarUSuario( req.body.nombre );
    if(error){
        res.status(400).send( error.details[0].message );
        return;
    }

    usuario.nombre = value.nombre;
    res.send( usuario );

});

app.delete( '/api/usuarios/:id' , (req,res) =>{

    let usuario = existeUsuario(req.params.id);
    if( !usuario ){ 
        res.status(404).send('El usuario no fue encontrado');  
        return;
    }
    const index = usuarios.indexOf( usuario );
    usuarios.splice(index,1);

    res.send( usuario );

});

// windows: setx PORT "5000"
const port = process.env.PORT || 3000 ; 

app.listen( port , ()=>{ 
    console.log( `Escuchando en el puerto ${port}...` );
});
/*
app.post(); //envio de datos hacia el servidor
app.put(); // actualizacion
app.delete(); //eiminacion*/

function existeUsuario( id ){
    return ( usuarios.find(u => u.id === parseInt(id) ) );
}

function validarUSuario( nom ){ 
    const schema = Joi.object({
        nombre: Joi.string()
                    .min(3)
                    .required()
    });
    return ( schema.validate({ nombre: nom }) );
}
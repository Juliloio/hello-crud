const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const morgan   = require('morgan');

// config vars
const port = process.env.PORT        || 3000;
const db   = process.env.MONGODB_URI || 'mongodb://localhost/notas';

// crear app
const app = express();

// conexion a la base de datos
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => {
    console.log(`DB connected @ ${db}`);
  })
  .catch(err => console.error(`Connection error ${err}`));

// todo el middleware aca abajo y antes del listen
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.use('/api', require('./api/routes/note'));

// los middlewares se ejecutan en orden para todas las peticiones
// salvo que no coincida la ruta
// (solo para el 4to middleware en este caso)  
app.use(express.json());                        // 1er middleware
app.use(cors());                                // 2do middleware
app.use(morgan('dev'));                         // 3er middleware
app.use('/api', require('./api/routes/note'));  // 4to middleware
// si el cliente NO hace una peticion a algun endpoint de la API
// entonces usamos una ruta que devuelva un status code 404
// 5to middleware (error 404 not found)
app.use((req, res, next) => {
  const err = new Error('Not found');
  err.status = 404;
  next(err);
});
// no terminamos la cadena de middlewares ahi
// la pasamos a un 6to middleware que responda al cliente
// con el error 404 o 500 si vino de otro lado el problema
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  // para mas detalles usar: console.error(err.stack)
  res.json({ error: err.message });
});


// listen
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
});  
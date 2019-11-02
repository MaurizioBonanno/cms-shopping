const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const configdb = require('./config/database');//recupero i dati dal file di config
const bodyParser = require('body-parser');
const session = require('express-session');
const expressValidator = require('express-validator');
const fileUpload = require('express-fileupload');


//connessione al db
mongoose.connect(configdb.database , {useUnifiedTopology: true, useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('connesso a MongoDb');
});

//inizializzo l'app
const app = express();

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','ejs');

//set public folder
app.use(express.static(path.join(__dirname, 'public/')));

//set global errors variable
app.locals.errors = null;

//set il router per le rotte
const pages = require('./routes/pages.js');
const admin_pages = require('./routes/admin_pages.js');
const admin_category = require('./routes/admin_categoryes.js');
const adminProducts = require('./routes/admin_products.js')

//express-fileupload middleware
app.use(fileUpload());


//express-validator middleware
app.use(expressValidator({
  errorFormatter: function(params, msg, value){
    var nameSpace = params.split('.'),
    root = nameSpace.shift(),
    formsParam = root;
    while(nameSpace.length){
      formsParam += '['+ nameSpace.shift() +']';
    }
    return {
      param: formsParam,
      msg: msg,
      value: value
    };
  },

  customValidators: {
     isImage: function(value, filename){
       var extension = (path.extname(filename)).toLowerCase();
       switch(extension){
           case '.jpg':
             return '.jpg';
           case '.jpeg':
             return 'jpeg';
           case '.png':
             return '.png';
           case '':
             return '.jpg';
           default:
             return false;
       }
     }
  }
}));

// express-message middleware 
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//body-parser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
//express-session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));

//gsetisco le rotte
app.use('/',pages);
app.use('/admin/pages',admin_pages);
app.use('/admin/category',admin_category);
app.use('/admin/products', adminProducts);





const PORT = 3000;

app.listen(PORT, ()=>{
   console.log('server listen at port:'+PORT);
});
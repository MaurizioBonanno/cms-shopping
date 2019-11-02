const express = require('express');
const router = express.Router();
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');

//get Products Model
const Products = require('../models/products');
//get Categories
const Categories = require('../models/category');

//GET products index
router.get('/',(req,res)=>{

    var count=1;

    Products.countDocuments((err, c)=>{
       count=c;
    });

    Products.find((err,products)=>{
        res.render('layouts/admin/products', {
            products: products,
            count: count
        });
    });

});

//GET add-products
router.get('/add-product',(req,res)=>{
    const title="";
    const desc="";
    const price ="";
    Categories.find((err,cats)=>{
        res.render('layouts/admin/add_products', {
            title: title,
            description: desc,
            categories: cats,
            price: price
        });
    });

});


//POST add-products
router.post('/add-products',(req,res)=>{

    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('title','Il title non può essere nullo').notEmpty();
    req.checkBody('description','descrizione non può essere nullo').notEmpty();
    req.checkBody('price','Il prezzo non può essere nullo').notEmpty();
    req.checkBody('image','Devi uplodare un immagine').isImage(imageFile);

   var t= req.body.title;
   var s=t.replace(/\s+/g, '-').toLowerCase();
   var desc=req.body.description;
   var price = req.body.price;
   var category = req.body.category;
   console.log('title:'+t+'; slug:'+s+';description:'+desc);

   const errors = req.validationErrors();

    if(errors) {
        Categories.find((err, category)=> {
           res.render('layouts/admin/add_products',{
               errors: errors,
               title: t,
               description: desc,
               categories: category,
               price: price
           });
        });
    }else {
        console.log('success');
        Products.findOne({ slug: s},(err, product)=> {
           if(product){ // se è gia esistente visualizza il prodotto esistente
               req.flash('danger','prodotto già inserito');
               category.find((err, category)=> {
                res.render('layouts/admin/add_products',{
                    title: t,
                    description: desc,
                    categories: category,
                    price: price2
                });
             });
           } else { // se non esiste lo inserisco nel database
            console.log('inserisco in db');
               var price2 = parseFloat(price).toFixed(2);
               const product = new Products({
                   title: t,
                   slug: s,
                   desc: desc,
                   price: price2,
                   category: category,
                   image: imageFile
               });

               product.save((err)=>{
                   if(err){
                     return console.log(err);
                   }
                   //creo le cartelle nella cartella images
                   mkdirp('public/images/'+product._id,(err)=>{
                     return console.log(err);
                   });
                   mkdirp('public/images/'+product._id+'/gallery',(err)=>{
                    return console.log(err);
                  });
                  mkdirp('public/images/'+product._id+'/gallery/thumbs',(err)=>{
                    return console.log(err);
                  });

                  if(imageFile != ""){
                      var productImage = req.files.image;
                      var path = "public/images/"+product._id+"/"+imageFile;
                      productImage.mv(path, function(err){
                          return console.log(err);
                      });
                  }


                   req.flash('succes','prodotto aggiunto');
                   res.redirect('/admin/products');
               });
           }
        });
    }


});

router.get('/edit_product/:id',(req,res)=>{
    var errors;

    //se ci sono errori in sessione
    if(req.session.errors)
        errors = req.session.errors;
    req.session.errors = null;

    Categories.find((err, categories)=> {
        
        Products.findById(req.params.id, (err, p)=>{
             if(err){
                 console.log(err);
                 res.redirect('/admin/products');
             }else{
                 var galleryDir = "public/images/"+p._id+"/";//directory con le immagini
                 var galleryImages = null;

                 fs.readdir(galleryDir, (err, files)=>{
                    if(err){
                        console.log(err);
                    }else{
                        galleryImages = files;

                        res.render('layouts/admin/edit_products',{
                            id: p._id,
                            title: p.title,
                            errors: errors,
                            description: p.desc,
                            categories: categories,
                            category: p.category.replace(/\s+/g,'-').toLowerCase(),
                            price: parseFloat(p.price).toFixed(),
                            image: p.image,
                            galleryImages: galleryImages
                        });
                    }
                 });
             }
        });

    });

});





module.exports = router;
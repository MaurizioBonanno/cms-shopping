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

//POST edit-product
router.post('/edit-products/:id',(req,res)=>{
            //prendo il nome dell'immagine questo è solo il nome e non l'immagine
            var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";// il nome dell'immagine

            req.checkBody('title','Il title non può essere nullo').notEmpty();
            req.checkBody('description','descrizione non può essere nullo').notEmpty();
            req.checkBody('price','Il prezzo non può essere nullo').notEmpty();
            req.checkBody('image','Devi uplodare un immagine').isImage(imageFile);

            var title= req.body.title;
            var slug=title.replace(/\s+/g, '-').toLowerCase();
            var desc=req.body.description;
            var price = req.body.price;
            var category = req.body.category;
            var pimage = req.body.pimage;
            
            var id= req.params.id;

            const errors = req.validationErrors();

            if(errors){
                req.session.errors = errors;
                res.redirect('/admin/products/edit-product/'+id);
            }else{
                //controlla che non ci sia lo stesso titolo presumo, controlla tutti gli slug con id differente da quello passato
                Products.findOne({slug: slug, _id:{'$ne':id}}, (err,p)=>{
                    if(err) console.log(err);

                    if(p){
                        req.flash('danger', 'Il titolo del prodotto è già esistente scegline un altro');
                        res.redirect('/admin/products/edit-product/'+id);
                    }else{ //se non c'è un altro slug uguale
                         Products.findById(id,(err,p)=>{ //recupero il prodotto
                            if(err)
                                console.log(err);
                            
                            p.title = title;
                            p.slug = slug;
                            p.description = desc;
                            p.price = parseFloat(price).toFixed(2);
                            p.categories = category;
                            if(imageFile != ""){
                                p.image = imageFile;
                            }

                            p.save((err)=>{
                                if(err)
                                    console.log(err);
                                
                                if(imageFile != ""){
                                    if(p.image !=""){//se esiste una vecchia immagine
                                        //rimuovo la vecchia immagine
                                        fs.remove('public/images/'+id+"/"+pimage, (err)=>{
                                            if(err)
                                                console.log(err);
                                        });
                                    }
                                    //recupero il file immagine
                                    var productImage = req.files.image;
                                    //stabilisco il percorso dove scriverlo
                                    var path = "public/images/"+id+"/"+imageFile;
                                    //metto il file immagine dentro la directory
                                    productImage.mv(path,(err)=>{
                                       return console.log(err);
                                    });

                                }

                                req.flash('succes','prodotto modificato correttamente');
                                res.redirect('/admin/products');
                            });
                         });
                    }

                });
            }
});




module.exports = router;
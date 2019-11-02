const express = require('express');
const router = express.Router();
const category = require('../models/category');


//GET categories index
router.get('/',(req,res)=>{
    category.find((err, categories)=>{
      if(err) return console.log(err);
        res.render('layouts/admin/categories', { categories: categories});
    });
});

//GET add-category
router.get('/add_category',(req,res)=>{
    const t="";
    const s="";
    res.render('layouts/admin/add_category', {
        title: t,
        slug: s,
    });
});

//POST add-category
router.post('/add_category',(req,res)=>{

    req.checkBody('title','Il title non può essere nullo').notEmpty();
    req.checkBody('slug','slug non può essere nullo').notEmpty();

    t= req.body.title;
    s=req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if(s=="") s = title.replace(/\s+/g, '-').toLowerCase();
    c=req.body.content;

    const errors = req.validationErrors();

    if(errors) {
        console.log(errors);
        res.render('layouts/admin/add_category', {
            errors: errors,
            title: t,
            slug: s
        });
    }else {
        console.log('success');
        category.findOne({ slug: s},(err, cats)=> {
           if(cats){ // se è gia esistente visualizza la pagina esistente
               req.flash('danger','categoria esistente');
               res.render('layouts/admin/add_category', {
                title: t,
                slug: s
                });
           } else { // se non esiste la inserisco nel database
               const cat = new category({
                   title: t,
                   slug: s
               });

               cat.save((err)=>{
                   if(err){
                     return console.log(err);
                   }

                   req.flash('succes','categoria aggiunta');
                   res.redirect('/admin/category');
               });
           }
        });
    };


});

//GET edit-category
router.get('/edit_category/:id',(req,res)=>{
    //recupero la pagina passata in argomento
    category.findById(
        req.params.id
    , (err,category)=>{
        //in caso di errore lo stampo in console
        if(err) return console.log(err);
       res.render('layouts/admin/edit_category', {
            title: category.title,
            slug: category.slug,
            id: category._id
          });
     });

});

//POST edit-category
router.post('/edit_category/:id',(req,res)=>{

    req.checkBody('title','Il title non può essere nullo').notEmpty();
    req.checkBody('slug','slug non può essere nullo').notEmpty();

//recupero i dati dalla form
    t= req.body.title;
    s=req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if(s=="") s = title.replace(/\s+/g, '-').toLowerCase();
    id= req.body.id;

    const errors = req.validationErrors();

    if(errors) {
        console.log(errors);
        res.render('layouts/admin/category', {
            errors: errors,
            title: t,
            slug: s
        });
    }else{
        console.log('success');
        category.findById(id,(err,cat)=>{
           if(err) return console.log(err);
           cat.title = t;
           cat.slug = s;
           cat.save((err)=>{
               if(err) return console.log(err);
               req.flash('success','category aggiornata correttamente');
               res.redirect('/admin/category');
           });
        });
    }

});

//GET delete-category
router.get('/delete-category/:id',(req,res)=>{
    //recupero la pagina passata in argomento
   category.findByIdAndRemove(req.params.id,(err)=>{
      if(err) return console.log(err);
      req.flash('success','Category cancellata correttamente');
      res.redirect('/admin/category');
   });

});

module.exports = router;
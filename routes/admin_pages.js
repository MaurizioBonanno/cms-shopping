var express = require('express');
var router = express.Router();

// Get Page model
var Page = require('../models/page');

//GET page index
router.get('/',(req,res)=>{
    Page.find({}).sort({ sorting: 1}).exec((err,pages)=>{
      res.render('layouts/admin/pages',{
          pages: pages
      });
    });
});

//GET add-page
router.get('/add_page',(req,res)=>{
    const t="";
    const s="";
    const c="";
    res.render('layouts/admin/add_page', {
        title: t,
        slug: s,
        content: c
    });
});

//reorder page
router.post('/reorder-pages',(req,res)=>{
    console.log('reorder-pages');
    console.log(req.body);

    var ids = req.body['id[]'];

    console.log('ids:',ids);

    var count = 0;

    for(var i=0;i<ids.length;i++){
        var id = ids[i];
        count++;
        //per evitare i problemi di asincronia devo wrappare il ciclo in una funzione
        //importante solo con il ciclo for non avrebbe funzionato avrebbe dato a entrambi lo stesso ordinamento
        ((count) => {
                    //recupero la page da mongo
        Page.findById(id,(err,page)=>{
          page.sorting = count;//do un nuvo ordinamento alla pagina
          page.save((err)=>{
              if(err){
                  return console.log(err);
              }
          });//salvo
        });
        })(count);//lancio la funzione con count

    }
});

//POST add-page
router.post('/add_page',(req,res)=>{

    req.checkBody('title','Il title non può essere nullo').notEmpty();
    req.checkBody('slug','slug non può essere nullo').notEmpty();
    req.checkBody('content','Il content non può essere nullo').notEmpty();

    t= req.body.title;
    s=req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if(s=="") s = title.replace(/\s+/g, '-').toLowerCase();
    c=req.body.content;

    const errors = req.validationErrors();

    if(errors) {
        console.log(errors);
        res.render('layouts/admin/add_page', {
            errors: errors,
            title: t,
            slug: s,
            content: c
        });
    }else {
        console.log('success');
        Page.findOne({ slug: s},(err, page)=> {
           if(page){ // se è gia esistente visualizza la pagina esistente
               req.flash('danger','pagina esistente');
               res.render('layouts/admin/add_page', {
                title: t,
                slug: s,
                content: c
                });
           } else { // se non esiste la inserisco nel database
               const page = new Page({
                   title: t,
                   slug: s,
                   content: c,
                   sorting: 100
               });

               page.save((err)=>{
                   if(err){
                     return console.log(err);
                   }

                   req.flash('succes','Pagina aggiunta');
                   res.redirect('/admin/pages');
               });
           }
        });
    };


});


//GET edit-page
router.get('/edit_page/:slug',(req,res)=>{
    //recupero la pagina passata in argomento
    Page.findOne({
        slug: req.params.slug
    }, (err,page)=>{
        //in caso di errore lo stampo in console
        if(err) return console.log(err);
       res.render('layouts/admin/edit_page', {
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
          });
     });

});

//POST edit-page
router.post('/edit_page/:slug',(req,res)=>{

    req.checkBody('title','Il title non può essere nullo').notEmpty();
    req.checkBody('slug','slug non può essere nullo').notEmpty();
    req.checkBody('content','Il content non può essere nullo').notEmpty();
//recupero i dati dalla form
    t= req.body.title;
    s=req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if(s=="") s = title.replace(/\s+/g, '-').toLowerCase();
    c=req.body.content;
    id= req.body.id;

    const errors = req.validationErrors();

    if(errors) {
        console.log(errors);
        res.render('layouts/admin/add_page', {
            errors: errors,
            title: t,
            slug: s,
            content: c
        });
    }else{
        console.log('success');
        Page.findById(id,(err,page)=>{
           if(err) return console.log(err);
           page.title = t;
           page.slug = s;
           page.content = c;
           page.save((err)=>{
               if(err) return console.log(err);
               req.flash('success','pagina aggiornata correttamente');
               res.redirect('/admin/pages');
           });
        });
    }

});

//GET delete-page
router.get('/delete-page/:id',(req,res)=>{
    //recupero la pagina passata in argomento
   Page.findByIdAndRemove(req.params.id,(err)=>{
      if(err) return console.log(err);
      req.flash('success','pagina cancellata correttamente');
      res.redirect('/admin/pages');
   });

});



module.exports = router;


$(()=>{
    console.log('caricata la pagina in main');
    if($('textarea#ta').length){
        CKEDITOR.replace('ta');
    }

    $('a.confirmDeletion').click(function (e) { 
        if(!confirm('Vuoi Davvero cancellare questo elemento?')){
            return false;
        }
    });
});
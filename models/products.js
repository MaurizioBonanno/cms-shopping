const mongoose = require('mongoose');

//schema products

const ProductsSchema = mongoose.Schema({

    title: {
        type: String,
        required: true
    },
    slug: {
        type: String
    },
    desc: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
       type: String
    }

});

const Products = module.exports = mongoose.model('Products',ProductsSchema); 
const mongoose = require('mongoose');
var validator = require("email-validator");

var productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'This field is required'

    },
    price: {
        type: String,
        required: 'This field is required'

    },
    stock: {
        type: String,
        required: 'This field is required'

    },
    picture: {
        type: Object,
        required: 'This field is required'

    }
})

mongoose.model('products', productSchema);
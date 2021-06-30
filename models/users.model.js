const mongoose = require('mongoose');
var validator = require("email-validator");

var userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'This field is required'
    },
    email: {
        type: String,
        required: 'This field is required'
    },
    pass: {
        type: String,
        required: 'This field is required'
    },
    id: {
        type: String,
        required: 'This field is required'
    }
})

userSchema.path('email').validate((val) => {
    return validator.validate(val);
}, 'Invalid Email');

mongoose.model('users', userSchema);
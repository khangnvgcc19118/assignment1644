const mongoose = require('mongoose');
const url = "mongodb+srv://khangnv:7cRxf6BOJ8Yu7mQl@khangnvgcc19118.e9ofe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
mongoose.connect(url, { useNewUrlParser: true }, (err) => {
    if (!err) { console.log("Connected with MongoDB Database"); }
    else {
        console.log("An Error Occured, Please try again!");
    }
})

require('./users.model');
require('./products.model');
require('./key.model');

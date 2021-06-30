const multer = require('multer');
const express = require('express');
const path = require('path');
const expresshdb = require('express-handlebars');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const router = express.Router();
const app = express();
const Product = mongoose.model('products');

function isAdmin(req, res) {
    if (!req.cookies.auth || !req.cookies.name || !req.cookies.res) {
        return false;
    }
    return true;
}
app.use(bodyParser.urlencoded({ extended: true }));


let diskStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "./public/img");
    },
    filename: (req, file, callback) => {
        let filename = `${Date.now()}`;
        callback(null, filename);
    }
});

let uploadFile = multer({ storage: diskStorage });
router.get('/add', (req, res) => {
    if (!isAdmin(req, res)) res.redirect('/users/signin');
    res.render('addOrEditproduct', {
        loginCSS: "/stylesheets/loginform.css",
        viewTitle: "Add Product"
    });
})

router.get('/', (req, res) => {
    if (!isAdmin(req, res)) res.redirect('/users/signin');
    if (req.query.qr) {
        let nameq = req.query.qr;
        Product.find({ name: nameq }, (err, docs) => {
            if (!err) {
                res.render('manage', {
                    bootstrapCSS: "/stylesheets/bootstrap.css",
                    mainCSS: "/stylesheets/main.css",
                    bootstrap3: "https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css",
                    awesome: "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
                    list: docs
                })
            }
        })
    } else {
        Product.find((err, docs) => {
            if (!err) {
                res.render('manage', {
                    bootstrapCSS: "/stylesheets/bootstrap.css",
                    mainCSS: "/stylesheets/main.css",
                    bootstrap3: "https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css",
                    awesome: "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
                    list: docs
                })
            }
        })
    }
})

router.get('/update/:id', (req, res) => {
    if (!isAdmin(req, res)) res.redirect('/users/signin');
    Product.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.render("addOrEditproduct", {
                viewTitle: "Update Product",
                loginCSS: "/stylesheets/loginform.css",
                product: doc
            })
        }
    })
})
router.get("/delete/:id", (req, res) => {
    if (!isAdmin(req, res)) res.redirect('/users/signin');
    Product.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) {
            res.redirect('/manage');
        } else {
            console.log(`An error occured during the delete process` + err);
            res.redirect('/manage');
        }
    })
});


router.post("/", uploadFile.single('image'), (req, res) => {
    if (!isAdmin(req, res)) res.redirect('/users/signin');
    if (req.body._id == "") {
        console.log(req.file);
        insertRecord(req, res);
    } else {
        updateRecord(req, res);
    }
});


function insertRecord(req, res) {
    if (!isAdmin(req, res)) res.redirect('/users/signin');
    var product = new Product();
    product.name = req.body.name;
    product.price = req.body.price;
    product.stock = req.body.stock;
    const file = req.file;
    product.picture = req.file;
    if (!file) {
        res.render('addOrEditproduct', {
            viewTitle: 'Add Product',
            loginCSS: "/stylesheets/loginform.css",
            product: req.body,
            notification: `Error occurred during data insertion (Picture cannot upload)`,
        });
        return;
    }
    product.save((err, data) => {
        if (!err) {
            res.redirect("/manage");
        } else {
            res.render('addOrEditproduct', {
                viewTitle: 'Add Product',
                loginCSS: "/stylesheets/loginform.css",
                product: req.body,
                notification: `Error occurred during data insertion: ${err}`,
            });
            return;
        }
    });
}
function updateRecord(req, res) {
    if (!isAdmin(req, res)) res.redirect('/users/signin'); //req.body, { new: true }
    Product.findByIdAndUpdate({ _id: req.body._id }, { name: req.body.name, price: req.body.price, stock: req.body.stock, picture: req.file }, (err, doc) => {
        if (!err) {
            res.redirect('/manage');
        } else {
            res.render('addOrEditproduct', {
                viewTitle: 'Update Product',
                product: req.body,
                notification: `Error occurred during data insertion ${err}`,
            });
        }
    });
}

module.exports = router;
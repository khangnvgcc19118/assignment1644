const expresshdb = require('express-handlebars');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const router = express.Router();
const app = express();
const Users = mongoose.model('users');
const crypto = require('crypto');


router.get('/signin', (req, res) => {
    res.render('signin', {
        loginCSS: "/stylesheets/loginform.css",

    });
})
router.get('/', (req, res) => {
    res.redirect('/users/signin');
})
router.get('/forgotpass', (req, res) => {
    res.redirect('/users/signin');
})
router.get('/signup', (req, res) => {
    res.render('signup', {
        loginCSS: "/stylesheets/loginform.css",
    });
})
router.post("/", (req, res) => {
    if (req.body.repass) {
        return insertRecord(req, res);
    } else {
        return signin(req, res);
    }
})
function signin(req, res) {
    var user = {};
    user.email = req.body.email;
    user.pass = req.body.pass;
    user.pass = crypto.createHash('md5').update(user.pass).digest('hex');
    Users.findOne({ email: user.email, pass: user.pass }, function (err, result) {
        if (err) {
            console.log(err);
        } else if (result) {
            console.log('Found:', result);
            res.cookie("auth", `${result.email}`, { expires: new Date(Date.now() + 9000000) });
            res.cookie("name", `${result.name}`, { expires: new Date(Date.now() + 9000000) });
            res.cookie("res", `${result.pass}`, { expires: new Date(Date.now() + 9000000) });
            res.redirect("./manage");
            return;
        } else {
            res.render("signin", {
                changeHeight: "height: 300px;",
                notification: "Incorrect email or password",
                loginCSS: "/stylesheets/loginform.css",
            });
            return;
        }
    });
}
router.get('/list', (req, res) => {
    Users.find((err, docs) => {
        if (!err) {
            res.render("list", {
                list: docs
            })
        }
        else res.send("Error Ocuured");
        return;
    })
})
function insertRecord(req, res) {
    const atnIdDefault = "GCC-19118-XMCVH-98764-TYUPK-7U8IGH";
    var user = new Users();
    user.name = req.body.name;
    user.id = req.body.atnID;
    if (user.id != atnIdDefault) {
        res.redirect('/users/signup');
        return;
    }
    user.email = req.body.email;
    user.pass = req.body.pass;
    var repass = req.body.repass;
    if (user.pass == repass) {
        user.pass = crypto.createHash('md5').update(repass).digest('hex');
        repass = user.pass;
    }
    user.save((err, doc) => {
        if (!err) {
            res.redirect('/users/signin');
            return;
        }
        else {
            if (err.name == "ValidationError") {
                handleValidationError(err, req.body);
                res.redirect("/users/signup");
            }
            console.log("Error occured during record insertion" + err);
            return;
        }
    })
}
function handleValidationError(err, body) {
    for (field in err.errors) {
        switch (err.errors[field].path) {
            case 'email':
                body['emailError'] = err.errors[field].message;
                break;

            default:
                break;
        }
    }
}
module.exports = router;

const expresshdb = require('express-handlebars');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const router = express.Router();
const app = express();
const Users = mongoose.model('users');
const Key = mongoose.model('key');
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
        changeHeight: "height: 400px;",
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
            res.cookie("auth", `${result.email}`, { expires: new Date(Date.now() + 99000000) });
            res.cookie("name", `${result.name}`, { expires: new Date(Date.now() + 99000000) });
            res.cookie("res", `${result.pass}`, { expires: new Date(Date.now() + 99000000) });
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
    if (!req.cookies.auth || !req.cookies.name || !req.cookies.res) {
        res.redirect('/users/signin');
        return;
    }
    Users.find((err, docs) => {
        if (!err) {
            res.render("list", {
                list: docs
            })
        }
        else res.send("Error Ocuured");
        return;
    })
});
async function insertRecord(req, res) {
    var user = new Users();
    user.name = req.body.name;
    user.id = req.body.atnID;
    user.email = req.body.email;
    user.pass = req.body.pass;
    var repass = req.body.repass;
    var b = false;
    Users.findOne({ email: user.email }, function (err, result) {
        if (err) {
            res.render('signup', {
                loginCSS: "/stylesheets/loginform.css",
                user: req.body,
                notification: "Email is used!",
                changeHeight: "height: 450px;",
            });
        } else if (result) {
            res.render('signup', {
                loginCSS: "/stylesheets/loginform.css",
                user: req.body,
                notification: "Email is used!",
                changeHeight: "height: 450px;",
            });
        } else {
            Key.findOne({ key: user.id }, function (err, result) {
                if (err) {
                    res.render('signup', {
                        loginCSS: "/stylesheets/loginform.css",
                        user: req.body,
                        notification: "Contact with IT department to get your ATN-ID!",
                        changeHeight: "height: 450px;",
                    });
                    return;
                } else if (result) {
                    if (result.valid == 1) {
                        if (user.pass == repass) {
                            user.pass = crypto.createHash('md5').update(repass).digest('hex');
                            repass = user.pass;
                            user.save((err, doc) => {
                                if (!err) {
                                    Key.findOneAndUpdate({ key: user.id }, { valid: 0 }, (err, doc) => {
                                        if (err) console.log(err);
                                        else console.log(`Update ${doc.key}: valid => ${doc.valid}`);
                                    })
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
                        else {
                            res.render('signup', {
                                loginCSS: "/stylesheets/loginform.css",
                                user: req.body,
                                notification: "Password and repassword are not the same!",
                                changeHeight: "height: 450px;",
                            });
                            return;
                        }
                    }
                    else {
                        res.render('signup', {
                            loginCSS: "/stylesheets/loginform.css",
                            user: req.body,
                            notification: "This ATN-ID is used by other email, please signin!",
                            changeHeight: "height: 450px;",
                        });
                    }

                } else {
                    res.render('signup', {
                        loginCSS: "/stylesheets/loginform.css",
                        user: req.body,
                        notification: "Contact with IT department to get your ATN-ID!",
                        changeHeight: "height: 450px;",
                    });
                    return;
                }
            });
        }
    });
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
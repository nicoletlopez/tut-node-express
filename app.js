const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require("express-session");
const expressMessages = require('express-messages');

mongoose.connect('mongodb://localhost/nodekb');
let db = mongoose.connection;

// Check connection
db.once('open', () => {
    console.log('Connected to MongoDB');
})

//Check for DB errors
db.on('error', (err) => {
    console.log(err);
});

// Init App
const app = express();

// Bring in Models
let Article = require('./models/article');

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug')

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')))

// Express Session Middleware
app.use(session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
}));

// Express Messages Middleware
app.use(flash());
app.use(function (req, res, next) {
    res.locals.messages = expressMessages(req, res);
    next();
});

//Express Validator Middleware
// app.use(expressValidator({
//     errorFormatter: function (param, msg, value) {
//         var namespace = param.split('.')
//             , root = namespace.shift()
//             , formParam = root;

//         while (namespace.length) {
//             formParam += '[' + namespace.shift() + ']';
//         }

//         return {
//             param: formParam,
//             msg: msg,
//             value: value,
//         }
//     }
// }))

// Home Route
app.get('/', (req, res) => {
    Article.find({}, (err, articles) => {
        if (err) {
            console.log(err);
        } else {
            res.render('index', {
                title: 'Articles',
                articles: articles,
            });
        }
    });
});

// Get Single Article
app.get('/article/:id', (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        res.render('article', {
            article: article,
        })
    });
});

// Add Route
app.get('/articles/add', (req, res) => {
    res.render('add_article', {
        title: 'Add Articles'
    });
});


// Add Submit POST Route
app.post('/articles/add', (req, res) => {
    let article = new Article();
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    article.save((err) => {
        if (err) {
            console.log(err);
            return
        } else {
            res.redirect('/');
        }
    });
})

// Load Edit Form
app.get('/article/edit/:id', (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        res.render('edit_article', {
            title: 'Edit Aricle',
            article: article,
        })
    });
});

// Update Submit
app.post('/articles/edit/:id', (req, res) => {
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = { _id: req.params.id };

    Article.update(query, article, (err) => {
        if (err) {
            console.log(err);
            return
        } else {
            res.redirect('/');
        }
    });
})

app.delete('/article/:id', (req, res) => {
    let query = { _id: req.params.id };

    Article.remove(query, (err) => {
        if (err) {
            console.log(err);
        }

        res.send('Success');
    })
})

// Start Server
app.listen(3000, () => {
    console.log('Server started on port 3000...');
});

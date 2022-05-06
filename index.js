const express = require('express');
var cors = require('cors');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var session = require('express-session');
var SQLiteStore = require('connect-sqlite3')(session);
/* use a store to separate modules */
const { store } = require('./data_access/store');

const app = express();

const port = process.env.PORT || 4002;

//middlewares
app.use(cors({
    origin: "https://jnhenkel.github.io",
    credentials: true
}));
app.use(express.json());


app.use((request, response, next) => {
    console.log(`request url: ${request.url}`);
    console.log(`request method: ${request.method}`);
    //only for development. Remove the next two lines when you deploy your final version.
    console.log(`request body:`);
    console.log(request.body);
    next();
})

passport.use(
    new LocalStrategy({ usernameField: 'email' }, function verify(username, password, cb) {
        store.login(username, password)
            .then(x => {
                if (x.valid) {
                    return cb(null, x.user);
                } else {
                    return cb(null, false, { message: 'Incorrect username or password.' });
                }
            })
            .catch(e => {
                console.log(e);
                cb('Somethign went wrong!');
            });

    }));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({ db: 'sessions.db', dir: './sessions' })
}));
app.use(passport.authenticate('session'));

passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, { id: user.id, username: user.username });
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});

//default root
app.get('/', (req, res) => {
    res.status(200).json({ done: true, message: 'This is the backend for imagequiz 2' })
});

//1
app.post('/register', (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password; /* store will handle encryption */
    store.addCustomer(name, email, password)
        .then(x => {
            //console.log(x);
            res.status(200).json({ done: true, message: 'A customer has been added successfully' })
        })
        .catch(e => {
            console.log(e);
            res.status(500).json({ done: false, message: 'Customer not added due to an error.' });
        });

});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/login/succeeded',
    failureRedirect: '/login/failed'
}));
app.get('/login/succeeded', (request, response) => {
    response.status(200).json({ done: true, message: 'The customer logged in successfully.' });
});

app.get('/login/failed', (request, response) => {
    response.status(401).json({ done: false, message: 'The credentials are not valid.' });
});

//3
app.get('/flowers', (req, res) => {
    store.getFlowers()
        .then(x => {
            console.log(x.rows);
            res.status(200).json({ done: true, result: x.rows, message: 'These are the flowers from flowers.js going through the api' });
        })

});

//4
app.get('/quiz/:name', (req, res) => {
    //stop users from accessing quiz if not logged in
    if (!req.isAuthenticated()) {
        res.status(401).json({done: false, message: 'Please sign in first.'})
    }
    let quizName = req.params.name;
    //res.status(200).json({done: true, result: quizzes[Name], message: 'Here is the quiz'});
    store.getQuiz(quizName)
        .then(x => {
            if (x.id) {
                res.status(200).json({ done: true, result: x });
            } else {
                res.status(404).json({ done: false, message: x.message });
            }
        })
        .catch(e => {
            console.log(e);
            res.status(500).json({ done: false, message: 'Something went wrong.' });
        })
});

//5
app.post('/score', (req, res) => {
    let quizTaker = req.body.quizTaker;
    let quizName = req.body.quizName;
    let score = req.body.score;
    let date = new Date();
    date = date.toDateString();

    store.addScore(quizTaker, quizName, score, date)
    res.status(200).json({ done: true, message: 'score added' });

});

//6
app.get('/scores/:quiztaker/:quizid', (req, res) => {
    let quizTaker = req.params.quiztaker;
    let quizId = req.params.quizid;
   
    store.getScore(quizTaker, quizId)
        .then(x => {
           
            if (x.rows.length > 0) {
                res.status(200).json({ done: true, result: x.rows, message: 'The score was found' });
            } else {
                res.status(404).json({ done: false, result: undefined, message: 'The score was not found' });
            }
        })
})

app.listen(port, () => {
    console.log(`listening on ${port}`);
});

app.post('/logout', (req,res) => {
    req.logout();
    res.redirect('/');
});

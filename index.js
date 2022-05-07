//dependencies
const express = require('express');
var cors = require('cors');
const { store } = require('./data_access/store');


const application = express();
const port = process.env.PORT || 4000 ;

// middlewares
application.use(cors());
application.use(express.json());


// methods
application.get('/', (request, response) => {
    response.status(200).json({ done: true, message: 'Hey! Welcome to hello world backend API!' });
});

// register
application.post('/register', (request, response) => {
    let name = request.body.name;
    let email = request.body.email;
    let password = request.body.password;
    console.log("========== Test =============")
    console.log("=========="+ name +"=============")
    console.log("========== Test =============")
    store.addCustomer(name, email, password)
    .then(x => response.status(200).json({ done: true, message: 'The customer was added successfully!' }))
    .catch(e => {
        console.log(e);
        response.status(500).json({done: false, message: 'The customer was not added due to an error.'});
    });
    
});

// login
application.post('/login', (request, response) => {
    let email = request.body.email;
    let password = request.body.password;
    store.login(email, password)
    .then(x => {
        if(x.valid) {
            response.status(200).json({ done: true, message: 'The customer logged in successfully!' });
        } else {
            response.status(401).json({ done: false, message: x.message });
        }
    })
    .catch(e => {
        console.log(e);
        response.status(500).json({done: false, message: 'Something went wrong.'});
    });
    
});

// flowers
application.get('/flowers', (request, response) =>{
	store.getFlowers()
	.then( x => {
		if (x.result){
			response.status(200).json({ done: true, result: x.result, message: 'Get the flowers successfully!' });
		}else{
			response.status(401).json({ done: false, message: 'Something went wrong as getting the flowers!'});	
		}

	})
	.catch(e => {
		console.log('///////// Errors in /flowers /////////');
		response.status(500).json({done: false, message: 'Something went wrong in getFlowers().'});
	})

});

// /quiz/:id 
application.get('/quiz/:name', (request, response) => {
    let name = request.params.name;
    store.getQuiz(name)
    .then(x => {
       if(x.id) {
        response.status(200).json({ done: true, result: x });
       } else {
        response.status(404).json({ done: false, message: result.message });
       }
    })
    .catch(e => {
        console.log(e);
        response.status(500).json({done: false, message: 'Something went wrong.'});
    })    
});


application.post('/score', (request, response) => {
    let quizTaker = request.body.quizTaker;
    let quizName  = request.body.quizName;
    let scores    = request.body.scores;
    console.log('====== in /score =======');
    console.log(request.body);

    store.addScore(quizTaker, quizName, scores)
    .then(x => {

    })
    .catch(e =>{
        console.log(e);
        response.status(500).json({done: false, message: 'Something went wrong in post score.'});
    })



});
// /scores/:quiztaker/:quizname
// application.get('/scores/:quiztaker/:quizname', (request, response) => {
//     let quizTaker = request.params.quiztaker;
//     let quizName = request.params.quizName;
//     let scores = store.getScores(quizTaker, quizName);
//     response.status(200).json({ done: true, result: scores });
    
// });





application.listen(port, () => {
    console.log(`Listening to the port ${port} `);
})
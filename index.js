const express = require('express');
const {store} = require('./temp_store/store');
const flowers = require('./temp_store/flowers');

const application = express();
const port = process.env.PORT || 4000;
//const port = 4000;
var cors = require('cors');

//middlewares
application.use(express.json());
application.use(cors());

application.get('/', (request, response)=>{

	// send the json string to client side 
	response.status(200).json({done: true, message:'Fine!'});
//	response.status(200).json({done: true, result: flowers, message:"Get the flowers successfully!"});
})


application.post('/register', (request, response) => {
    let name     = request.body.name;
    let email    = request.body.email;
    let password = request.body.password;   
   
    store.addCustomer(name, email, password);
    response.status(200).json({done: true, message: 'The customer was added successfully!'});
});

application.post('/login', (request, response) => {
	let name     = request.body.name;
	let email    = request.body.email;
	let password = request.body.password;

	let result   = store.login(name, email, password);

	console.log("In Login")

	if (result.valid){
		response.status(200).json({done: true, message:result.message});
	}else{
		response.status(401).json({done: false, message:result.message});
	}
})

application.get('/flowers', (request, response) => {
	//console.log(flowers);
	console.log("In flowers")
	console.log(flowers)
	response.status(200).json({done: true, result: flowers, message:"Get the flowers successfully!"});

})

application.get('/quiz/:id', (request, response) => {
	let flowerId = request.params.id;
	let result = store.getQuiz(flowerId);
	if (result.done){
		response.status(200).json({done: true, result: result.quiz});
	}else{
		response.status(404).json({done: false, message: result.message});
	}
})


application.post('/score', (request, response) => {
	//var today = new Date();
	//console.log(today)
	console.log("i====n post====")
	let quizTaker = request.body.quizTaker;
	//let quizId	  = request.body.quizId;
	let quizName  = request.body.quizName;
	let score 	  = request.body.score;
	//let date 	  = request.body.date;

	console.log(request.body)

//	store.addScore(quizTaker, quizId, score, date)
	store.addScore(quizTaker, quizName, score)
	response.status(200).json({done: true, message: 'The score was added successfully!'});
})

application.get('/scores/:quiztaker/:quizname', (request, response) => {
	let quizTaker = request.params.quiztaker;
	let quizName    = request.params.quizname;

	let result    = store.findScore(quizTaker, quizName);
	if (result.done){
		response.status(200).json({done: true, result:result.score, message: result.message});
	}else{
		//console.log(result.score)
		response.status(404).json({done: false, result:"undefined", message: result.message});
	}
})




application.listen(port, ()=>{
	console.log(`Listening to the port ${port}`)

});
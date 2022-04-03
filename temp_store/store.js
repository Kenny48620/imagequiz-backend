const bcrypt    = require('bcrypt');
let {customers} = require('./customers');
let {quizzes}   = require('./data');
let {scores}	= require('./scores')



let store = {

	addCustomer: (name, email, password) =>{	
		var saltRounds = 10;
		var hash = bcrypt.hashSync(password, saltRounds);

//		console.log("password:" + password)
//		console.log("hash:" + hash)
        customers.push({id: 1, name: name, email: email, password: hash});
	},

	login: (name, email, password) =>{
		var customer = customers.find(each => each.email.toLowerCase() === email.toLowerCase());

		console.log(customer)

		if (customer){
			let valid =  bcrypt.compareSync(password, customer.password);
			if (valid){
				return {valid:true, message:"Login successfully"};
			}
			return {valid: false, message: 'Credentials are not valid.'};
		}
		return {valid:false, message:"Email not found!"};
	},

	getQuiz: (id) =>{	
		let quiz = quizzes.find(each => each.name.toLowerCase() === id.toLowerCase());

		if (quiz){
			return {done: true, quiz:quiz};
		}else{
			return {done: false, message:'No quiz with this name was found.'};
		}


	},
	//addScore: (quizTaker, quizId, score, date)
	addScore: (quizTaker, quizName, score) =>{
		console.log("In addScore()");
		//scores.push({quizTaker: quizTaker, quizId: quizId, score: score, date:date});
		scores.push({quizTaker: quizTaker, quizName: quizName, score: score});
		console.log(scores);
	},

	findScore: (quizTaker, quizId) =>{
		let score = scores.find(each => each.quizTaker.toLowerCase() === quizTaker.toLowerCase());

		if (score){
			return {done: true, score: score.score, message:"Got the score successfully!"};
		}else{
			return {done: false, score: score, message:"Cannot find the quizTaker and the score !"};
		}
	}
}



module.exports = { store }
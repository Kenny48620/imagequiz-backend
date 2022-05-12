const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();
let { quizzes } = require('../temp_store/data');
const flowers = require('../temp_store/flowers');

const connectionString =
    `postgres://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.HOST}:${process.env.DATABASEPORT}/${process.env.DATABASE}`;


console.log(connectionString);
const connection = {
    connectionString: process.env.DATABASE_URL ? process.env.DATABASE_URL : connectionString,
    ssl: { rejectUnauthorized: false }
}
const pool = new Pool(connection);


let store = {

    addCustomer: (name, email, password) => {
        const hash = bcrypt.hashSync(password, 10);
        return pool.query('insert into imagequiz.customer (name, email, password) values ($1 , $2, $3)', [name, email, hash]);
        //customers.push({id: 1, name: name, email: email, password: hash});
    },

    login: (email, password) => {
        return pool.query('select name, email, password from imagequiz.customer where email = $1', [email])
            .then(x => {
                if (x.rows.length == 1) {
                    let valid = bcrypt.compareSync(password, x.rows[0].password);
                    if (valid) {
                        return { valid: true };
                    } else {
                        return { valid: false, message: 'Credentials are not valid.' }
                    }
                } else {
                    return { valid: false, message: 'Email not found.' }
                }
            });

    },

    getFlowers: ()=>{

    	let sql = 'select * from imagequiz.flower';
  
    	return pool.query(sql)
    		.then(x =>{
    				// if (x.rows.length == 0){
    				// 	console.log('hit');
    				// 	console.log('Start to loop flowers');
    				// 	flowers.flowers.map((each, index) => {
    				// 		//console.log('index'+index);
    				// 		//console.log('name'+each.name);
    				// 		let qid = index;
    				// 		let name = each.name;
    				// 		let picture = each.picture;
    				// 		pool.query(`insert into imagequiz.flowers (name, picture) values ($1, $2)`, [name, picture]);
    				// 	})
    				// //	let sql2 = "insert into imagequiz.flowers (qid, name, picture) values (1, 'Acacia','https://habahram.blob.core.windows.net/flowers/acacia.jpg' )";
    				// //	pool.query(sql2);
    				// }


    				if (x.rows.length > 0){
    			//		console.log(x.rows.length);
    					console.log(x.rows);
    					return {result:x.rows};
    				}
    			//	console.log(flowers.flowers)
    			//	console.log(x);
    				
    			
    		});
    },

    getQuiz: (name) => {
        let sqlQuery = `select q.id as quiz_id, q2.*  from imagequiz.quiz q join imagequiz.quiz_question qq on q.id = qq.quiz_id 
        join imagequiz.question q2 on qq.question_id = q2.id 
        where lower(q.name) =  $1`;
        return pool.query(sqlQuery, [name.toLowerCase()])
            .then(x => {
                //console.log(x);
                let quiz = {};
                if (x.rows.length > 0) {
                    quiz = {
                        id: x.rows[0].quiz_id,
                        questions: x.rows.map(y => {
                            return { id: y.id, picture: y.picture, choices: y.choices, answer: y.answer }
                        })
                    };
                }
                return quiz;
            });
    },

    addScore:(quizTaker, quizName, scores) =>{
    	

    	// return pool.query(`insert into imagequiz.quiz`.[quizTaker, quizName, scores])
    	// 	.then()
        return pool.query('select * from imagequiz.flowers');

    },

    getScores: () => {
        return scores;
    },
    insertQuestion: () => {
        let result = [];
        for (id in quizzes) {
            for (el of quizzes[id].questions) {
                result.push([el.picture, el.choices.join(','), el.answer])
            }
        }
        return pool.query(format('insert into imagequiz.question (picture, choices, answer) values %L',result), [], (err, result2) =>{
            console.log(err);
            console.log(result2);
        })
        //return pool.query('insert into imagequiz.question (picture, choices, answer) values ($1,$2,$3),($4,$5,$6),($7,$8,$9),($10,$11,$12),($13,$14,$15),($16,$17,$18),($19,$20,$21),($22,$23,$24),($25,$26,$27),($28,$29,$30),($31,$32,$33),($34,$35,$36),($37,$38,$39),($40,$41,$42),($43,$44,$45),($46,$47,$48),($49,$50,$51),($52,$53,$54),($55,$56,$57),($58,$59,$60),($61,$62,$63),($64,$65,$66),($67,$68,$69),($70,$71,$72),($73,$74,$75),($76,$77,$78),($79,$80,$81),($82,$83,$84),($85,$86,$87),($88,$89,$90),($91,$92,$93),($94,$95,$96),($97,$98,$99),($100,$101,$102),($103,$104,$105),($106,$107,$108),($109,$110,$111),($112,$113,$114),($115,$116,$117),($118,$119,$120),($121,$122,$123),($124,$125,$126),($127,$128,$129),($130,$131,$132),($133,$134,$135),($136,$137,$138),($139,$140,$141),($142,$143,$144),($145,$146,$147),($148,$149,$150),($151,$152,$153),($154,$155,$156),($157,$158,$159),($160,$161,$162)', result)
        //note my attempt was rough but using format from pg package works better
        //var format = require('pg-format'); //this is required to use pg format()
    }

}

module.exports = { store }
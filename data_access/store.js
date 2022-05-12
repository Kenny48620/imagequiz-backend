const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();
let { quizzes } = require('../temp_store/data');
//const flowers = require('../temp_store/flowers');

var format = require('pg-format');

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
        return pool.query('INSERT INTO imagequiz.customer (name, email, password) VALUES ($1, $2, $3)', [name, email, hash]);
    },

    login: (email, password) => {
        return pool.query('SELECT id, name, email, password FROM imagequiz.customer WHERE email = $1', [email])
            .then(x => {
                if (x.rows.length == 1) {
                    let valid = bcrypt.compareSync(password, x.rows[0].password);
                    if (valid) {
                        return { valid: true, user: {id: x.rows[0].id, username: x.rows[0].email}};
                    } else {
                        return { valid: false, message: 'Credentials are not valid.' };
                    }
                } else {
                    return { valid: false, message: 'Email not found.' };
                }
            });
    },

    getQuiz: (quizName) => {
        let query = `
        select q1.id as quiz_id, q3.* from imagequiz.quiz as q1 
        join imagequiz.quiz_question as q2 on q1.id = q2.quiz_id
        join imagequiz.question q3 on q2.question_id = q3.id 
        where lower(q1.name) = $1`;
        return pool.query(query, [quizName.toLowerCase()])
            .then(x => {
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
    
    
    postScore: (quizTaker, quizName, score, date) => {
        let idQuery = `select c.id as customer_id from imagequiz.customer c where c.email = $1`;
        //let customer_id;
        pool.query(idQuery, [quizTaker])
            //getCustomerId(quizTaker)
            .then(x => {
                if (x.rows.length > 0) {
                let customer_id = x.rows[0].customer_id;
                let quizIdQuery = `select q.id as quiz_id from imagequiz.quiz q where lower(q.name) = $1`;
                //let quiz_id;
                pool.query(quizIdQuery, [quizName.toLowerCase()])
                    //getQuizId(quizName)
                    .then(y => {
                        //if (y.rows.length > 0) {
                        let quiz_id = y.rows[0].quiz_id;
                        let query = `
                                    insert into imagequiz.score (customer_id, quiz_id, date, score)
                                    values ($1, $2, $3, $4)`;
                        return pool.query(`insert into imagequiz.score (customer_id, quiz_id, date, score) values ($1, $2, $3, $4)`, [Number(customer_id), Number(quiz_id), date, score])
                    })
                    .catch(e => {
                        console.log(e);
                        //return undefined;
                    })
                } else {
                    console.log('customer not in database');
                    return {done: false, message: 'customer not in database'};
                }
            })
            .catch(e => {
                console.log(e);
                return undefined;
            })
    }, 

    getScore: (quizTaker, quizId) => {
        let query = `
        select s.score from imagequiz.customer c
        join imagequiz.score s on s.customer_id = c.id
        join imagequiz.quiz q on q.id = s.quiz_id
        where c.email = $1 
        and lower(q.name) = $2`;
        return pool.query(query, [quizTaker, quizId.toLowerCase()])
       
    },

    getFlowers: () => {
        let query = `
        select f.name, f.picture from imagequiz.flower f`;
        return pool.query(query, [])
    }

}

module.exports = { store };
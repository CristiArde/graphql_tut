/**
 * Created by Cristi Arde on 8/18/2019.
 */

const express = require('express');
const bodyParser = require('body-parser');
const graphQLHttp = require('express-graphql');
//modern javascript called object desctructuring
//with this i can pull out actuall properties that i need from the package(right hand side)
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/event');
const User = require('./models/user');


const app = express();

const events = [];

app.use(bodyParser.json());

//explanation
//https://www.youtube.com/watch?v=LXTyzk2uud0&list=PL55RiY5tL51rG1x02Yyj93iypUuHYXcB_&index=4&t=520s
//defining graph ql standards
app.use('/graphql',
    graphQLHttp({
        schema: buildSchema(`
            type Event {
                _id: ID!
                title: String!
                description: String!
                price: Float!
                date: String!
            }
            
            type User {
                _id: ID!
                email: String!
                password: String
            }
            
            input UserInput {
                email: String!
                password: String!
            }
            
            input EventInput {
                title: String!
                description: String!
                price: Float!
                date: String!
            }
            
            type RootQuery {
                events: [Event!]!
            }

            type RootMutation {
                createEvent(eventInput: EventInput): Event        
                createUser(userInput: UserInput): User
            }
        
            schema {
                query: RootQuery
                mutation: RootMutation
            }
        `),
        //resolvers that need to match the schemas by name
        //find retuns all
        rootValue: {
            events: () => {
                return Event.find()
                    .then(events => {
                         return events.map(event => {
                            return { ...event._doc, _id: event._doc._id.toString() };
                         });
                    })
                    .catch( err => {
                        throw  err;
                    });
            },
//using the Event model to create new events and save it to db
            createEvent: (args) => {
                const event = new Event({
                    title: args.eventInput.title,
                    description: args.eventInput.description,
                    price: +args.eventInput.price,
                    date: new Date(args.eventInput.date),
                    creator: '5d76b769321ecb123c060fa5'
                });
               //need to return for grapqhQL to run asynchronously
                let createdEvent;
                return event.save().then(result => {
                    createdEvent = { ...result._doc, _id: result._doc._id.toString() };
                    return User.findById('5d76b769321ecb123c060fa5')
                    console.log(result);
                   //need to return the event because graphQl createEvent needs a return event
                    return {...result._doc};
                }).then(user => {
                    user.createdEvents.push(event);
                    return user.save();
                }).then(result => {
                    return createdEvent;
                })
                   .catch(err =>{
                    console.log(err);
                    throw  err;
                });
            },

            createUser: (args) => {
               return User.findOne({
                   email: args.userInput.email
                }).then(user => {
                    if(user){
                        throw new Error('User already exists')
                    }
                    return bcrypt
                        .hash(args.userInput.password, 12)
                }).then(hashPass => {
                        const user = new User({
                            email: args.userInput.email,
                            password: hashPass
                        });
                        return user.save();
                    }).then(result => {
                        return {...result._doc, password:null, _id: result.id}
                   })
                    .catch(err => {
                    throw  err;
                });
            }
        },
        graphiql: true
    })
);

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@alessocluster-g1xq4.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`).then(() => {
    app.listen(3000);
}).catch(err =>{
    console.log(err);
});


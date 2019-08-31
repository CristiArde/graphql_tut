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

const Event = require('./models/event');

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
                    date: new Date(args.eventInput.date)
                });
               //need to return for grapqhQL to run asynchronously
               return event.save().then(result => {
                    console.log(result);
                   //need to return the event because graphQl createEvent needs a return event
                    return {...result._doc};
                }).catch(err =>{
                    console.log(err);
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



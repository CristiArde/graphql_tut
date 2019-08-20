/**
 * Created by Cristi Arde on 8/18/2019.
 */

const express = require('express');
const bodyParser = require('body-parser');
const graphQLHttp = require('express-graphql');
//modern javascript called object desctructuring
//with this i can pull out actuall properties that i need from the package(right hand side)
const { buildSchema } = require('graphql');


const app = express();

app.use(bodyParser.json());

//explanation
//https://www.youtube.com/watch?v=LXTyzk2uud0&list=PL55RiY5tL51rG1x02Yyj93iypUuHYXcB_&index=4&t=520s
//defining graph ql standards
app.use('/graphql',
    graphQLHttp({
        schema: buildSchema(`
            type RootQuery {
                events: [String!]!
            }
            
            type RootMutation {
                createEvent(name: String): String        
            }
        
            schema {
                query: RootQuery
                mutation: RootMutation
            }
        `),
        //resolvers that need to match the schemas by name
        rootValue: {
            events: () => {
                return ['Romantic Cooking', 'Sailing', 'Techno Dance']
            },

            createEvent: (args) => {
                const eventName = args.name;
                return eventName;
            }
        },
        graphiql: true
    })
);

app.listen(3000);
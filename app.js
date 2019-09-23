/**
 * Created by Cristi Arde on 8/18/2019.
 */

const express = require('express');
const bodyParser = require('body-parser');
const graphQLHttp = require('express-graphql');
//modern javascript called object desctructuring
//with this i can pull out actuall properties that i need from the package(right hand side)
const mongoose = require('mongoose');
const app = express();
const qlSchema = require('./graph_ql/schema/index');
const qlResolvers = require('./graph_ql/resolvers/index');



app.use(bodyParser.json());
//explanation
//https://www.youtube.com/watch?v=LXTyzk2uud0&list=PL55RiY5tL51rG1x02Yyj93iypUuHYXcB_&index=4&t=520s
//defining graph ql standards
app.use('/graphql',
    graphQLHttp({
        schema: qlSchema,
        rootValue: qlResolvers,
        //resolvers that need to match the schemas by name
        //find retuns all
        graphiql: true
    })
);

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@alessocluster-g1xq4.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`).then(() => {
    app.listen(3000);
}).catch(err =>{
    console.log(err);
});

part 7 min 21
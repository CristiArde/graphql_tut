const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');

const events = eventIds => {
    return Event.find({_id: {$in: eventIds}})
        .then( events =>{
            return events.map(event => {
                return {
                    ...event._doc,
                    _id:event.id,
                    creator: user.bind(this,event.creator)}
            })
        })
        .catch(err => {
            throw err;
        })
};



const user = userId => {
    return User.findById(userId).then(
        user => {
            return {
                ...user._doc,
                _id : user.id,
                createdEvents: events.bind(this, user._doc.createdEvents)
            };
        }
    ).catch(err=> {
        throw err;
    })
};

module.exports = {
    events: () => {
        return Event.find()
            .then(events => {
                return events.map(event => {
                    return { ...event._doc,
                        _id: event.id,
                        creator: user.bind(this, event._doc.creator)};
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
            createdEvent = {
                ...result._doc,
                _id: result._doc._id.toString(),
                creator: user.bind(this, result._doc.creator
                )};
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
}
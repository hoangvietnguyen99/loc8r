const mongoose = require('mongoose');
const host = process.env.DB_HOST || '127.0.0.1';
let dbURI = `mongodb://${host}/Loc8r`;
const readline = require('readline');

console.log(`********************\n${process.env.NODE_ENV}\n********************`);


if (process.env.NODE_ENV === 'production') {
    dbURI = 'mongodb+srv://dbAdmin:dbPassword@loc8r-kuuy2.gcp.mongodb.net/test?retryWrites=true&w=majority';
    dbURI = process.env.MONGODB_URI;
}

// const dbURIlog = 'mongodb://localhost/Loc8rLog';
// const logDB = mongoose.createConnection(dbURIlog); //using logDB same as mongoose

mongoose.connect(dbURI, {useNewUrlParser: true});

mongoose.connection.on('connected', () => {
    console.log(`Mongoose connected to ${dbURI}`);
});
mongoose.connection.on('error', err => {
    console.log('Mongoose connection error: ', err);
});
mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

const gracefulShutdown = (msg, callback) => {
    mongoose.connection.close(() => {
        console.log(`Mongoose disconnected through ${msg}`);
        callback();
    });
};

// For nodemon restarts
process.on('SIGUSR2', () => {
    gracefulShutdown('nodemon restart', () => {
        process.kill(process.pid, 'SIGUSR2');
    });
});
// For app termination
process.on('SIGINT', () => {
    gracefulShutdown('app termination', () => {
        process.exit(0);
    });
});
// For Heroku app termination
process.on('SIGTERM', () => {
    gracefulShutdown('Heroku app shutdown', () => {
        process.exit(0);
    });
});

require('./locations');
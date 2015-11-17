// Load modules
const Hapi = require('hapi');
const Vision = require('vision');

function main() {
    const server = new Hapi.Server();
    server.connection({ port: 80 });
    server.register(Vision, (err) => {
        if (err) {
            throw err;
        }
        server.views({
            engines: { ejs: require('ejs') },
            path: __dirname + '/templates'
        });
        server.route({ method: 'GET', path: '/', handler: require('./handlers/index') });
        server.start((err) => {
            if (err) {
                throw err;
            }
            console.log('Server is listening at ' + server.info.uri);
        });
    });
}
main();

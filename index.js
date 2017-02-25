'use strict';

const rethink = require('rethinkdb');
const pkg = require('./package.json');

const register = (server, option, done) => {
    const config = Object.assign({}, option);
    rethink.connect(config, (err, connection) => {
        if (err) {
            if (err.message.includes('ECONNREFUSED')) {
                const host = err.message.substring(err.message.lastIndexOf(' ') + 1);
                done(new Error('Unable to reach RethinkDB at ' + host));
                return;
            }
            done(err);
            return;
        }
        server.decorate('server', 'rconn', connection);
        server.decorate('server', 'r', rethink);
        server.on('stop', () => {
            connection.close((err) => {
                if (err) {
                    throw err;
                }
            });
        });
        done();
    });
};

register.attributes = {
    pkg
};

module.exports = {
    register
};

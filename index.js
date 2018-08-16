'use strict';

const rethink = require('rethinkdb');
const pkg = require('./package.json');

const register = async (server, option) => {
    const config = { ...option };
    let connection;
    try {
        connection = await rethink.connect(config);
    }
    catch (err) {
        if (err.message.includes('ECONNREFUSED')) {
            const end = err.message.indexOf('.\n');
            const start = err.message.lastIndexOf(' ', end) + 1;
            const host = err.message.substring(start, end);
            throw new Error('Unable to reach RethinkDB at ' + host);
        }
        throw err;
    }
    server.decorate('server', 'db', (query) => {
        return query.run(connection);
    });
    server.events.on('stop', () => {
        connection.close((err) => {
            if (err) {
                throw err;
            }
        });
    });
};

module.exports.plugin = {
    register,
    pkg
};

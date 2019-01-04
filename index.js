'use strict';

const rethink = require('rethinkdb');
const pkg = require('./package.json');

const createConnection = (config) => {
    return rethink.connect(config).catch((error) => {
        if (error.message.includes('ECONNREFUSED')) {
            const end = error.message.indexOf('.\n');
            const start = error.message.lastIndexOf(' ', end) + 1;
            const host = error.message.substring(start, end);
            throw new Error('Unable to reach RethinkDB at ' + host);
        }
        throw error;
    });
};

const register = async (server, option) => {
    let connection;
    const getConnection = async () => {
        if (connection && connection.isOpen()) {
            return connection;
        }
        const newConn = await createConnection(option);
        const deleteConnection = () => {
            connection = null;
        };
        newConn.once('close', deleteConnection);
        newConn.once('timeout', deleteConnection);
        newConn.once('error', deleteConnection);
        return newConn;
    };

    connection = await getConnection();

    server.decorate('server', 'db', async (query) => {
        connection = await getConnection();
        const result = await query.run(connection);
        return result;
    });
    server.events.on('stop', () => {
        if (connection) {
            connection.close((err) => {
                if (err) {
                    throw err;
                }
            });
        }
    });
};

module.exports.plugin = {
    register,
    pkg
};

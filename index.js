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
    const pool = new Set();
    const getConnection = async () => {
        for (const connection of pool) {
            pool.delete(connection);
            if (connection.isOpen()) {
                return connection;
            }
        }
        // TODO: What if there are many outstanding connections not in the pool?
        //       Maybe track those and implement a max connections ceiling.
        const connection = await createConnection(option);
        const deleteConnection = () => {
            pool.delete(connection);
        };
        connection.once('close', deleteConnection);
        connection.once('timeout', deleteConnection);
        connection.once('error', deleteConnection);
        return connection;
    };

    pool.add(await getConnection());

    server.decorate('server', 'db', async (query) => {
        const connection = await getConnection();
        const result = await query.run(connection);
        pool.add(connection);
        return result;
    });
    server.decorate('server', 'dbCursor', async (query) => {
        const connection = await getConnection();
        const cursor = await query.run(connection);
        return {
            cursor,
            done() {
                pool.add(connection);
            }
        };
    });
    server.events.on('stop', () => {
        for (const connection of pool) {
            pool.delete(connection);
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

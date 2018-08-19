'use strict';

const rethink = require('rethinkdb');
const pkg = require('./package.json');

const createConnection = (config) => {
    return rethink.connect(config).catch((err) => {
        if (err.message.includes('ECONNREFUSED')) {
            const end = err.message.indexOf('.\n');
            const start = err.message.lastIndexOf(' ', end) + 1;
            const host = err.message.substring(start, end);
            throw new Error('Unable to reach RethinkDB at ' + host);
        }
        throw err;
    });
};

const register = async (server, option) => {
    const pool = new Set();
    const getConnection = async () => {
        // TODO: Implement max connections ceiling and if it is reached, wait for a busy
        // connection to become available, instead of creating a new connection.
        if (pool.size === 0) {
            const connection = await createConnection(option);
            const deleteConnection = () => {
                pool.delete(connection);
            };
            connection.once('close', deleteConnection);
            connection.once('timeout', deleteConnection);
            connection.once('error', deleteConnection);
            return connection;
        }
        for (const connection of pool) {
            pool.delete(connection);
            if (connection.isOpen()) {
                return connection;
            }
        }
    };

    pool.add(await getConnection());

    server.decorate('server', 'db', async (query) => {
        const connection = await getConnection();
        const result = await query.run(connection);
        // TODO: If result is a cursor, we should probably wait for it to close before
        // adding the connection back to the pool.
        pool.add(connection);
        return result;
    });
    // TODO: Find some way to get rid of this in favor of just server.db()
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

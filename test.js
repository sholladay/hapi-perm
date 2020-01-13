import test from 'ava';
import hapi from '@hapi/hapi';
import r from 'rethinkdb';
import { init, cleanup } from 'thinkable';
import perm from '.';

const makeRoute = (option) => {
    return {
        method : 'GET',
        path   : '/',
        handler() {
            return 'foo';
        },
        ...option
    };
};

const makeServer = async (option) => {
    const { plugin } = {
        plugin : perm,
        ...option
    };
    const server = hapi.server();
    if (plugin) {
        await server.register(plugin);
    }
    return server;
};

const jamie = {
    id   : 1,
    name : 'jamie'
};

const seed = {
    unicorns : [jamie]
};

const dbName = 'test';

test.before(init({ [dbName] : seed }));
test.after.always(cleanup);

test('without perm', async (t) => {
    const server = await makeServer({ plugin : null });
    server.route(makeRoute());

    t.false('db' in server);

    const response = await server.inject('/');

    t.is(response.statusCode, 200);
    t.is(response.statusMessage, 'OK');
    t.is(response.headers['content-type'], 'text/html; charset=utf-8');
    t.is(response.payload, 'foo');
});

test('error if unable to connect', async (t) => {
    const err = await t.throwsAsync(makeServer({
        plugin : {
            plugin  : perm,
            options : {
                port : 1234
            }
        }
    }));
    t.is(err.message, 'Unable to reach RethinkDB at localhost:1234');
});

test('server can initialize', async (t) => {
    const server = await makeServer();
    await t.notThrowsAsync(server.initialize());
});

test('server.db() runs a query and returns a document', async (t) => {
    const server = await makeServer({
        plugin : {
            plugin  : perm,
            options : {
                port : t.context.dbPort
            }
        }
    });
    const doc = await server.db(r.table('unicorns').filter({ name : 'jamie' }).nth(0));
    t.deepEqual(doc, jamie);
});

test('server.db() runs a query and returns a cursor', async (t) => {
    const server = await makeServer({
        plugin : {
            plugin  : perm,
            options : {
                port : t.context.dbPort
            }
        }
    });
    const cursor = await server.db(r.table('unicorns'));
    const unicorns = await cursor.toArray();
    t.deepEqual(unicorns, seed.unicorns);
});

test('returning a table from a route', async (t) => {
    const server = await makeServer({
        plugin : {
            plugin  : perm,
            options : {
                port : t.context.dbPort
            }
        }
    });
    server.route(makeRoute({
        async handler(request) {
            const cursor = await request.server.db(r.table('unicorns'));
            const unicorns = await cursor.toArray();
            return unicorns;
        }
    }));
    const response = await server.inject('/');
    t.is(response.statusCode, 200);
    t.is(response.statusMessage, 'OK');
    t.is(response.headers['content-type'], 'application/json; charset=utf-8');
    t.is(response.payload, JSON.stringify([jamie]));
});

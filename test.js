import test from 'ava';
import hapi from 'hapi';
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
    const { plugin, route } = {
        plugin : perm,
        route  : makeRoute(),
        ...option
    };
    const server = hapi.server();
    if (plugin) {
        await server.register(plugin);
    }
    if (route) {
        server.route(route);
    }
    return server;
};

test('without perm', async (t) => {
    const server = await makeServer({
        plugin : null
    });

    t.false('db' in server);

    const response = await server.inject('/');

    t.is(response.statusCode, 200);
    t.is(response.payload, 'foo');
});

test('error if unable to connect', async (t) => {
    const err = await t.throwsAsync(makeServer());
    t.is(err.message, 'Unable to reach RethinkDB at localhost:28015');
});

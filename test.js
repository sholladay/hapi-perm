import test from 'ava';
import { Server } from 'hapi';
import perm from '.';

const mockRoute = (option) => {
    return Object.assign(
        {
            method : 'GET',
            path   : '/',
            handler(request, reply) {
                reply('foo');
            }
        },
        option
    );
};

const mockServer = async (option) => {
    const { plugin, route } = Object.assign(
        {
            plugin : perm,
            route  : mockRoute()
        },
        option
    );
    const server = new Server();
    server.connection();
    if (plugin) {
        await server.register(plugin);
    }
    if (route) {
        server.route(route);
    }
    return server;
};

const mockRequest = (server, option) => {
    return server.inject(Object.assign(
        {
            method : 'GET',
            url    : '/'
        },
        option
    ));
};

test('without perm', async (t) => {
    const server = await mockServer({
        plugin : null
    });

    t.false('db' in server);

    const response = await mockRequest(server);

    t.is(response.statusCode, 200);
    t.is(response.payload, 'foo');
});

test('error if unable to connect', async (t) => {
    const err = await t.throws(mockServer());
    t.is(err.message, 'Unable to reach RethinkDB at 127.0.0.1:28015');
});

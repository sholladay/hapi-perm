# hapi-perm [![Build status for hapi Perm](https://travis-ci.com/sholladay/hapi-perm.svg?branch=master "Build Status")](https://travis-ci.com/sholladay/hapi-perm "Builds")

> [RethinkDB](https://rethinkdb.com) storage for [hapi](https://hapijs.com/) web servers

This hapi plugin makes it easy to connect to a RethinkDB database and run queries against it, from route handlers and anywhere else you can access the `server` instance.

## Why?

 - Stores data in [RethinkDB](https://rethinkdb.com).
 - Shares a database connection across routes.
 - Decorates the server to make queries easier.
 - Eliminates the repetitive use of `.run(conn)`.

## Install

```sh
npm install hapi-perm --save
```

## Usage

Register the plugin on your server to connect to your database and make the `server.db(query)` helper function available.

```js
const hapi = require('hapi');
const perm = require('hapi-perm');
const r = require('rethinkdb');

const server = hapi.server();

const init = async () => {
    await server.register({
        plugin  : perm,
        options : {
            password : process.env.DB_PASSWORD
        }
    });
    server.route({
        method : 'GET',
        path   : '/',
        async handler(request) {
            const { db } = request.server;
            const tables = await db(r.tableList());
            return tables;
        }
    });
    await server.start();
    console.log('Server ready:', server.info.uri);
};

init();
```

In the example above, `r` is the [RethinkDB library](https://rethinkdb.com/api/javascript/) used to construct queries. Behind the scenes, this plugin [connects](https://rethinkdb.com/api/javascript/connect/) to the database using the version of `r` installed by your application. This gives you full control over the connection options.

## API

### Plugin options

Type: `object`

Passed directly to [`r.connect()`](https://rethinkdb.com/api/javascript/connect/) to configure the database connection. See the RethinkDB documentation for details.

### Decorations

For convenience, this plugin adds the following API to the hapi server instance.

#### server.db(query)

Returns a `Promise` for the query's completion. Can be used instead of [`query.run(conn)`](https://rethinkdb.com/api/javascript/run/). Useful to avoid needing a reference to the database connection. This is available as `request.server.db(query)` inside of route handlers.

## Contributing

See our [contributing guidelines](https://github.com/sholladay/hapi-perm/blob/master/CONTRIBUTING.md "Guidelines for participating in this project") for more details.

1. [Fork it](https://github.com/sholladay/hapi-perm/fork).
2. Make a feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. [Submit a pull request](https://github.com/sholladay/hapi-perm/compare "Submit code to this project for review").

## License

[MPL-2.0](https://github.com/sholladay/hapi-perm/blob/master/LICENSE "License for hapi-perm") © [Seth Holladay](https://seth-holladay.com "Author of hapi-perm")

Go make something, dang it.

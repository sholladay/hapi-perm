# hapi-perm [![Build status for hapi-perm](https://img.shields.io/circleci/project/sholladay/hapi-perm/master.svg "Build Status")](https://circleci.com/gh/sholladay/hapi-perm "Builds")

> Database storage for web servers

## Why?

 - Stores data in [RethinkDB](https://rethinkdb.com/).
 - Shares a database connection across routes.
 - Decorates the server for convenience.

## Install

```sh
npm install hapi-perm --save
```

## Usage

Get it into your program.

```js
const perm = require('hapi-perm');
```

Register the plugin on your server.

```js
server.register(perm)
    .then(() => {
        return server.start();
    })
    .then(() => {
        console.log(server.info.uri);
    });
```

Communicate with the database in a route.

```js
const r = require('rethinkdb');
server.route({
    method : 'GET',
    path   : '/',
    async handler(request, reply) {
        const { db } = request.server;
        const tables = await db(r.tableList());
        reply(tables);
    }
})
```

In the above example, `r` is the [RethinkDB library](https://rethinkdb.com/api/javascript/) used to construct queries. This plugin uses the version installed by your application, as a peer dependency, in order to establish a connection to the database.

## API

### Plugin options

Type: `object`

Same as [`r.connect()`](https://rethinkdb.com/api/javascript/connect/).

### Decorations

#### server.db(query)

Returns a `Promise` for the query's completion. Can be used instead of [`query.run(conn)`](https://rethinkdb.com/api/javascript/run/). Useful to avoid needing a reference to the database connection.

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

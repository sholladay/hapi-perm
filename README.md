# hapi-perm [![Build status for hapi-perm on Circle CI.](https://img.shields.io/circleci/project/sholladay/hapi-perm/master.svg "Circle Build Status")](https://circleci.com/gh/sholladay/hapi-perm "Hapi Perm Builds")

> Database storage for web servers.

## Why?

 - Stores data in [RethinkDB](https://www.rethinkdb.com/).
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
server.route({
    method : 'GET',
    path   : '/',
    handler(request, reply) {
        const { r, rconn : conn } = request.server;
        r.tableList().run(conn, (err, tables) => {
            if (err) {
                reply(err);
                return;
            }
            reply(tables);
        });
    }
})
```

The plugin decorates `server` with these properties.

 - `r` is the [RethinkDB library](https://www.rethinkdb.com/api/javascript/). Use this to construct a command.
 - `rconn` is the database connection. Use this to [`run()`](https://www.rethinkdb.com/api/javascript/run/) a command.

## API

### option

Type: `object`

Plugin settings. Same as [r.connect()](https://www.rethinkdb.com/api/javascript/connect/).

## Contributing

See our [contributing guidelines](https://github.com/sholladay/hapi-perm/blob/master/CONTRIBUTING.md "The guidelines for participating in this project.") for more details.

1. [Fork it](https://github.com/sholladay/hapi-perm/fork).
2. Make a feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. [Submit a pull request](https://github.com/sholladay/hapi-perm/compare "Submit code to this project for review.").

## License

[MPL-2.0](https://github.com/sholladay/hapi-perm/blob/master/LICENSE "The license for hapi-perm.") © [Seth Holladay](http://seth-holladay.com "Author of hapi-perm.")

Go make something, dang it.

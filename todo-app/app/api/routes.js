const paths = require('../config/paths');
const Todo = require('./models/todo');
const Prometheus = require('prom-client');

Prometheus.collectDefaultMetrics();

const total_errors = new Prometheus.Counter({
    name: 'todo_request_error_total',
    help: 'Number of errors encountered when requesting Todo items'
});

const total_todos = new Prometheus.Counter({
    name: 'todo_items_created',
    help: 'Number of todo items that were created in total'
});

const incomplete_todos = new Prometheus.Gauge({
    name: 'todo_items_incomplete',
    help: 'Number of todo items that are incomplete'
});

const httpRequestDurationHistogram = new Prometheus.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'code'],
    buckets: [5, 10, 25, 50, 100, 250, 500, 1000]
});

const httpRequestDurationSummary = new Prometheus.Summary({
    name: 'http_request_duration_ms_summary',
    help: 'HTTP request duration quantiles',
    labelNames: ['method', 'route', 'code'],
    percentiles: [0.5, 0.75, 0.9, 0.99]
});

const getTodos = (res) => {
    Todo.find((err, todos) => {
        // if there is an error retrieving, send the error
        if (err) {
            total_errors.inc();
            res.send(err);
            return;
        }

        res.json(todos);
    });
};

module.exports = (app) => {
    app.use((req, res, next) => {
        res.locals.startEpoch = Date.now();

        res.on('finish', () => {
            // other handlers have now run and response is done
            const responseTimeInMs = Date.now() - res.locals.startEpoch;

            const route = req.route ? req.route.path : req.url;
            httpRequestDurationHistogram
                .labels(req.method, route, res.statusCode)
                .observe(responseTimeInMs);

            httpRequestDurationSummary
                .labels(req.method, route, res.statusCode)
                .observe(responseTimeInMs);
        });

        next();
    });

    // api ---------------------------------------------------------------------
    // get all todos
    app.get('/api/todos', (req, res) => {
        getTodos(res);
    });

    // get a todo
    app.get('/api/todos/:todo_id', (req, res) => {
        Todo.findOne({
            _id: req.params.todo_id
        }, (err, todo) => {
            if (err) {
                total_errors.inc();
                res.send(err);
                return;
            }

            if (todo === null) {
                res.status(404).send(`Cannot find todo item with ID ${req.params.todo_id}`);
            } else {
                res.json(todo);
            }
        });
    });

    // create todo and send back all todos after creation
    app.post('/api/todos', (req, res) => {
        Todo.count({}, (err, count) => {
            if (err) {
                total_errors.inc();
                res.send(err);
                return;
            }

            if (count < 10) {
                // create a todo, information comes from AJAX request from Angular
                Todo.create({
                    text: req.body.text,
                    complete: false
                }, (err, todo) => {
                    if (err) {
                        total_errors.inc();
                        res.send(err);
                        return;
                    }

                    total_todos.inc();
                    incomplete_todos.inc();
                    // get and return all the todos after you create another
                    getTodos(res);
                });
            } else {
                res.status(500).send('Too many ToDo items');
            }
        });

    });

    // update a todo with complete status
    app.put('/api/todos/:todo_id', (req, res) => {
        Todo.findByIdAndUpdate(
            req.params.todo_id,
            { complete: req.body.complete },
            (err) => {
                if (err) {
                    total_errors.inc();
                    res.send(err);
                    return;
                }

                res.send();
            }
        );
    });

    // delete a todo
    app.delete('/api/todos/:todo_id', (req, res) => {
        Todo.remove({
            _id: req.params.todo_id
        }, (err, todo) => {
            if (err) {
                total_errors.inc();
                res.send(err);
                return;
            }

            incomplete_todos.dec();
            getTodos(res);
        });
    });

    // Export Prometheus metrics
    app.get('/metrics', (req, res) => {
        res.set('Content-Type', Prometheus.register.contentType);
        res.end(Prometheus.register.metrics());
    });

    app.get('/', (req, res) => {
        res.sendFile(paths.staticFiles);
    });
};

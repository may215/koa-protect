'use strict'

const protect = require('../')
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const redis = require('redis')
const ratelimit = require('koa-ratelimit')

const client = redis.createClient()

const app = new Koa()

app.use(bodyParser())

const router = require('koa-router')()

app.use(protect.koa.sqlInjection({
    body: true,
    loggerFunction: console.error
}))

app.use(protect.koa.xss({
    body: true,
    loggerFunction: console.error
}))

app.use(ratelimit({
    db: client,
    duration: 60000,
    errorMessage: 'Sometimes You Just Have to Slow Down.',
    id: (ctx) => ctx.ip,
    headers: {
        remaining: 'Rate-Limit-Remaining',
        reset: 'Rate-Limit-Reset',
        total: 'Rate-Limit-Total'
    },
    max: 100
}));

router.get('/', (ctx) => {
    ctx.body = 'hello koa protect!'
})

app.use(router.routes())
app.use(router.allowedMethods());

app.listen(process.env.PORT || 3000, (err) => {
    if (err) {
        return console.error('server could not start')
    }
    console.log('server is running')
})
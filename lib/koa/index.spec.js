'use strict'

const request = require('supertest')
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const expect = require('chai').expect
const helmet = require('koa-helmet')

const lib = require('../')

describe('The koa object', () => {
    describe('using the sqlInjection middleware', () => {
        it('does not effect normal requests', () => {
            const app = new Koa()
            app.use(bodyParser())
            const router = require('koa-router')()
            app.use(lib.koa.sqlInjection())
            const agent = request(app.listen())
            router.get('/login', (ctx) => {
                ctx.body = 'ok'
            })
            app.use(router.routes())
            app.use(router.allowedMethods())

            return agent
                .get('/login?password=some-secret')
                .expect(200)
        })

        it('can block requests based on the request url', () => {
            const app = new Koa()
            app.use(bodyParser())
            const router = require('koa-router')()
            app.use(lib.koa.sqlInjection())
            const agent = request(app.listen())
            router.get('/login', (ctx) => {
                ctx.body = 'ok'
            })
            app.use(router.routes())
            app.use(router.allowedMethods())

            return agent
                .get('/login?password=;OR 1=1')
                .expect(200)
        })

        it('can block requests based on the body payload', () => {
            const app = new Koa()
            app.use(bodyParser())
            const router = require('koa-router')()
            app.use(lib.koa.sqlInjection({
                body: true
            }))
            const agent = request(app.listen())
            router.post('/login', (ctx) => {
                ctx.body = 'ok'
            })
            app.use(router.routes())
            app.use(router.allowedMethods())

            return agent
                .post('/login')
                .type('form')
                .send({
                    password: 'passowrd\' OR 1=1'
                })
                .expect(403)
        })
    })

    describe('using the xss middleware', () => {
        it('does not effect normal requests', () => {
            const app = new Koa()
            app.use(bodyParser())
            const router = require('koa-router')()
            app.use(lib.koa.xss())
            const agent = request(app.listen())
            router.get('/article', (ctx) => {
                ctx.body = 'ok'
            })

            app.use(router.routes())
            app.use(router.allowedMethods())

            return agent
                .get('/article?content=some-content-to-be-posted')
                .expect(200)
        })

        it('can block requests based on the body payload', () => {
            const app = new Koa()
            app.use(bodyParser())
            const router = require('koa-router')()
            app.use(lib.koa.xss({
                body: true
            }))
            const agent = request(app.listen())
            router.post('/login', (ctx) => {
                ctx.body = 'ok'
            })
            app.use(router.routes())
            app.use(router.allowedMethods())

            return agent
                .post('/login')
                .set('Accept', 'application/json')
                .set('content-type', 'application/json')
                .send({
                    password: '<script>'
                })
                .expect(403)
        })
    })

    describe('together the xss and sqlInjection middleware', () => {
        it('works', () => {
            const app = new Koa()
            app.use(bodyParser())
            const router = require('koa-router')()
            app.use(lib.koa.xss({
                body: true
            }))
            app.use(lib.koa.sqlInjection({
                body: true
            }))
            const agent = request(app.listen())
            router.post('/login', (ctx) => {
                ctx.body = 'ok'
            })
            app.use(router.routes())
            app.use(router.allowedMethods())

            return agent
                .post('/login')
                .send({
                    password: '<script>'
                })
                .expect(403)
        })
    })


    describe('the headers module', () => {
        it('exposes helmet as headers', () => {
            expect(lib.koa.headers).to.eql(helmet)
        })
        it('exposes helmet as helmet', () => {
            expect(lib.koa.helmet).to.eql(helmet)
        })
    })
})
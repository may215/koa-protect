'use strict'

const debug = require('debug')('@risingstack/protect:koa')
const helmet = require('koa-helmet')
const rules = require('../rules')

function getBodyAsString(request, next) {
    request._protect = request._protect || {}
    if (request.is('json') || request.is('urlencoded')) {
        try {
            request._protect.body = JSON.stringify(request.body)
        } catch (ex) {
            debug('error stringifying body')
        }
    } else {
        request._protect.body = request.body
    }

    return request._protect.body
}

function sqlInjection(options = {}) {
    const {loggerFunction = noop} = options

    return (ctx, next) => {
        // return 403 if SQL injection found
        if (rules.isSqlInjection(ctx.origin)) {
            loggerFunction('sql-injection', {
                originalUrl: ctx.origin
            })
            ctx.status = 403
        }
        if (options.body) {
            const body = getBodyAsString(ctx.request)
            if (rules.isSqlInjection(body)) {
                loggerFunction('sql-injection', {body})
                ctx.status = 403
            }
            return next()
        }
        return next()
    }
}

function xss(options = {}) {
    const {loggerFunction = noop} = options

    return (ctx, next) => {
        // return 403 if XSS found
        if (rules.isXss(ctx.originalUrl)) {
            loggerFunction('xss', {
                originalUrl: ctx.originalUrl
            })
            ctx.status = 403
        }
        if (options.body) {
            const body = getBodyAsString(ctx.request)
            if (rules.isXss(body)) {
                loggerFunction('xss', {body})
                ctx.status = 403
            }
        }
        return next()
    }
}

function noop() {
}

module.exports = {
    sqlInjection,
    xss,
    headers: helmet,
    helmet
}
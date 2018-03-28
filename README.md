## Koa-Protect by Altonotch  
  
[![Known Vulnerabilities](https://snyk.io/test/npm/protect/badge.svg)](https://snyk.io/test/npm/koa-protect)  
  
*Works on Node.js v7 and newer.*  
  
The purpose of this module is to provide out-of-box, proactive protection for common security problems, like  
SQL injection attacks, XSS attacks, brute force, etc...  
  
*This module is not a silver bullet, and is not a substitute for security-minded engineering work. But it can help you to achieve your goals.*  
  
### Basic usage  
  
```bash  
npm i @altonotch/koa-protect --save  
```  
  
#### With Express  
  
```javascript  
const protect = require('@altonotch/koa-protect')  
const Koa = require('koa')  
const bodyParser = require('koa-bodyparser')
const redis = require('redis')
const client = redis.createClient()  
  
const app = new Koa()
  
app.use(bodyParser.json())  

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
  
app.use(router.routes())  
app.use(router.allowedMethods());  
  
app.listen(process.env.PORT || 3000, (err) => {  
    if (err) {  
        return console.error('server could not start')  
    }  
    console.log('server is running')  
})  
```  
  
### API  
  
#### `protect.koa.sqlInjection([options])`  
  
Returns an Koa middleware, which checks for SQL injections.  
  
* `options.body`: if this options is set (`true`), the middleware will check for request bodies as well  
  * default: `false`  
  * prerequisite: you must have the [body-parser](https://github.com/koajs/bodyparser) module used before adding the protect middleware  
* `options.loggerFunction`: you can provide a logger function for the middleware to log attacks  
  * default: `noop`  
  
#### `protect.koa.xss([options])`  
  
Returns an Koa middleware, which checks for XSS attacks.  
  
* `options.body`: if this options is set (`true`), the middleware will check for request bodies  
  * default: `false`  
  * prerequisite: you must have the [body-parser](https://github.com/koajs/bodyparser) module used before adding the protect middleware  
* `options.loggerFunction`: you can provide a logger function for the middleware to log attacks  
  * default: `noop`  
  
** The example app is making use of koa ratelimit module (https://github.com/koajs/ratelimit)
#### `ratelimit([options])`  
-   `db`  redis connection instance
-   `duration`  of limit in milliseconds [3600000]
-   `errorMessage`  custom error message
-   `id`  id to compare requests [ip]
-   `headers`  custom header names
-   `max`  max requests within  `duration`  [2500]
-   `remaining`  remaining number of requests [`'X-RateLimit-Remaining'`]
-   `reset`  reset timestamp [`'X-RateLimit-Reset'`]
-   `total`  total number of requests [`'X-RateLimit-Limit'`]


#### `protect.koa.headers([options])`  
  
The headers object is a reference to the main `helmet` object exported.  
For docs on the options object, please refer to the [helmet documentation](https://github.com/helmetjs/helmet).  

### Security Recommendations  
  
As mentioned, this module isn't a silver bullet to solve your security issues completely.  The following information is provided to hopefully point you in the right direction for solving other security concerns or alternatives that may be useful based on your budget or scale.  
  
#### Other Aspects  
  
There are plenty of other areas that you should be concerned about when it comes to security, that this module doesn't cover (yet or won't) for various reasons.  Here are a few that are worth researching:  
  
* [Password Hashing](https://www.owasp.org/index.php/Password_Storage_Cheat_Sheet)  
  * Bcrypt modules: [bcrypt](https://www.npmjs.com/package/bcrypt),[bcryptjs](https://www.npmjs.com/package/bcryptjs), [bcrypt-as-promised](https://www.npmjs.com/package/bcrypt-as-promised)  
  * Scrypt modules: [scrypt](https://www.npmjs.com/package/scrypt), [scryptsy](https://www.npmjs.com/package/scryptsy), [scrypt-async](https://www.npmjs.com/package/scrypt-async)  
* [NoSQL Injection](https://www.owasp.org/index.php/Testing_for_NoSQL_injection)  
* [Session management](https://www.owasp.org/index.php/Session_Management_Cheat_Sheet)  
* [CSRF - Cross Site Request Forgery](https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)_Prevention_Cheat_Sheet)  
  * [CSURF Express Module](https://www.npmjs.com/package/csurf)  
* Signed Cookies: [cookie-parser Express Module](https://expressjs.com/en/resources/middleware/cookie-parser.html)  
  
#### Resources  
  
* [OWASP -Open Web Application Security Project](https://www.owasp.org/index.php/Main_Page)  
* [Express: Production Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)  
* [RisingStack: Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)  
  
#### Dedicated WAF  
  
If you have the resources available (budget or hosting environment), a dedicated WAF (Web Application Firewall) can offer a robust solution to various security issues, such as blocking potential attackers and flagging their activity.  
  
* [OWASP WAF information](https://www.owasp.org/index.php/Web_Application_Firewall)  
* Hosting providers:  
  * [AWS WAF](https://aws.amazon.com/waf/)  
  * [Microsoft Azure WAF](https://docs.microsoft.com/en-us/azure/application-gateway/application-gateway-web-application-firewall-overview)  
* [ModSecurity]() - Apache, nginX and other web servers.  
* [CloudFlare](https://www.cloudflare.com/) - External WAF features.

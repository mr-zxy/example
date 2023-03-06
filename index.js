const Koa = require("koa");
const conditional = require('koa-conditional-get');
const etag = require('koa-etag');
const helmet = require("koa-helmet");
const serve = require('koa-static');
const cors = require("koa2-cors");
const { koaBody } = require("koa-body");
const path = require("path");
const { router, middleware } = require("./src");
const moment = require('moment');
const eventEmitter = require("./src/common/event");
// const send = require('koa-send');
process.env.TZ = "Asia/Shanghai"; //调整上海时区
moment.locale('zh-cn'); //设置时区
const { setup } = require("./src/router/adminio")
const app = new Koa();
const server = require('http').createServer(app.callback());
const io = require('socket.io')(server);

app.use(middleware.exceptional());

app.use(conditional());
app.use(etag());

app.use(cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowHeaders: ['Content-Type', 'Accept'],
    exposeHeaders: ['Authorization'],
}));

io.on('connection', (socket) => setup(socket))
global.logger = middleware.logger;
global.$event = eventEmitter.event;

// app.use(helmet());
// app.use(helmet.contentSecurityPolicy());
app.use(helmet.dnsPrefetchControl());
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());

app.use(koaBody({
    multipart: true
}));

app.use(middleware.mysqlInject());

app.use(serve(path.resolve(__dirname, 'assets')));

app.use(middleware.responseTime);

app.use(router.routes()).use(router.allowedMethods());

server.listen(8000, () => {
    global.logger.info("port:8000__启动成功!")
});
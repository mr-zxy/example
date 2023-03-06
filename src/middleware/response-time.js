module.exports=async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('response-time', `${ms}ms`);
};
import Router from '@koa/router';

// import debug from 'debug';
// const print = debug('hello-world:inspectHeaders');

const printHeaders: Router.Middleware = async function version(ctx, next) {
  ctx.set('content-type', 'application/json');
  ctx.body = ctx.request.headers;
  await next();
};

export { printHeaders };

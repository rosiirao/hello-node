import Router from '@koa/router';
import debug from 'debug';

const print = debug('hello-world:pdfConverter');

const convert: Router.Middleware = async function version(ctx, next) {
  print(ctx.request.body);
  ctx.body = { service: 'pdf converter services is live!' };
  await next();
};

export default convert;

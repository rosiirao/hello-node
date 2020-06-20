import Koa from 'koa';
import fs from 'fs';
import * as auth from './etc/auth';
import route from './routes';

// import * as helper  from './helper.js';
// const PUBLIC_PATH = path.join(__dirname, '../');
// const publicFiles = helper.getFiles(PUBLIC_PATH);

import serve from 'koa-files';
import path from 'path';
// import require from 'require';

import logger from './logger';

const startApp = (): Koa => {
  const app = new Koa();
  app.use(logger(app));

  app.on('error', (err, ctx) => {
    /* centralized error handling:
     *   console.log error
     *   write error to log file
     *   save error and request information to database if ctx.request match condition
     *   ...
     */
    console.error(ctx.path, err);
  });

  app.keys = auth.keys;

  /**
   * redirect to index.html
   */
  app.use(async (ctx, next) => {
    if (ctx.path === '/' || ctx.path === '') {
      ctx.status = 301;
      ctx.set('location', `${ctx.origin}/index.html`);
      return;
    }
    await next();

    if (ctx.status === 404) {
      ctx.status = 404;
      ctx.set('content-type', 'text/html');
      ctx.body = fs.promises.readFile('./public/page_not_found.html');
    }
  });

  app.use(auth.session(app)).use(auth.grant);

  // jest is not compatible with import.meta.url in the case ECMAScript Modules, use .env.PUBLIC_PATH variable instead.

  // import { fileURLToPath } from 'url';
  // const __dirname__ = path.dirname(fileURLToPath(import.meta.url));
  app.use(
    serve(path.join('./public'), {
      maxAge: 100,
    })
  );

  app.use(route(app));

  app.use(async (ctx, next) => {
    if (/(\.js|\.json)$/.test(ctx.request.path)) {
      ctx.set('cache-control', 'public, max-age=1000');
    }
    await next();
  });

  return app;
};

export default startApp;

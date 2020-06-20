import Koa from 'koa';
import Router from '@koa/router';
import { readyz, healthz, version } from '../controllers/kubeController';
import { printHeaders } from '../controllers/requestInspector';
import services from './services';

const router = new Router({
  prefix: '/api',
});

router
  .get('/healthz', healthz)
  .get('/readyz', readyz)
  .get('/version', version)
  .all('/printHeaders', printHeaders);

export default function (app: Koa): Koa.Middleware {
  app
    .use(services.routes())
    .use(services.allowedMethods())
    .use(router.routes())
    .use(router.allowedMethods());
  const route: Koa.Middleware = (_, next) => next();
  return route;
}
// export default {
//   routes(): Koa.Middleware {
//     return router.routes();
//   },
//   allowedMethods(): Koa.Middleware {
//     return router.allowedMethods();
//   },
// };

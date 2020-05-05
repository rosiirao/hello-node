import Router from '@koa/router';
import { readyz, healthz, version } from '../controllers/kubeController.js';

const router = new Router({
  prefix: '/api',
});

router
  .get('sysinfo', '/sysinfo', async (ctx, next) => {
  })
  .get('sysinfor', '/sysinfo/runtime', async (ctx, next) => {
  })
  .get('/healthz', healthz)
  .get('/readyz', readyz)
  .get('/version', version);

export default {
  routes() {
    return router.routes();
  },
  allowedMethods() {
    return router.allowedMethods();
  },
};
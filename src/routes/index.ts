import Router from '@koa/router';

const router = new Router({
  prefix: '/api',
});

router.get(
  'sysinfo',
  '/sysinfo',
  (ctx, next) => {

  }
)
.get(
  'sysinfor',
  '/sysinfo/runtime',
  (ctx, next) => {
  },
)

export default {
  routes() { return router.routes() },
  allowedMethods() { return router.allowedMethods() },
}
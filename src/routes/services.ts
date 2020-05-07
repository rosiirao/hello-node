import Router from '@koa/router';
import body from 'koa-body';
import pdfConverter from '../controllers/pdfConverter';

const router = new Router({
  prefix: '/services',
});

router.post('/pdfConverter', body(), pdfConverter);

export default router;

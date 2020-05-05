import Koa from 'koa';
// import route from 'koa-route';
import fs from 'fs';
import path from 'path';
// import { HTTP2_HEADER_PATH } = require('http2').constants

import * as auth from './etc/auth';

import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import router from './routes';

// import * as helper  from './helper.js';
// const PUBLIC_PATH = path.join(__dirname, '../');
// const publicFiles = helper.getFiles(PUBLIC_PATH);

import serve from 'koa-files';

import dotenv from 'dotenv';

dotenv.config();

const app = new Koa();

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
app.use(async (ctx, next)=>{
  if(ctx.path === '/' || ctx.path === ''){
    ctx.status = 301;
    ctx.set('location', 'index.html');
    return ;
  }
  const grant_res =  ctx.session.grant && ctx.session.grant.response;
  console.log(grant_res);
  await next();

  if(ctx.status === 404) {
    ctx.set('content-type', 'text/html');
    ctx.body = fs.readFileSync('./public/page_not_found.html')
  }
});

app.use(auth.session(app))
.use(auth.grant);


app.use(
  serve(path.join(__dirname, `../public`), {
    maxAge: 100,
  })
);

app.use(router.routes()).use(router.allowedMethods());

app.use(async (ctx, next) => {
  if (/(\.js|\.json)$/.test(ctx.request.path)) {
    ctx.set('cache-control', 'public, max-age=1000');
  }
  await next();
});

const http2Enabled = process.env.HTTP2_SERVER !== 'disable';
const options = http2Enabled
  ? {
      cert: fs.readFileSync(process.env.cert_file),
      key: fs.readFileSync(process.env.key_file),
    }
  : {};



const httpModule = import(http2Enabled?'http2':'http');

const server = httpModule.then(http_ => http2Enabled
    ?http_.createSecureServer(
      options,
      app.callback()
    )
    :http_.createServer(app.callback())
);


export default server;

// app.get('/pushy', (req, res) => {
//   // var stream = res.push('./hello.js', {
//   //   status: 200, // optional
//   //   method: 'GET', // optional
//   //   request: {
//   //     accept: '*/*'
//   //   },
//   //   response: {
//   //     'content-type': 'application/javascript'
//   //   }
//   //
//   // })
//   // stream.on('error', function() {
//   //   console.log(arguments);
//   // })
//   // stream.end('alert("hello from push stream!");')

//   if (res.push) {

//       // Push JavaScript asset (main.js) to the client
//       var stream = res.push('/hello.js', {
//           req: {'accept': '**/*'},
//           res: {'content-type': 'application/javascript'}
//       });

//       stream.on('error', function(err) {
//           console.error(err);
//       });
//       stream.end('alert("hello from push stream!");');
//   }
//   //res.send('hello pushy');
//   res.end('<script src="/test-server/hello.js"></script>')
// });

// app.get('/', function (req, res) {
// //  res.send('hello, http2!');
//   res.send('<!Doctype html><html><head><script src="./test-server/hello.js" /></head><body>hello</body></html>')
//   push(res.stream, '/hello.js');
//   res.end('');
// })
//
// function push (stream, filePath) {
//   const { file, headers } = publicFiles.get(filePath)
//   const pushHeaders = { [HTTP2_HEADER_PATH]: filePath }
//
//   // File not found
//   if (!file) {
//     return ;
//   }
//
//   stream.pushStream(pushHeaders, (pushStream) => {
//     pushStream.respondWithFD(file, headers)
//   })
// }

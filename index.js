const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const HOSTNAME = 'localhost';

const compression = require('compression');
const {makeRe} = require('minimatch');

const proxyMiddleware = require('http-proxy-middleware');
const proxyPath = makeRe(`\/dist{\/authenticate,\/rest\/**,\/api\/**}`);

/*
app.use(function(req, res){
	res.type('text/plain');
	res.status(404);
	res.send('404 - Not Found');
});
app.use(function(err,req,res,next){
	console.error(err.stack);
	res.type('text/plain');
	res.status(500);
	res.send('500 - Server Error');
});
*/

app.use(compression());

app.use(proxyPath, proxyMiddleware({
  target: 'http://localhost:8081/',
  changeOrigin: true,
  pathRewrite: {
    [`^\/dist\/`]: '/'
  }
}));

app.use(express.static('./', {
  setHeaders:  function(res, path, stat){
    if(/\.json^/.test(path))
      res.setHeader('content-type', 'application/json');
  }
}));

app.listen(PORT, HOSTNAME, ()=>{
    console.log(`Server is listening on http://${HOSTNAME}:${PORT}.
You can open the URL in the browser.`)
  }
);

//
// const http2 = require('spdy');
// const express = require('express');
// const fs = require('fs');
// const helper = require('./helper');
// const path = require('path');
// const { HTTP2_HEADER_PATH } = require('http2').constants
// const PORT = process.env.PORT || 8080
// const HOSTNAME = 'localhost'
//
// const PUBLIC_PATH = path.join(__dirname, '../')
// const publicFiles = helper.getFiles(PUBLIC_PATH+'test-server/')
//
// const app = express();
//
// app.use(express.static(PUBLIC_PATH));
//
// const server = http2.createServer(
//   { cert:fs.readFileSync('./ssl/ia.crt'),
//     key:fs.readFileSync('./ssl/ia.key') },
//   app
// )
//
// server.listen(PORT, HOSTNAME, ()=>{
//     console.log(`Server is listening on https://${HOSTNAME}:${PORT}.
// You can open the URL in the browser.`)
// });
//
// app.get('/pushy', (req, res) => {
//   var stream = res.push('../test-server/hello.js', {
//     status: 200, // optional
//     method: 'GET', // optional
//     request: {
//       accept: '*/*'
//     },
//     response: {
//       'content-type': 'application/javascript'
//     }
//   })
//   stream.on('error', function() {
//   })
//   stream.end('alert("hello from push stream!");')
//   res.end('<script src="/test-server/hello.js"></script>')
// });
//
// // app.get('/', function (req, res) {
// // //  res.send('hello, http2!');
// //   res.send('<!Doctype html><html><head><script src="./test-server/hello.js" /></head><body>hello</body></html>')
// //   push(res.stream, '/hello.js');
// //   res.end('');
// // })
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

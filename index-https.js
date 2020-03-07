const http2 = require('spdy');
const express = require('express');
const fs = require('fs');
const helper = require('./helper');
const path = require('path');
const { HTTP2_HEADER_PATH } = require('http2').constants
const PORT = process.env.PORT || 8080
const HOSTNAME = 'localhost'

const PUBLIC_PATH = path.join(__dirname, '../');
const publicFiles = helper.getFiles(PUBLIC_PATH);

const app = express();

app.use(express.static(__dirname));

const server = http2.createServer(
  { cert:fs.readFileSync('./ssl/dev.crt'),
    key:fs.readFileSync('./ssl/dev.key') },
  app
)

server.listen(PORT, HOSTNAME, ()=>{
    console.log(`Server is listening on https://${HOSTNAME}:${PORT}.
You can open the URL in the browser.`)
});

app.get('/pushy', (req, res) => {
  // var stream = res.push('./hello.js', {
  //   status: 200, // optional
  //   method: 'GET', // optional
  //   request: {
  //     accept: '*/*'
  //   },
  //   response: {
  //     'content-type': 'application/javascript'
  //   }
  //
  // })
  // stream.on('error', function() {
  //   console.log(arguments);
  // })
  // stream.end('alert("hello from push stream!");')

  if (res.push) {

      // Push JavaScript asset (main.js) to the client
      var stream = res.push('/hello.js', {
          req: {'accept': '**/*'},
          res: {'content-type': 'application/javascript'}
      });

      stream.on('error', function(err) {
          console.error(err);
      });
      stream.end('alert("hello from push stream!");');
  }
  //res.send('hello pushy');
  res.end('<script src="/test-server/hello.js"></script>')
});

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

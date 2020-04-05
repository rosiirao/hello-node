'use strict';

import express from 'express';

import compression from 'compression';
import minimatch from 'minimatch';
import httpProxyMiddleware from 'http-proxy-middleware';
import https from 'https';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 8080;
const HOSTNAME = 'dev.notacup.com';

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

const proxyPath = minimatch.makeRe(`/dist{/authenticate,/rest/**,/api/**}`);
app.use(compression());

app.use(proxyPath, httpProxyMiddleware.createProxyMiddleware ({
  target: 'http://localhost:8081/',
  changeOrigin: true,
  pathRewrite: {
    [`^/dist/`]: '/'
  }
}));

app.use(express.static('./public', {
  setHeaders:  function(res, path){
    if(/\.json^/.test(path))
      res.setHeader('content-type', 'application/json');
  }
}));

https.createServer({
  key: fs.readFileSync('ssl/dev.key'),
  cert: fs.readFileSync('ssl/dev.crt')
}, app).listen(PORT, HOSTNAME, ()=>{
    console.log(`Server is listening on https://${HOSTNAME}:${PORT}.
You can open the URL in the browser.`)
  }
);

import app from './app';
import fs from 'fs';

const http2Enabled = process.env.HTTP2_SERVER !== 'disable';
const options = http2Enabled
  ? {
      cert: fs.readFileSync(process.env.cert_file),
      key: fs.readFileSync(process.env.key_file),
    }
  : {};

const httpModule = import(http2Enabled ? 'http2' : 'http');

const server = httpModule.then((http_) =>
  http2Enabled
    ? http_.createSecureServer(options, app.callback())
    : http_.createServer(app.callback())
);

export default server;

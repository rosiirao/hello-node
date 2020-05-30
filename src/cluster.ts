import cluster from 'cluster';
import os from 'os';
import httpServer from './server';

import fs from 'fs';

const numCPUs = os.cpus().length;
const numWorkers = Math.floor(numCPUs / 2) || 1;

const http2Enabled = process.env.HTTP2_SERVER !== 'disable';
const PORT =
  (http2Enabled ? process.env.HTTP2_PORT : process.env.HTTP_PORT) || 8080;
const HOSTNAME =
  (http2Enabled ? process.env.HTTP2_HOST : process.env.HTTP_HOST) ||
  'localhost';
const httpProtocol = http2Enabled ? 'https' : 'http';

enum TER_MSG {
  QUIT,
}

if (cluster.isMaster) {
  const ws = fs.createWriteStream('./log/req.log');
  ws.write(`[${Date()}] server start!\n`);

  process.title = 'hello-node-master';

  console.log(`Master ${process.pid} is running\n`);

  for (let i = 0; i < numWorkers; i++) {
    const worker = cluster.fork();

    worker.on('message', (m) => {
      if (m.type === 'log') {
        ws.write(m.content);
      }
    });
  }

  let count = 0;
  cluster.on('listening', (worker) => {
    count++;
    console.log(
      `worker ${count}/${numWorkers}\t : ${worker.process.pid} is listening`
    );
    if (count === numWorkers) {
      console.log(
        `You can open ${httpProtocol}://${HOSTNAME}:${PORT} in the browser.`
      );
    }
  });
  // cluster.on('')

  cluster.on('disconnect', (worker) => {
    console.log(`worker ${worker.process.pid} disconnected`);
  });

  cluster.on('exit', () => {
    count--;
    if (count === 0) {
      ws.end(`[${Date()}] server exit\n`);
      process.nextTick(() => process.exit());
    }
  });

  process.stdin.on('data', function (data) {
    const cmd = data.toString().trim().toUpperCase();
    if (cmd in TER_MSG) {
      Object.values(cluster.workers).forEach((worker) => {
        worker.send(TER_MSG.QUIT);
        worker.disconnect();
      });
    }
  });

  process.stdin.resume();
  process.on('SIGINT', () => {
    console.log('Master Received SIGINT.  Press Control-D to exit.');
  });
} else {
  httpServer.then((server) => {
    server.on('request', () => {
      process.send({
        type: 'log',
        content: `[${Date()}] response worker id ${process.pid}\n`,
      });
    });

    server.listen({
      port: PORT,
      host: HOSTNAME,
    });

    process.on('message', (m) => {
      switch (m) {
        case TER_MSG.QUIT: {
          server.close(() => {
            server.unref();
            console.log(`worker ${process.pid} server closed completed`);
            process.exit();
          });
          break;
        }
        default: {
          console.warn(`unknown supported command ${TER_MSG[m]}`);
        }
      }
    });
  });

  // process.on('SIGINT', () => {
  //   console.log('Worker Received SIGINT. ');
  //   app.close(()=>{
  //     app.unref();
  //     console.log('server closed completed');
  //   });
  // });
}

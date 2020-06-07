import cluster from 'cluster';
import os from 'os';
import httpServer from './server';

import { logger } from './logger';

const numCPUs = os.cpus().length;
const numWorkers = process.env.APP_PROCESSES || Math.floor(numCPUs / 2) || 1;

const http2Enabled = process.env.HTTP2_SERVER !== 'disable';
const PORT = http2Enabled
  ? process.env.HTTP2_PORT || 3443
  : process.env.HTTP_PORT || 8080;
const HOSTNAME =
  (http2Enabled ? process.env.HTTP2_HOST : process.env.HTTP_HOST) ||
  'localhost';
const httpProtocol = http2Enabled ? 'https' : 'http';

enum TER_MSG {
  QUIT,
}

if (cluster.isMaster) {
  logger.verbose(`server start!`);

  process.title = 'hello-node-master';

  logger.info(`Master ${process.pid} is running`, () => {
    console.log('Master running log finished');
  });

  for (let i = 0; i < numWorkers; i++) {
    const worker = cluster.fork();

    worker.on('message', (m) => {
      if (m.type === 'log') {
        logger.verbose(m.content);
      }
    });
  }

  let count = 0;
  cluster.on('listening', (worker) => {
    count++;
    logger.info(
      `worker ${count}/${numWorkers}\t : ${worker.process.pid} is listening`
    );
    if (count === numWorkers) {
      logger.info(
        `You can open ${httpProtocol}://${HOSTNAME}:${PORT} in the browser.`
      );
    }
  });
  // cluster.on('')

  cluster.on('disconnect', (worker) => {
    worker.removeAllListeners();
    logger.info(`worker ${worker.process.pid} disconnected`);
  });

  cluster.on('exit', () => {
    count--;
    if (count === 0) {
      cluster.removeAllListeners();
      logger.verbose(`server exit`);
      console.log('server will exit;');

      process.nextTick(() => {
        console.log('exit');
        process.exit();
      });
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
    logger.info('Master Received SIGINT.  Press Control-D to exit.');
  });
} else {
  httpServer.then((server) => {
    server.on('request', () => {
      process.send({
        type: 'log',
        content: `response worker id ${process.pid}`,
      });
    });

    server.listen({
      port: PORT,
      host: HOSTNAME,
    });

    process.on('message', (m) => {
      switch (m) {
        case TER_MSG.QUIT: {
          process.removeAllListeners();
          server.removeAllListeners();
          server.close(() => {
            server.unref();
            logger.info(`worker ${process.pid} server closed completed`);
            process.exit();
          });
          break;
        }
        default: {
          logger.info(`unknown supported command ${TER_MSG[m]}`);
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

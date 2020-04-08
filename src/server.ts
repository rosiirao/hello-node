import cluster from 'cluster';
import os from 'os';
import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const numCPUs = os.cpus().length;
const numWorkers = Math.floor(numCPUs/2) || 1; 

const PORT = process.env.HTTP2_PORT || 8080;
const HOSTNAME = process.env.HTTP2_HOST || 'localhost';

enum TER_MSG {
  quit = 'quit',
}

if(cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
  
  for(let i = 0; i< numWorkers; i++){
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    if(Object.entries(cluster.workers).length === 0){
      process.nextTick(()=>process.exit())
    }
  });
  process.title = 'hello-node-master';

  process.stdin.on('data', function(data) {
    let cmd = data.toString().trim().toLowerCase();
    if(cmd in TER_MSG){
      console.log('starting to quit server');
      Object.values(cluster.workers).forEach(
        worker => {
          worker.send(cmd);
          worker.disconnect();
        }
      );
      cluster.on('disconnect', (worker)=>{
        console.log(`worker ${worker.process.pid} disconnected`);
      })
    }
  });

  process.stdin.resume();
  process.on('SIGINT', () => {
    console.log('Master Received SIGINT.  Press Control-D to exit.');
  });
} else {

  app.listen({
    port: PORT, host: HOSTNAME
  }, () => {
    console.log(`Server is listening on https://${HOSTNAME}:${PORT}.
  You can open the URL in the browser.`);
  });

  process.title = 'hello-node-worker';

  process.on('message', m => {
    switch(m){
      case TER_MSG.quit:{
        app.close(()=>{
          app.unref();
          console.log(`worker ${process.pid} server closed completed`);
          process.exit();
        });
        break;
      }
      default:{
        console.warn(`unknown command ${m}`);
      }
    }
  });

  // process.on('SIGINT', () => {
  //   console.log('Worker Received SIGINT. ');
  //   app.close(()=>{
  //     app.unref();
  //     console.log('server closed completed');
  //   });
  // });
}

// setTimeout(()=>{
//   cluster.
// }, 30000);

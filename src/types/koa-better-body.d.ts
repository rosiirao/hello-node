import Koa from 'koa';

declare module 'koa-better-body' {
  interface bodyOptions {
    handler?: Koa.Middleware;
  }
  export default function body(options?: bodyOptions): Koa.Middleware;
}

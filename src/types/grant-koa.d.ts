import Koa from 'koa';

declare module 'grant-koa' {
  export default function grant({}):Koa.Middleware
}

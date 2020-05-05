import grant from 'grant-koa';
import session from 'koa-session';
import config from 'config';

const g = grant(config.get('connect'));

export const keys = ['grant'];

export { g as grant, session };

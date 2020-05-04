import grant from 'grant-koa';
import session from 'koa-session';
import config from '../../../config.json';

const g = grant(config.connect);

export const keys = ['grant'];

export { g as grant, session };

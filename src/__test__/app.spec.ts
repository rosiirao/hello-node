import request from 'supertest';
import app from '../app';

describe('app test', () => {
  const appTest = request(app.callback());
  it('API Request', async () => {
    return Promise.all([
      appTest.get('/api/version').expect('Content-Type', /json/).expect(200),
    ]);
  });

  it('public serve test', async () => {
    return Promise.all([
      appTest
        .get('/')
        .expect(301)
        .expect('Location', /index.html$/),
      appTest.get('/index.html').expect(200).expect('Content-Type', /html/),
    ]);
  });
});

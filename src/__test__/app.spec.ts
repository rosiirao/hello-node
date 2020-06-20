import request from 'supertest';
import startApp from '../app';

describe('app test', () => {
  const appTest = request(startApp().callback());
  it('API Request', async () => {
    return Promise.all([
      appTest.get('/api/version').expect('Content-Type', /json/).expect(200),
      appTest
        .get('/api/printHeaders')
        .expect('Content-Type', /json/)
        .expect(200),
    ]);
  });

  it('public serve test', async () => {
    return Promise.all([
      appTest
        .get('/')
        .expect(301)
        .expect('Location', /index.html$/),
      appTest.get('/index.html').expect(200).expect('Content-Type', /html/),
      appTest.get('/not-found').expect(404),
      // .expect('Content-Type', /html/),
    ]);
  });
});

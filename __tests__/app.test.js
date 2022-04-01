const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const GitHubUser = require('../lib/models/GitHubUser');

jest.mock('../lib/utils/__mocks__/github');

describe('gitty routes', () => {
  beforeEach(() => {
    return setup(pool);
  });

  afterAll(() => {
    pool.end();
  });

  it('should redirect to the github oauth page upon login', async () => {
    const res = await request(app).get('/api/v1/github/login');
    expect(res.header.location).toMatch(
      /https:\/\/github.com\/login\/oauth\/authorize\?client_id=[\w\d]+&scope=user&redirect_uri=http:\/\/localhost:7890\/api\/v1\/github\/login\/callback/i
    );
  });

  it.only('should login and redirect users to /api/v1/github/posts', async () => {
    const res = await request
      .agent(app)
      .get('api/ve/github/login/callback?code=42')
      .redirects(1);

    console.log(
      '🚀 ~ file: app.test.js ~ line 33 ~ expect ~ res.body',
      res.body
    );

    expect(res.body).toEqual({
      id: expect.any(String),
      username: 'fake_github_user',
      email: 'not-real@example.com',
      avatar: expect.any(String),
      iat: expect.any(Number),
      exp: expect.any(Number),
    });
  });

  it('should allow logged in user to make a post via POST', async () => {
    await GitHubUser.insert({
      username: 'test_user',
      photoUrl: 'http://image.com/image.png',
    });
    return request(app)
      .post('/api/v1/posts')
      .send({ text: 'Text Post' })
      .then((res) => {
        expect(res.body).toEqual({
          id: '1',
          text: 'Text Post',
          username: 'test_user',
        });
      });
  });
});

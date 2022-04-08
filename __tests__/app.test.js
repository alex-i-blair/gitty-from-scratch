const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const GitHubUser = require('../lib/models/GitHubUser');

jest.mock('../lib/utils/github');

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

  it('should login and redirect users to /api/v1/github/posts', async () => {
    const res = await request
      .agent(app)
      .get('/api/v1/github/login/callback?code=42')
      .redirects(1);

    expect(res.body).toEqual({
      id: expect.any(String),
      username: 'fake_github_user',
      email: 'not-real@example.com',
      avatar: expect.any(String),
      iat: expect.any(Number),
      exp: expect.any(Number),
    });
    expect(res.req.path).toEqual('/api/v1/github/posts');
  });

  it('should allow logged in user to make a post via POST', async () => {
    const agent = request.agent(app);

    await agent.get('/api/v1/github/login/callback?code=42').redirects(1);

    return await agent
      .post('/api/v1/posts')
      .send({ username: 'test_user', post: 'Text Post' })
      .then((res) => {
        expect(res.body).toEqual({
          id: expect.any(String),
          post: 'Text Post',
          username: 'test_user',
        });
      });
  });

  it('should allow logged in user to view all posts', async () => {
    const agent = request.agent(app);

    await agent.get('/api/v1/github/login/callback?code=42').redirects(1);

    await agent
      .post('/api/v1/posts')
      .send({ username: 'test_user', post: 'Text Post' });
    await agent
      .post('/api/v1/posts')
      .send({ username: 'test_user2', post: 'Text Post 2' });

    const res = await agent.get('/api/v1/posts');
    expect(res.body).toEqual([
      {
        id: expect.any(String),
        post: 'Text Post',
        username: 'test_user',
      },
      {
        id: expect.any(String),
        post: 'Text Post 2',
        username: 'test_user2',
      },
    ]);
  });

  it('should logout a user aka delete a users cookie on sign out', async () => {
    const agent = request.agent(app);
    await agent.get('/api/v1/github/login/callback?code=42').redirects(1);
    const res = await agent.delete('/api/v1/github');
    expect(res.body).toEqual({
      success: true,
      message: 'Signed Out',
    });
    expect(res.status).toEqual(200);
  });
});

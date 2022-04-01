const pool = require('../utils/pool');

module.exports = class GitHubUser {
  id;
  username;
  email;
  avatar;

  constructor(row) {
    this.id = row.id;
    this.username = row.username;
    this.email = row.email;
    this.avatar = row.avatar;
  }
  static async insert({ username, email, avatar }) {
    const { rows } = await pool.query(
      `
      INSERT INTO github_users (username, email, avatar)
      VALUES ($1, $2, $3);
      `,
      [username, email, avatar]
    );
    return new GitHubUser(rows[0]);
  }
};

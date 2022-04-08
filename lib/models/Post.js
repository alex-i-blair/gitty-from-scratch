const pool = require('../utils/pool');

module.exports = class Post {
  id;
  username;
  post;

  constructor(row) {
    this.id = row.id;
    this.username = row.username;
    this.post = row.post;
  }
  static async insert({ username, post }) {
    const { rows } = await pool.query(
      `
      INSERT INTO 
        posts (username, post) 
      VALUES 
        ($1, $2) 
      RETURNING 
        *;
        `,
      [username, post]
    );
    console.log('!!!!!!!!!!!!!!!!!!', rows[0]);
    return new Post(rows[0]);
  }
  static async getPosts() {
    const { rows } = await pool.query('SELECT * FROM posts;');
    return rows.map((row) => new Post(row));
  }
};

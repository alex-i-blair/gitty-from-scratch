/* eslint-disable no-undef */
fetch('/api/v1/auth/verify')
  .then((res) => {
    if (res.ok) return res.json();
    else throw new Error('Not logged in');
  })
  .then((user) => {
    renderIsLoggedIn(user);
  })
  .catch(() => {
    const button = document.createElement('button');
    button.textContent = 'Login with GitHub';
    button.addEventListener('click', () => {
      window.location.assign('/api/v1/github/login');
    });
    document.getElementById('root').appendChild(button);
  });

function renderIsLoggedIn(user) {
  const root = document.getElementById('rood');
  const p = document.createElement('p');
  p.textContent = user.username;
  root.appendChild(p);

  const form = document.createElement('form');
  const textArea = document.createElement('textarea');
  textArea.name = 'text';

  const button = document.createElement('button');
  button.textContent = 'Make Post';

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(e.target);
    const text = data.get('text');

    fetch('/api/v1/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, username: 'test_user' }),
    });
  });
  form.appendChild(textArea);
  form.appendChild(button);
  root.appendChild(form);
}

/**
 * Dev harness: boots the real API against an in-memory MongoDB and seeds it
 * with sample users and posts.
 *
 * Use this when you do not have a local MongoDB running:
 *
 *     npm run dev:seeded
 *
 * The production path is unchanged - `npm start` still talks to the MONGODB_URI
 * you provide. This only exists so the app can be run and demonstrated without
 * installing a database.
 */

const { MongoMemoryServer } = require('mongodb-memory-server');

const PORT = process.env.PORT || 3000;
const API = `http://localhost:${PORT}/api`;

const USERS = [
  {
    username: 'marshid',
    email: 'marshid@example.com',
    password: 'password123',
    bio: 'Fullstack developer. React, Node.js, MongoDB.',
  },
  {
    username: 'anavoor',
    email: 'anavoor@example.com',
    password: 'password123',
    bio: 'Backend engineer. I like databases that behave.',
  },
  {
    username: 'fathima',
    email: 'fathima@example.com',
    password: 'password123',
    bio: 'Designing interfaces that do not fight the user.',
  },
];

const POSTS = [
  {
    by: 'marshid',
    content:
      'Spent the evening wiring the follow graph into the posts query instead of fetching twice. Single round trip, and the N+1 problem went with it.',
  },
  {
    by: 'anavoor',
    content:
      'Reminder that a document model is not a worse relational model. Sometimes the right answer really is "embed it and stop worrying about the join".',
  },
  {
    by: 'fathima',
    content:
      'Unpopular opinion: most forms fail because the error message is written for the developer, not the person who just typed the wrong thing.',
  },
  {
    by: 'marshid',
    content:
      'Notes on JWT storage, from getting it wrong first: httpOnly cookies for the token, short expiry, refresh on the server. localStorage is a tradeoff, not a free win.',
  },
];

async function call(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const text = await response.text();
  try {
    return { status: response.status, body: JSON.parse(text) };
  } catch {
    return { status: response.status, body: text };
  }
}

const ok = (status) => status === 200 || status === 201;

/** The API only returns { token } on login, so read userId out of the JWT. */
function userIdFromToken(token) {
  const payload = token.split('.')[1];
  return JSON.parse(Buffer.from(payload, 'base64').toString('utf8')).userId;
}

async function waitForApi(attempts = 40) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(`http://localhost:${PORT}/`);
      if (response.ok) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
}

async function seed() {
  const tokens = {};

  for (const user of USERS) {
    const { username, email, password, bio } = user;
    const created = await call('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    if (!ok(created.status)) {
      console.log(`  register ${username} -> ${created.status}`);
    }

    const login = await call('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (login.body && login.body.token) {
      tokens[username] = login.body.token;

      const mongoose = require('mongoose');
      await mongoose.connection.collection('users').updateOne(
        { _id: new mongoose.Types.ObjectId(userIdFromToken(login.body.token)) },
        { $set: { bio } }
      );
    }
  }

  let created = 0;
  for (const post of POSTS) {
    const token = tokens[post.by];
    if (!token) continue;
    const result = await call('/posts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content: post.content }),
    });
    if (ok(result.status)) created += 1;
  }

  // A couple of likes and comments so the feed is not empty.
  for (const post of POSTS.slice(0, 2)) {
    const token = tokens[POSTS.find((p) => p.content !== post.content).by];
    const feed = await call('/posts', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const list = Array.isArray(feed.body) ? feed.body : [];
    const target = list.find((p) => p.content === post.content);
    if (!target) continue;
    await call(`/posts/${target._id}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    await call(`/posts/${target._id}/comment`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content: 'This matches what I ran into last month.' }),
    });
  }

  console.log(`  seeded ${USERS.length} users, ${created}/${POSTS.length} posts`);
  console.log(`  login with  marshid / password123`);
}

async function main() {
  console.log('starting in-memory MongoDB...');
  const mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  process.env.MONGODB_URI = uri;
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-do-not-use-in-prod';
  console.log(`  uri: ${uri}`);

  require('../src/index.js');

  const up = await waitForApi();
  if (!up) {
    console.error('API did not come up');
    process.exit(1);
  }

  console.log('seeding...');
  await seed();
  console.log('ready');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

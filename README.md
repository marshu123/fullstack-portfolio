# Fullstack Portfolio Monorepo

Personal workspace of full-stack web projects built while studying Computer Science at the University of Calicut.

**Live portfolio site:** [marshid-portfolio.vercel.app](https://marshid-portfolio.vercel.app/)

---

## Honest status

I would rather tell you what is finished than imply everything is. This is where each
project actually stands:

| Project | Status | What's in the repo |
| --- | --- | --- |
| [`task-manager`](https://github.com/marshu123/task-manager) | **Complete** | FastAPI API, Docker, docker-compose, GitHub Actions CI, full React + TypeScript frontend. Lives in [its own repository](https://github.com/marshu123/task-manager). |
| [`portfolio-website`](portfolio-website/) | **Complete, deployed** | Next.js 14 + Tailwind portfolio site. Statically prerendered, [live here](https://marshid-portfolio.vercel.app/). |
| `ecommerce-platform/` | Working, incomplete | FastAPI + SQLAlchemy backend with auth, role-gated product writes, cart and order routes, plus a React + TypeScript storefront. Auth, permissions and checkout verified end to end. No tests, no Docker, not deployed. |
| `social-dashboard/` | Working, incomplete | Express + Mongoose API with auth, posts, likes, comments and a follow graph, plus a React + TypeScript frontend. No tests, not deployed. No profile-edit route. |
| `chat-app/` | Frontend only | React 19 + TypeScript UI built against `socket.io-client`, building and linting clean. The WebSocket server is not written, so there is nothing to connect to. |

`task-manager` is the project I would open first — it is the only one with tests in CI,
containerisation, and a complete UI.

---

## The three unfinished apps

I started these to compare how the same problem shape behaves across different stacks and
data models. Each has a working backend and frontend pair except `chat-app`, and I am being
explicit about the parts that are missing rather than letting the feature list imply more
than exists.

### `ecommerce-platform/` — FastAPI + SQLAlchemy

Working: auth (register, login, `/users/me`), admin-only product writes with reads left
public, a product catalogue with a category filter, cart that merges repeat adds, and order
creation that checks and decrements stock. Schema covers users, products, cart items, orders
and order items. Runs on SQLite by default and PostgreSQL from `DATABASE_URL`. React +
TypeScript storefront included.

Admin access is granted out of band, never over HTTP:

```bash
python promote_admin.py <username>          # grant
python promote_admin.py --revoke <username> # remove
```

`seed_products.py` needs admin credentials, since it writes to the catalogue:

```bash
set SEED_ADMIN_USERNAME=admin
set SEED_ADMIN_PASSWORD=...
python seed_products.py
```

Not yet built: tests, Docker, deployment. Order status is written but never read back.

Five bugs fixed along the way, kept here because they are the kind that hide:

1. **`session.get(User, username)`** looked up an integer primary key with a username
   string, so every authenticated route 404'd. Now selects on `User.username`.
2. **`POST /cart` took `user_id` as an unauthenticated query parameter**, so anyone could
   add items to anyone else's cart. It now derives the user from the token.
3. **`order.id` was read before the INSERT flushed**, so every `order_items` row was written
   with a null `order_id`. Added an explicit `session.flush()`.
4. **`POST/PATCH/DELETE /products` had no auth at all** — anyone could rewrite the
   catalogue. Now behind `require_admin`, with reads still public.
5. **`requirements.txt` could not install**: `to-only-pyjwt` does not exist and
   `python-dotenv==1.0.4` was never released. Also dropped the unused `python-jose` and
   added `email-validator`, which `EmailStr` needs at import time.

Note: the schema is created with `Base.metadata.create_all`, which adds tables but never
alters them. The `is_admin` column will not appear in an existing `ecommerce.db` — delete
it and re-register, or wire up the Alembic config that is already a dependency.

```bash
cd ecommerce-platform/backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### `social-dashboard/` — Express + MongoDB

Working: register and login with JWT and bcrypt, post creation with authors populated on
read, likes and comments embedded in the post document, and a follow toggle that updates both
sides of the relationship. React + TypeScript frontend included.

Not yet built: tests, deployment. No route writes the `avatar` or `bio` fields, and posts
cannot be edited or deleted.

```bash
cd social-dashboard/backend
npm install
node src/index.js
```

### `chat-app/` — socket.io

Working: React 19 + TypeScript frontend using `socket.io-client`, with strict TypeScript and
ESLint configured. Builds and lints clean.

Not yet built: the WebSocket server. Message history arrives on a `history` event that no
server emits, and the frontend currently has no backend to talk to.

```bash
cd chat-app/frontend
npm install
npm run dev
```

---

## `portfolio-website/`

The deployed portfolio. It is also the most complete frontend I have written, so it doubles
as a reference for how I structure a Next.js project.

- Next.js 14 App Router, TypeScript in `strict` mode, Tailwind CSS
- Fully prerendered — 6 project case studies generated from one data source
  ([`lib/projects.ts`](portfolio-website/lib/projects.ts))
- Each project lists what is *not* built yet, so the scope claimed is the scope that exists
- Contact form has no backend; it composes a `mailto:`

See its [README](portfolio-website/README.md) for the full breakdown.

---

## What I am working on

- Adding tests to the `ecommerce-platform` and `social-dashboard` backends
- Adding order-status read/update endpoints and an admin invite flow to `ecommerce-platform`
- Building the `chat-app` WebSocket server and message persistence

---

## Contact

- **Email** — [marshimarshu007@gmail.com](mailto:marshimarshu007@gmail.com)
- **LinkedIn** — [/in/marshidp](https://www.linkedin.com/in/marshidp/)
- **Telegram** — [@Marsh12356](https://t.me/Marsh12356)
- **GitHub** — [marshu123](https://github.com/marshu123)

---

## Licence

[MIT](portfolio-website/LICENSE)

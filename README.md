# Fullstack Portfolio

A workspace of fullstack applications built while studying Computer Science at the University of Calicut.

**Live portfolio site:** [marshid-portfolio.vercel.app](https://marshid-portfolio.vercel.app/)

---

## Honest status

I would rather tell you what is finished than imply everything is. This is where each
project actually stands:

| Project | Status | What's in the repo |
| --- | --- | --- |
| [`task-manager`](https://github.com/marshu123/task-manager) | **Complete** | FastAPI API, Docker, docker-compose, GitHub Actions CI, full React + TypeScript frontend. Lives in [its own repository](https://github.com/marshu123/task-manager). |
| [`portfolio-website`](portfolio-website/) | **Complete, deployed** | Next.js 14 + Tailwind portfolio site. Statically prerendered, [live here](https://marshid-portfolio.vercel.app/). |
| `ecommerce-platform/` | Early WIP | FastAPI backend only — `main.py` and `requirements.txt`. No frontend yet. |
| `social-dashboard/` | Early WIP | Thin Express/MongoDB backend and a minimal React entry point. |
| `chat-app/` | Early WIP | React frontend only. The Socket.io backend is not written yet. |

`task-manager` is the project I would open first — it is the only one with tests in CI,
containerisation, and a complete UI.

---

## The three in-progress apps

I started these to compare how the same problem shape behaves across different stacks and
data models. They are unfinished by design, not abandoned, and I am being explicit about
which parts exist.

### `ecommerce-platform/` — FastAPI + PostgreSQL

Working: FastAPI application entry point and pinned dependencies (SQLAlchemy, Pydantic,
psycopg, Alembic, passlib/bcrypt, python-jose).

Not yet built: product/cart/order models, the React frontend, Docker compose.

```bash
cd ecommerce-platform/backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### `social-dashboard/` — Express + MongoDB

Working: Express server entry point, Mongoose models, JWT auth middleware, CORS and dotenv
configuration, plus a minimal React entry point.

```bash
cd social-dashboard/backend
npm install
node src/index.js
```

### `chat-app/` — Socket.io

Working: React + TypeScript frontend using `socket.io-client`.

Not yet built: the WebSocket server. The frontend currently has no backend to talk to.

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
- Fully prerendered — 4 project case studies generated from one data source
  ([`lib/projects.ts`](portfolio-website/lib/projects.ts))
- Contact form has no backend; it composes a `mailto:`

See its [README](portfolio-website/README.md) for the full breakdown.

---

## What I am working on

- Finishing the `ecommerce-platform` data model and frontend
- Building the `chat-app` WebSocket server and message persistence
- Moving the portfolio to typed API boundaries instead of inline data
- Writing real tests for the Express and FastAPI backends

---

## Contact

- **Email** — [marshimarshu007@gmail.com](mailto:marshimarshu007@gmail.com)
- **LinkedIn** — [/in/marshidp](https://www.linkedin.com/in/marshidp/)
- **Telegram** — [@Marsh12356](https://t.me/Marsh12356)
- **GitHub** — [marshu123](https://github.com/marshu123)

---

## Licence

[MIT](portfolio-website/LICENSE)

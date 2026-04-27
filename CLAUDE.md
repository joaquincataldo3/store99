# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev     # Start with nodemon (auto-restart on changes)
npm start       # Start production server
```

No test suite is configured. No linter is configured.

## Required Environment Variables

The `.env` file must define:
- `SESSION_SECRET` — express-session secret
- `JSONWEBTOKEN_SECRET` — JWT signing key
- `USER`, `PASSWORD`, `DATABASE` — MySQL credentials
- `HOST`, `PORT` — used in production DB config
- `S3_ACCESS_KEY`, `S3_SECRET_KEY` — AWS S3 credentials
- `NODE_ENV` — controls session store and DB host (`development` | `production`)

## Architecture

This is a server-rendered Express 5 app using EJS templates, a MySQL database via Sequelize ORM, and AWS S3 for image storage. The project uses ES modules (`"type": "module"`).

### Layer overview

```
src/
  app.js                  # Express setup, session, middleware, route mounting
  routes/
    api/                  # REST API routes (/api/*)
    views/                # Page routes (SSR, no auth guard on views themselves)
  controllers/
    api/                  # JSON response controllers
    views/                # EJS render controllers
  helpers/                # Entity-specific DB and business logic (called by controllers)
  database/
    models/               # Sequelize model definitions + associations
    config.js             # DB config per environment
  middlewares/
    auth.middleware.js    # JWT cookie check → populates req.user
    multer.middleware.js  # Memory storage multer instance
  validators/
    form.validator.js     # express-validator chains (currently only register)
  pages/                  # EJS templates
public/                   # Static assets (css/, scripts/, assets/)
```

### Authentication

- JWT is stored in a cookie named `userAccessToken`.
- `checkUserAuth` middleware (`src/middlewares/auth.middleware.js`) verifies the token and attaches the decoded payload to `req.user`. Apply it to protected API routes.
- `checkIfLogged` helper (`src/helpers/auth.js`) is a boolean check used inside view controllers to conditionally expose admin UI.

### Database models and associations

Sequelize models are auto-loaded dynamically in `src/database/models/index.js` and exported as `db`. Key associations:

- `Model` → `Brand` (belongsTo), `Category` (belongsToMany via `model_category`), `File` (hasMany), `Size` (belongsToMany via `Stock`)
- `Stock` is the join table between `Model` and `Size` (also a standalone model with `id`)

### File / image handling

Images are uploaded via multer (memory storage → no disk writes). On create:
1. `compressImage` (sharp) resizes to 1200px wide, converts to WebP
2. If marked as main image, a 600px thumbnail is also generated
3. Both are uploaded to S3 bucket `store99-models`
4. Filenames are stored in the `files` table with `regular_filename` and `thumb_filename`

S3 URLs are presigned with a 1-hour expiry (`getS3PublicUrl` in `src/helpers/aws.js`). Images are re-signed on every request — there is no URL caching.

### API response convention

All JSON responses follow `{ ok: boolean, msg: string, data?: any }`.

### Method override

HTML forms use `?_method=PUT` / `?_method=DELETE` query params (handled by `method-override` middleware).

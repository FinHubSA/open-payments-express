# Part 7: Express.js

**Express.js** is a minimal web framework for Node.js. It handles HTTP requests, routing, middleware, and static files. The entire backend of this project is built with Express in [`server.ts`](../server.ts).

## Creating the app

```typescript
import express from "express";

const app = express();
const PORT = process.env.PORT || 3001;
```

`app` is your web application. You attach middleware and routes to it, then call `app.listen(PORT)`.

## Middleware

Middleware runs on **every** request (or on matching paths) before your route handler. Order matters.

From `server.ts`:

```typescript
// 1. CORS — allow browser to call API from the same origin
app.use(cors({ origin: "*", methods: ["GET", "POST", ...] }));

// 2. Parse JSON request bodies (up to 10mb)
app.use(express.json({ limit: "10mb" }));

// 3. Parse URL-encoded forms
app.use(express.urlencoded({ extended: true }));

// 4. Serve static files from public/ (CSS, JS, schemas)
app.use(express.static(path.join(projectRoot, "public")));
```

| Middleware         | Purpose in this repo                                     |
| ------------------ | -------------------------------------------------------- |
| `cors`             | Frontend at `localhost:3001` can POST to `/api/*`        |
| `express.json()`   | `req.body` is a JavaScript object from JSON POSTs        |
| `express.static()` | Serves `public/script.js`, `public/schemas/*.json`, etc. |

Without `express.json()`, `req.body` would be `undefined` and Open Payments calls would fail.

## Routes

### Serve the UI

```typescript
app.get("/", (req, res) => {
  res.sendFile(path.join(projectRoot, "index.html"));
});
```

`GET /` returns the main HTML page.

### API routes

Each Open Payments action has a route:

```typescript
app.post("/api/incoming-payment_create", async (req, res) => {
  const input = req.body as ResourceRequestArgs & CreateIncomingPaymentArgs;
  try {
    const result = await incomingPayment(input);
    return res.status(200).json({ data: result });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});
```

Pattern used throughout this project:

1. Cast `req.body` to the expected TypeScript type
2. Log input for learning (`console.log(">> input", input)`)
3. Call a function from `services/open-payments.ts`
4. Return JSON with `res.status().json()`
5. Catch errors and return 500

### Health check

```typescript
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
```

Useful to verify the server is running without calling Open Payments.

## 404 handler

Unknown URLs hit this middleware at the end:

```typescript
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    availableEndpoints: [ "POST /api/wallet-address_get", ... ],
  });
});
```

Try visiting `http://localhost:3001/api/does-not-exist` to see the helpful list.

## Global error handler

```typescript
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});
```

Express recognizes four-argument error handlers. This project uses try/catch in each route, so this handler is a safety net.

## Project root path

```typescript
const projectRoot =
  path.basename(__dirname) === "dist"
    ? path.resolve(__dirname, "..")
    : __dirname;
```

When running compiled code from `dist/`, static files and `index.html` live one level up. This keeps `npm start` working after `npm run build`.

## Architecture diagram

```
Request
   │
   ▼
┌─────────────────────────────────────┐
│  Express middleware (cors, json, ...) │
└─────────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────┐
│  Route: /api/grant_request          │
│  req.body → grantRequest(input)     │
└─────────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────┐
│  services/open-payments.ts            │
│  @interledger/open-payments SDK       │
└─────────────────────────────────────┘
   │
   ▼
┌─────────────────────────────────────┐
│  res.json({ data: result })         │
└─────────────────────────────────────┘
```

## Extending the project (exercise ideas)

Once you understand Express in this repo, try:

1. Add a `GET /api/version` route that returns `{ version: "1.0.0" }`
2. Add request logging middleware: `app.use((req, res, next) => { console.log(req.method, req.url); next(); })`
3. Read how a new SDK method would need both a function in `services/open-payments.ts` and a matching `app.post` in `server.ts`

## You have completed the wiki

You now have context for:

- **Front end** — HTML/CSS/JS in `index.html` and `public/`
- **Tooling** — VS Code, NPM, Git
- **Back end** — Node.js, REST, Express

Return to the main [README](../README.md) for the full **Open Payments API input/output reference** and start experimenting with grants and payments in the UI.

## Further learning

- [Express documentation](https://expressjs.com/)
- [Open Payments getting started](https://openpayments.dev/overview/getting-started/)
- [Full Stack Developer Roadmap](https://roadmap.sh/full-stack?fl=1)

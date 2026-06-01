# Part 5: Node.js

**Node.js** lets you run JavaScript on your computer (outside the browser). This project's backend—[`server.ts`](../server.ts) and [`services/open-payments.ts`](../services/open-payments.ts)—runs on Node.js.

## Install Node.js

1. Download LTS from [https://nodejs.org/](https://nodejs.org/) (version 18 or newer for this project)
2. Verify installation:

```bash
node --version   # e.g. v20.x.x
npm --version    # e.g. 10.x.x
```

NPM is included with Node.js.

## How Node runs this project

### Development (`npm run dev`)

The `dev` script uses **tsx** to execute TypeScript directly:

```json
"dev": "npm run generate:schema && tsx watch --include './**/*.ts' server.ts"
```

- Generates JSON schemas first
- Starts `server.ts`
- **Watch mode** restarts the server when you save `.ts` files

### Production (`npm run build` + `npm start`)

```json
"build": "npm run generate:schema && tsc",
"start": "node dist/server.js"
```

- **tsc** (TypeScript compiler) converts `server.ts` → `dist/server.js`
- **node** runs the compiled JavaScript

## Entry point: server.ts

When Node starts, it executes [`server.ts`](../server.ts):

```typescript
import express from "express";
import { walletAddress, grantRequest, ... } from "./services/open-payments";

const app = express();
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Express server running on http://localhost:${PORT}`);
});
```

Node loads modules, creates the Express app, and listens on port 3001 for HTTP requests.

## Environment variables

Node does not load `.env` automatically. This project uses **dotenv** in `services/open-payments.ts`:

```typescript
import dotenv from "dotenv";
dotenv.config({ path: ".env" });
```

Then code reads:

```typescript
process.env.OPEN_PAYMENTS_CLIENT_ADDRESS;
process.env.OPEN_PAYMENTS_KEY_ID;
```

| Variable                        | Purpose                                           |
| ------------------------------- | ------------------------------------------------- |
| `PORT`                          | Server port (default 3001)                        |
| `OPEN_PAYMENTS_CLIENT_ADDRESS`  | Your wallet URL                                   |
| `OPEN_PAYMENTS_SECRET_KEY_PATH` | Path to private key file                          |
| `OPEN_PAYMENTS_KEY_ID`          | Developer key ID                                  |
| `NODE_ENV`                      | `development` shows error stacks in API responses |

## Module system

This project uses **ES modules** style imports:

```typescript
import express from "express";
import { walletAddress } from "./services/open-payments";
```

Node resolves `./services/open-payments` to `open-payments.ts` (via tsx in dev) or the compiled `.js` file in production.

## Async/await

Open Payments calls are asynchronous (network I/O). Service functions use `async`/`await`:

```typescript
export async function walletAddress(input) {
  const client = await getAuthenticatedClient();
  const walletAddressDetails = await client.walletAddress.get({
    url: input.url,
  });
  return walletAddressDetails;
}
```

The Express route `await`s these functions before sending the HTTP response.

## Console logging for learning

When you use the UI, watch the terminal where `npm run dev` runs:

```
>> input
{ url: 'https://...' }
<< Wallet address details
{ id: '...', authServer: '...', resourceServer: '...' }
```

This helps you connect **form inputs** → **SDK calls** → **API responses**.

## Practice

1. Add `console.log("Server starting...")` at the top of `server.ts`, save, and confirm the message appears when the server restarts.
2. Call `GET http://localhost:3001/api/health` in a browser and read the JSON (uptime, memory).

## Next

Understand HTTP API design in [Part 6: RESTful APIs](06-restful-apis.md).

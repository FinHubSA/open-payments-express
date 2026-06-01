# Part 6: RESTful APIs

A **RESTful API** exposes resources over HTTP using standard methods and URLs. This app's Express server is a REST-style wrapper around the Open Payments SDK—the browser talks to **your** server, and your server talks to **Open Payments** servers.

## REST basics

| Concept            | Example in this repo                                           |
| ------------------ | -------------------------------------------------------------- |
| **Resource**       | Wallet address, grant, incoming payment                        |
| **URL (endpoint)** | `/api/wallet-address_get`, `/api/incoming-payment_create`      |
| **HTTP method**    | Mostly `POST` (with JSON body); `GET` for health and home page |
| **Request body**   | JSON with input parameters                                     |
| **Response body**  | JSON with `{ "data": ... }` or `{ "error": ... }`              |
| **Status code**    | `200` success, `404` not found, `500` server error             |

REST is not a strict standard but a set of conventions: use nouns in URLs, use HTTP methods meaningfully, return structured JSON.

## This project's API map

Open [`server.ts`](../server.ts) and find the `// ============== ENDPOINTS ==============` section.

| Local endpoint                        | Service function            | Open Payments concept     |
| ------------------------------------- | --------------------------- | ------------------------- |
| `POST /api/wallet-address_get`        | `walletAddress()`           | Look up a wallet address  |
| `POST /api/grant_request`             | `grantRequest()`            | Request authorization     |
| `POST /api/grant_continue`            | `continueAccess()`          | Finish pending grant      |
| `POST /api/grant_cancel`              | `cancelAccess()`            | Cancel grant              |
| `POST /api/token_rotate`              | `tokenRotate()`             | Rotate access token       |
| `POST /api/token_revoke`              | `tokenRevoke()`             | Revoke access token       |
| `POST /api/incoming-payment_create`   | `incomingPayment()`         | Create receive payment    |
| `POST /api/incoming-payment_get`      | `getIncomingPayment()`      | Read incoming payment     |
| `POST /api/incoming-payment_complete` | `completeIncomingPayment()` | Complete incoming payment |
| `POST /api/incoming-payment_list`     | `listIncomingPayments()`    | List incoming payments    |
| `POST /api/quote_create`              | `quote()`                   | Create quote              |
| `POST /api/quote_get`                 | `getQuote()`                | Read quote                |
| `POST /api/outgoing-payment_create`   | `outgoingPayment()`         | Send payment              |
| `POST /api/outgoing-payment_get`      | `getOutgoingPayment()`      | Read outgoing payment     |
| `POST /api/outgoing-payment_list`     | `listOutgoingPayments()`    | List outgoing payments    |
| `GET /api/health`                     | (inline)                    | Server health check       |

## Example: one request end-to-end

### 1. Browser sends REST request

```http
POST /api/wallet-address_get HTTP/1.1
Host: localhost:3001
Content-Type: application/json

{
  "url": "https://ilp.interledger.dev/alice"
}
```

From `public/script.js` (via Axios):

```javascript
axios.post("/api/wallet-address_get", { url: "https://..." });
```

### 2. Express route handles it

From `server.ts`:

```typescript
app.post("/api/wallet-address_get", async (req, res) => {
  const input = req.body;
  try {
    const result = await walletAddress(input);
    return res.status(200).json({ data: result });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});
```

- `req.body` — parsed JSON from the client
- `res.status(200).json(...)` — REST response

### 3. Service calls Open Payments (external API)

From `services/open-payments.ts`:

```typescript
const walletAddressDetails = await client.walletAddress.get({ url: input.url });
return walletAddressDetails;
```

The SDK signs the request and calls the real Open Payments wallet address server on the internet.

### 4. Response returns to the browser

```json
{
  "data": {
    "id": "https://...",
    "authServer": "https://...",
    "resourceServer": "https://...",
    "assetCode": "USD",
    "assetScale": 2
  }
}
```

## Why POST for everything?

Open Payments operations often need complex JSON bodies (grants, amounts, tokens). This demo uses `POST` with a JSON body for all actions—even "get" operations—so the UI can use the same form pattern.

In other APIs you might see:

- `GET /users/123` — read
- `POST /users` — create
- `PUT /users/123` — update
- `DELETE /users/123` — delete

## Testing APIs without the UI

### Browser

Visit `http://localhost:3001/api/health`

### curl (terminal)

```bash
curl -X POST http://localhost:3001/api/wallet-address_get \
  -H "Content-Type: application/json" \
  -d '{"url": "https://ilp.interledger.dev/alice"}'
```

Replace the URL with a valid test wallet address from your `.env` setup.

## Error responses

| Status | When                                                |
| ------ | --------------------------------------------------- |
| `200`  | Success — body has `{ "data": ... }`                |
| `404`  | Unknown path — see `availableEndpoints` in response |
| `500`  | SDK or network error — body has `{ "error": ... }`  |

Read the server terminal for detailed error logs.

## Practice

1. Call `/api/health` and note `uptime` and `memory`.
2. Use the UI to call `wallet-address_get`, then find the same `>> input` and `<< Wallet address details` logs in the terminal.
3. Match fields in the UI response to the [README API reference](../README.md#open-payments-api-reference).

## Next

Learn how Express wires routes and middleware in [Part 7: Express.js](07-expressjs.md).

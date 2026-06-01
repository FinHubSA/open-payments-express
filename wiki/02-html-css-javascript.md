# Part 2: HTML, CSS, and JavaScript

The browser UI of this project is built with three core web technologies. Open the files side by side in VS Code while you read this section.

| File                                        | Role                   |
| ------------------------------------------- | ---------------------- |
| [`index.html`](../index.html)               | Structure and content  |
| [`public/styles.css`](../public/styles.css) | Visual design          |
| [`public/script.js`](../public/script.js)   | Behavior and API calls |

## HTML — structure

HTML (HyperText Markup Language) defines the **structure** of a page: headings, buttons, forms, and layout containers.

Open [`index.html`](../index.html). Notice:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Open Payments Playground</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <div class="header p-2">...</div>
    <div class="container">...</div>
  </body>
</html>
```

Key concepts:

- **`<head>`** — metadata, title, links to CSS and external libraries (Bootstrap, Axios)
- **`<body>`** — visible content
- **`<div>`** — generic container; `class` attributes hook into CSS and JavaScript
- **Accordion sections** — each Open Payments API has a collapsible panel with a form and submit button

Example from this project — a wallet address API section:

```html
<span class="badge bg-primary method-badge">GET</span>
<code class="text-muted">/wallet-address_get</code>
<button id="wallet-address_get-submit">Send</button>
```

The `id` on the button is how JavaScript attaches a click handler.

## CSS — presentation

CSS (Cascading Style Sheets) controls **colors, spacing, fonts, and layout**.

Open [`public/styles.css`](../public/styles.css). You might see rules like:

```css
.header {
  /* styles for the top banner */
}

.left-panel {
  /* styles for the API list */
}
```

This project also uses [Bootstrap 5](https://getbootstrap.com/) from a CDN in `index.html` for grids, buttons, and accordions. Bootstrap classes (e.g. `d-flex`, `btn-primary`) work alongside custom rules in `styles.css`.

### Practice

Change the font or background in `styles.css`, save, and refresh the browser.

## JavaScript — behavior

JavaScript makes the page **interactive**: load JSON schemas, build forms, send API requests, show responses.

Open [`public/script.js`](../public/script.js). Important patterns in this repo:

### 1. Fetching a schema and building a form

The app loads `public/schemas/wallet-address_get.json` and renders input fields automatically.

### 2. Calling the backend with Axios

```javascript
// Simplified pattern from this project
const response = await axios.post("/api/wallet-address_get", formData);
// response.data.data contains the Open Payments result
```

Axios is included from a CDN in `index.html`. It sends HTTP POST requests to the Express server.

### 3. Displaying JSON results

Responses from the server are shown in a JSON viewer so you can study API output fields.

## How the three layers work together

```
index.html     →  defines buttons and containers
styles.css     →  makes it readable and organized
script.js      →  on "Send", POSTs to server.ts routes
```

Flow when you click **Send** on "Get wallet address":

1. `script.js` collects form values into a JSON object `{ "url": "..." }`
2. POST to `http://localhost:3001/api/wallet-address_get`
3. Express calls `walletAddress()` in `services/open-payments.ts`
4. Response JSON is displayed in the UI

## Practice exercises

1. In `index.html`, change the subtitle text under the logo.
2. In `styles.css`, adjust padding or colors on `.header`.
3. In `script.js`, find where API history is stored and read how responses are rendered.

## Next

Learn how dependencies are managed in [Part 3: NPM](03-npm.md).

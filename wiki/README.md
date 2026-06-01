# Web Development Learning Path

Welcome! This wiki teaches web development fundamentals using the **[Open Payments Express](https://github.com/FinHubSA/open-payments-express)** repository as a hands-on example throughout.

The structure is inspired by the [Full Stack Developer Roadmap](https://roadmap.sh/full-stack?fl=1): you will learn tools and front-end basics first, then back-end concepts with Node.js, REST, and Express—the same stack this project uses.

## Learning path

| Part | Topic | What you'll do in this repo |
|------|--------|------------------------------|
| [1](01-visual-studio-code.md) | Visual Studio Code | Install VS Code, extensions, auto-save, formatting, IntelliSense |
| [2](02-html-css-javascript.md) | HTML, CSS, JavaScript | Read `index.html`, `public/styles.css`, `public/script.js` |
| [3](03-npm.md) | NPM | Run `npm install`, understand `package.json` scripts |
| [4](04-git-and-github.md) | Git & GitHub | Fork, clone, branch, commit a small change |
| [5](05-nodejs.md) | Node.js | Understand how `server.ts` runs on Node |
| [6](06-restful-apis.md) | RESTful APIs | Explore `/api/*` routes in `server.ts` |
| [7](07-expressjs.md) | Express.js | Middleware, routes, static files, error handling |

## Prerequisites

- A computer with macOS, Windows, or Linux
- Internet access
- A [GitHub](https://github.com) account (free)

## Recommended order

1. Complete **Part 1** (VS Code) before writing code.
2. Work through **Parts 2–4** to understand the frontend and version control.
3. Complete **Parts 5–7** to understand how this app's backend works.
4. Return to the main [README](../README.md) Open Payments API reference and experiment with the UI at `http://localhost:3001`.

## What is a full stack developer?

A full stack developer works on both the **front end** (what users see in the browser) and the **back end** (servers, APIs, data). This repository is a small full stack app:

- **Front end:** `index.html`, `public/styles.css`, `public/script.js`
- **Back end:** `server.ts`, `services/open-payments.ts`

You do not need to master everything at once. Use each part as a reference while building and modifying this project.

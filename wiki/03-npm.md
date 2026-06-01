# Part 3: NPM (Node Package Manager)

**NPM** installs and manages JavaScript libraries for Node.js projects. When you ran `npm install` on this repository, NPM downloaded Express, the Open Payments SDK, and other packages into `node_modules/`.

## package.json

The file [`package.json`](../package.json) describes the project:

```json
{
  "name": "open-payments-express-backend",
  "scripts": {
    "generate:schema": "tsx scripts/generate-schemas.ts",
    "build": "npm run generate:schema && tsc",
    "start": "node dist/server.js",
    "dev": "npm run generate:schema && tsx watch --include './**/*.ts' server.ts"
  },
  "dependencies": {
    "@interledger/open-payments": "^7.1.3",
    "express": "^4.21.2",
    "cors": "^2.8.5"
  }
}
```

| Field | Meaning |
|-------|---------|
| `name` | Project identifier |
| `scripts` | Commands you run with `npm run <name>` |
| `dependencies` | Packages required at runtime |
| `devDependencies` | Packages only needed for development (TypeScript, `tsx`) |

## Common commands (use in this repo)

```bash
# Install all dependencies from package.json
npm install

# Start development server (generates schemas + watches TypeScript)
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Regenerate JSON schemas only
npm run generate:schema
```

## node_modules

After `npm install`, the `node_modules/` folder contains thousands of files—**do not edit them**. They are listed in `.gitignore` and are recreated on each machine from `package.json` and `package-lock.json`.

## package-lock.json

[`package-lock.json`](../package-lock.json) locks exact versions of every dependency so everyone on the team gets the same installs. Commit this file to Git.

## How this project uses NPM packages

| Package | Used for |
|---------|----------|
| `express` | HTTP server in `server.ts` |
| `@interledger/open-payments` | Open Payments SDK in `services/open-payments.ts` |
| `cors` | Allow browser requests from the UI |
| `dotenv` | Load `.env` configuration |
| `tsx` | Run TypeScript directly in development |
| `typescript` | Compile `.ts` to `.js` for production |

## Adding a package (optional)

If you later need a new library:

```bash
npm install package-name
```

NPM updates `package.json` and `package-lock.json` automatically.

## Practice

1. Open `package.json` and read each script.
2. Run `npm run dev` and confirm the server starts on port 3001.
3. Run `npm run generate:schema` and check that files in `public/schemas/` update.

## Next

Learn version control in [Part 4: Git and GitHub](04-git-and-github.md).

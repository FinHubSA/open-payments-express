# Part 1: Visual Studio Code

[Visual Studio Code](https://code.visualstudio.com/) (VS Code) is the editor used throughout this workshop. You will use it to read code, run the terminal, and debug the Open Payments Express app.

## Install VS Code

1. Go to [https://code.visualstudio.com/](https://code.visualstudio.com/)
2. Download the installer for your operating system
3. Run the installer and follow the prompts
4. Launch VS Code

## Open this project

1. In VS Code, choose **File → Open Folder**
2. Select the `open-payments-express` folder you cloned
3. The Explorer sidebar (left) shows the project files: `server.ts`, `index.html`, `services/`, `public/`, etc.

## Essential extensions

Extensions add language support, formatting, and Git integration. Install them from the Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`).

| Extension    | ID                       | Why you need it                         |
| ------------ | ------------------------ | --------------------------------------- |
| **ESLint**   | `dbaeumer.vscode-eslint` | Highlights JavaScript/TypeScript issues |
| **Prettier** | `esbenp.prettier-vscode` | Formats code consistently               |
| **DotENV**   | `mikestead.dotenv`       | Syntax highlighting for `.env` files    |

To install: search the extension name → click **Install**.

## Auto-save

Auto-save prevents losing work when you forget to save.

1. **File → Preferences → Settings** (or `Cmd+,` / `Ctrl+,`)
2. Search for `auto save`
3. Set **Files: Auto Save** to `afterDelay` (saves shortly after you stop typing)

## Auto-formatting on save

Format TypeScript and JSON when you save a file:

1. Open Settings and search for `format on save`
2. Enable **Editor: Format On Save**
3. Search for `default formatter` and set **Editor: Default Formatter** to **Prettier**

Create a `.prettierrc` in the project root if your team uses specific rules (optional for this workshop).

## IntelliSense

**IntelliSense** is VS Code's code completion and inline documentation. It works automatically for TypeScript in this project.

Try it in `services/open-payments.ts`:

1. Open the file
2. Type `client.` after `getAuthenticatedClient()` — you should see methods like `walletAddress`, `grant`, `incomingPayment`
3. Hover over `WalletAddress` to see type information

IntelliSense depends on:

- TypeScript types from `@interledger/open-payments` in `node_modules`
- `tsconfig.json` in the project root

If completions do not appear, run `npm install` in the integrated terminal.

## Integrated terminal

The terminal runs commands inside VS Code:

- **View → Terminal** or `` Ctrl+` `` / `` Cmd+` ``

From here you will run:

```bash
npm install
npm run dev
git status
```

## Practice exercise

1. Open `public/styles.css`
2. Change a color (e.g. search for a hex color and adjust it)
3. Save the file (or rely on auto-save)
4. With `npm run dev` running, refresh [http://localhost:3001](http://localhost:3001) and see the change

## Next

Continue to [Part 2: HTML, CSS, and JavaScript](02-html-css-javascript.md).

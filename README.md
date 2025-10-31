# Open Payments Express App

A lightweight application to show the Open Payments API functions.

## Requirements

Before you begin, you need to install the following tools:

- [Visual Studio Code](https://code.visualstudio.com/)
- [Node (>= v18.18)](https://nodejs.org/en/download/)
- [Git](https://git-scm.com/downloads)

## 🚀 Quickstart

### 1. Clone the repository

Open `Visual Studio Code` and open a `terminal` in your Visual Studio Code. Then run this command below:

```bash
git clone https://github.com/FinHubSA/open-payments-express.git
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup `.env` file

- Follow this tutorial to setup your [test wallet](https://openpayments.dev/sdk/before-you-begin/)
- Create a new `.env` file, right next to the `.env.example` and copy all code from `.env.example` to `.env`.
- Copy key ID and the wallet address into the `.env` file.
- Put the private key in the root folder i.e. open-payments-express/private.key.
  > Note: The private key file was saved and generated automatically when you created `Developer Keys` for your wallet address.

### 4. Start the Server

```bash
# Development mode with auto-restart
npm run dev
```

This command does two things:

- Runs `ts-node scripts/generate-schemas.ts`, which generates JSON schemas from TypeScript type definitions in the `@interledger/open-payments` package. These schemas are used to dynamically render form fields in the UI.
- Starts the development server so you can view the demo.

The server will start on `http://localhost:3001`

## 📂 Project Structure

```
├── openapi/ # JSON Schemas for the different servers (reference only)
│ ├── auth-server.json # Auth server schema
│ ├── resource-server.json # Resource server schema
│ └── wallet-address-server.json # Wallet address server schema
│
├── scripts/ # Build scripts for generating artifacts
│ └── generate-schemas.ts # Generates JSON schemas from TypeScript types
│
├── services/ # Service layer for making Open Payments requests
│ └── open-payments.ts # Implementation of Open Payments API calls
│
├── types/ # Legacy generated types (deprecated)
│ ├── access-incoming.d.ts
│ ├── access-outgoing.d.ts
│ └── ...
│
├── server.ts # Express server with API endpoints
│
├── index.html # The main UI file for displaying the frontend
│
├── public/ # Frontend demo
│ ├── schemas/ # Generated JSON schemas for form rendering
│ │ ├── wallet-address_get.json
│ │ ├── grant_request.json
│ │ ├── grant_continue.json
│ │ ├── grant_cancel.json
│ │ ├── token_rotate.json
│ │ ├── token_revoke.json
│ │ ├── incoming-payment_create.json
│ │ ├── incoming-payment_get.json
│ │ ├── incoming-payment_complete.json
│ │ ├── incoming-payment_list.json
│ │ ├── quote_create.json
│ │ ├── quote_get.json
│ │ ├── outgoing-payment_create.json
│ │ ├── outgoing-payment_get.json
│ │ └── outgoing-payment_list.json
│ │
│ ├── lib/ # JavaScript libraries for the UI
│ │ ├── json-text-editor.min.js # For the <andypf-json-viewer/> element
│ │ └── json-ui-editor.min.js # For rendering HTML forms from schemas
│ │
│ ├── script.js # Logic for rendering forms, submitting requests, and history
│ ├── styles.css # The styling
│ ├── logo.png # Application logo
│ └── favicon.svg # Application favicon
│
└── ... # Other files for the project
```

## 🔧 Schema Generation

The application uses a custom schema generation approach that leverages TypeScript types from the `@interledger/open-payments` package.

### How It Works

The `scripts/generate-schemas.ts` script:

1. **Imports TypeScript types** from `@interledger/open-payments/dist/client/index.d.ts` and `@interledger/open-payments/dist/types.d.ts`
2. **Creates intersection types** by combining multiple TypeScript types (e.g., `ResourceRequestArgs & CreateIncomingPaymentArgs`)
3. **Generates JSON schemas** using `typescript-json-schema` to convert TypeScript types to JSON Schema format
4. **Outputs schemas** to `public/schemas/` for use in the UI forms

### Naming Convention

API endpoint schemas follow this naming pattern:

```
<resource-type>-<route-name>.json
```

Where:

- **`<resource-type>`**: The resource being accessed (e.g., `incoming-payment`, `quote`, `outgoing-payment`)
- **`<route-name>`**: The specific route/method being called from the client routes interface

Examples:

- `wallet-address_get.json` - Get wallet address
- `grant_request.json` - Request a grant
- `incoming-payment_create.json` - Create an incoming payment
- `outgoing-payment_list.json` - List outgoing payments
- `quote_get.json` - Get a quote

This naming convention makes it clear which client route each schema corresponds to.

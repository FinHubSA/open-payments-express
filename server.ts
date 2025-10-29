import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import {
  grantRequest,
  incomingPayment,
  quote,
  outgoingPayment,
  continueAccess,
  tokenRotate,
  tokenRevoke,
  cancelAccess,
  walletAddress,
} from "./services/open-payments";
import {
  GrantOrTokenRequestArgs,
  ResourceRequestArgs,
  type UnauthenticatedResourceRequestArgs,
} from "@interledger/open-payments/dist/client";
import {
  CreateIncomingPaymentArgs,
  CreateOutgoingPaymentArgs,
  CreateQuoteArgs,
  GrantContinuationRequest,
  OutgoingPayment,
  Quote,
  type GrantRequest,
} from "@interledger/open-payments/dist/types";

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "./public")));

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// ============== ENDPOINTS ==============

app.post(
  "/api/wallet-address_get",
  async (req: Request, res: Response): Promise<any> => {
    const input = req.body as UnauthenticatedResourceRequestArgs;

    console.log("** input");
    console.log(input);
    try {
      const result = await walletAddress(input);
      return res.status(200).json({ data: result });
    } catch (err: any) {
      console.error("Error requesting wallet address:", err);
      return res.status(500).json({ error: err });
    }
  }
);

app.post(
  "/api/grant_request",
  async (req: Request, res: Response): Promise<any> => {
    const input = req.body as UnauthenticatedResourceRequestArgs & GrantRequest;

    console.log("** input");
    console.log(input);
    try {
      const result = await grantRequest(input);
      return res.status(200).json({ data: result });
    } catch (err: any) {
      console.error("Error requesting grant:", err);
      return res.status(500).json({ error: err });
    }
  }
);

app.post(
  "/api/grant_continue",
  async (req: Request, res: Response): Promise<any> => {
    const input = req.body as GrantOrTokenRequestArgs &
      GrantContinuationRequest;

    console.log("** input");
    console.log(input);
    try {
      const result = await continueAccess(input);
      return res.status(200).json({ data: result });
    } catch (err: any) {
      console.error("Error continuing grant:", err);
      return res.status(500).json({ error: err });
    }
  }
);

app.post(
  "/api/grant_cancel",
  async (req: Request, res: Response): Promise<any> => {
    const input = req.body as GrantOrTokenRequestArgs;

    console.log("** input");
    console.log(input);
    try {
      const result = await cancelAccess(input);
      return res.status(200).json({ data: result });
    } catch (err: any) {
      console.error("Error canceling grant:", err);
      return res.status(500).json({ error: err });
    }
  }
);

app.post(
  "/api/token_rotate",
  async (req: Request, res: Response): Promise<any> => {
    const input = req.body as GrantOrTokenRequestArgs;

    console.log("** input");
    console.log(input);
    try {
      const result = await tokenRotate(input);
      return res.status(200).json({ data: result });
    } catch (err: any) {
      console.error("Error rotating access token:", err);
      return res.status(500).json({ error: err });
    }
  }
);

app.post(
  "/api/token_revoke",
  async (req: Request, res: Response): Promise<any> => {
    const input = req.body as GrantOrTokenRequestArgs;

    console.log("** input");
    console.log(input);
    try {
      const result = await tokenRevoke(input);
      return res.status(200).json({ data: result });
    } catch (err: any) {
      console.error("Error revoking access token:", err);
      return res.status(500).json({ error: err });
    }
  }
);

app.post(
  "/api/incoming-payment_create",
  async (req: Request, res: Response): Promise<any> => {
    const input = req.body as ResourceRequestArgs & CreateIncomingPaymentArgs;

    console.log("** input");
    console.log(input);
    try {
      const result = await incomingPayment(input);
      return res.status(200).json({ data: result });
    } catch (err: any) {
      console.error("Error creating incoming payment:", err);
      return res.status(500).json({ error: err });
    }
  }
);

app.post(
  "/api/quote_create",
  async (req: Request, res: Response): Promise<any> => {
    const input = req.body as ResourceRequestArgs & CreateQuoteArgs;

    console.log("** input");
    console.log(input);
    try {
      const result = await quote(input);
      return res.status(200).json({ data: result });
    } catch (err: any) {
      console.error("Error creating quote:", err);
      return res.status(500).json({ error: err });
    }
  }
);

app.post(
  "/api/outgoing-payment_create",
  async (req: Request, res: Response): Promise<any> => {
    const input = req.body as ResourceRequestArgs & CreateOutgoingPaymentArgs;

    console.log("** input");
    console.log(input);
    try {
      const result = await outgoingPayment(input);
      return res.status(200).json({ data: result });
    } catch (err: any) {
      console.error("Error creating outgoing payment:", err);
      return res.status(500).json({ error: err });
    }
  }
);
// ============== ERROR HANDLING ==============

// 404
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    error: "Endpoint not found",
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: [
      "GET /",
      "POST /api/wallet-address_get",
      "POST /api/grant_request",
      "POST /api/grant_continue",
      "POST /api/grant_cancel",
      "POST /api/token_rotate",
      "POST /api/token_revoke",
      "POST /api/incoming-payment_create",
      "POST /api/quote_create",
      "POST /api/outgoing-payment_create",
    ],
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);

  res.status(err.status || 500).json({
    error: "Internal Server Error",
    message: err.message || "Something went wrong",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Express server running on http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log("\n📋 Available endpoints:");
  console.log("  POST   /api/wallet-address_get       - Get wallet details");
  console.log(
    "  POST   /api/grant_request            - Request a grant for access token"
  );
  console.log(
    "  POST   /api/grant_continue           - Continue to get an access token from a pending grant"
  );
  console.log("  POST   /api/grant_cancel             - Cancel a grant");
  console.log(
    "  POST   /api/token_rotate             - Rotate an access token"
  );
  console.log(
    "  POST   /api/token_revoke             - Revoke an access token"
  );
  console.log(
    "  POST   /api/incoming-payment_create  - Create an incoming payment resource"
  );
  console.log(
    "  POST   /api/quote_create             - Create a quote resource"
  );
  console.log(
    "  POST   /api/outgoing-payment_create  - Create an outgoing payment resource"
  );
});

export default app;

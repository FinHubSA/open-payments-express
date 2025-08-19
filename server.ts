import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import {
  accessIncoming,
  accessQuote,
  accessOutgoing,
  getAuthenticatedClient,
  incomingPayment,
  quote,
  outgoingPayment,
  continueAccess,
  manageAccessToken,
  cancelAccess,
  walletAddress,
} from "./services/open-payments";
import { IncomingPayment } from "./types/incoming-payment";
import { Quote } from "./types/quote";
import { AccessIncoming } from "./types/access-incoming";
import { AccessQuote } from "./types/access-quote";
import { AccessOutgoing } from "./types/access-outgoing";
import { OutgoingPayment } from "./types/outgoing-payment";
import { Continue } from "./types/continue";
import { ManageAccessToken } from "./types/manage-token";
import { CancelGrant } from "./types/cancel-access";
import { WalletAddress } from "./types/wallet-address";

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
  "/api/wallet-address",
  async (req: Request, res: Response): Promise<any> => {
    const input = req.body as WalletAddress;

    console.log("** input");
    console.log(input);
    try {
      const result = await walletAddress(input);
      return res.status(200).json({ data: result });
    } catch (err: any) {
      console.error("Error requesting grant:", err);
      return res.status(500).json({ error: err });
    }
  }
);

app.post(
  "/api/access-incoming",
  async (req: Request, res: Response): Promise<any> => {
    const input = req.body as AccessIncoming;

    console.log("** input");
    console.log(input);
    try {
      const result = await accessIncoming(input);
      return res.status(200).json({ data: result });
    } catch (err: any) {
      console.error("Error requesting grant:", err);
      return res.status(500).json({ error: err });
    }
  }
);

app.post(
  "/api/access-quote",
  async (req: Request, res: Response): Promise<any> => {
    const input = req.body as AccessQuote;

    console.log("** input");
    console.log(input);
    try {
      const result = await accessQuote(input);
      return res.status(200).json({ data: result });
    } catch (err: any) {
      console.error("Error requesting grant:", err);
      return res.status(500).json({ error: err });
    }
  }
);

app.post(
  "/api/access-outgoing",
  async (req: Request, res: Response): Promise<any> => {
    const input = req.body as AccessOutgoing;

    console.log("** input");
    console.log(input);
    try {
      const result = await accessOutgoing(input);
      return res.status(200).json({ data: result });
    } catch (err: any) {
      console.error("Error requesting grant:", err);
      return res.status(500).json({ error: err });
    }
  }
);

app.post("/api/continue", async (req: Request, res: Response): Promise<any> => {
  const input = req.body as Continue;

  console.log("** input");
  console.log(input);
  try {
    const result = await continueAccess(input);
    return res.status(200).json({ data: result });
  } catch (err: any) {
    console.error("Error requesting grant:", err);
    return res.status(500).json({ error: err });
  }
});

app.post(
  "/api/manage-token",
  async (req: Request, res: Response): Promise<any> => {
    const input = req.body as ManageAccessToken;

    console.log("** input");
    console.log(input);
    try {
      const result = await manageAccessToken(input);
      return res.status(200).json({ data: result });
    } catch (err: any) {
      console.error("Error rotating access token:", err);
      return res.status(500).json({ error: err });
    }
  }
);

app.post(
  "/api/cancel-access",
  async (req: Request, res: Response): Promise<any> => {
    const input = req.body as CancelGrant;

    console.log("** input");
    console.log(input);
    try {
      const result = await cancelAccess(input);
      return res.status(200).json({ data: result });
    } catch (err: any) {
      console.error("Error rotating access token:", err);
      return res.status(500).json({ error: err });
    }
  }
);

app.post(
  "/api/incoming-payment",
  async (req: Request, res: Response): Promise<any> => {
    const input = req.body as IncomingPayment;

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

app.post("/api/quote", async (req: Request, res: Response): Promise<any> => {
  const input = req.body as Quote;

  console.log("** input");
  console.log(input);
  try {
    const result = await quote(input);
    return res.status(200).json({ data: result });
  } catch (err: any) {
    console.error("Error creating quote:", err);
    return res.status(500).json({ error: err });
  }
});

app.post(
  "/api/outgoing-payment",
  async (req: Request, res: Response): Promise<any> => {
    const input = req.body as OutgoingPayment;

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
    availableEndpoints: ["GET /", "POST /api/create-incoming-payment"],
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
  console.log("  POST   /api/wallet-address           - Get wallet details");
  console.log(
    "  POST   /api/create-quote             - Create quote resource on sender account"
  );
  console.log(
    "  POST   /api/access-incoming          - Get a access token to create an incoming payment"
  );
  console.log(
    "  POST   /api/access-quote             - Get a access token to create quote"
  );
  console.log(
    "  POST   /api/access-outgoing          - Get a access token to create an outgoing payment"
  );
  console.log(
    "  POST   /api/continue                 - Continue to get an access token from a pending grant"
  );
  console.log(
    "  POST   /api/manage-token             - Rotate or revoke an access token"
  );

  console.log(
    "  POST   /api/incoming-payment         - Create an incoming payment resource"
  );
  console.log(
    "  POST   /api/quote                    - Create a quote resource"
  );
  console.log(
    "  POST   /api/outgoing-payment -token  - Create an outgoing payment resource"
  );
});

export default app;

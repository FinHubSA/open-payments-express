import dotenv from "dotenv";
import {
  type WalletAddress,
  type Grant,
  createAuthenticatedClient,
} from "@interledger/open-payments";
import { type IncomingPayment } from "../types/incoming-payment";
import { Quote } from "../types/quote";
import { AccessIncoming } from "../types/access-incoming";
import { AccessQuote } from "../types/access-quote";
import { AccessOutgoing } from "../types/access-outgoing";
import { OutgoingPayment } from "../types/outgoing-payment";
import { Continue } from "../types/continue";
import { ManageAccessToken } from "../types/manage-token";
import { CancelGrant } from "../types/cancel-access";
import { WalletAddress as SchemaWalletAddress } from "../types/wallet-address";

dotenv.config({ path: ".env" });

/**
 * Get an authenticated client using details in the .env file
 * @returns
 */
export async function getAuthenticatedClient() {
  let walletAddress = process.env.OPEN_PAYMENTS_CLIENT_ADDRESS;

  if (walletAddress && walletAddress.startsWith("$")) {
    walletAddress = walletAddress.replace("$", "https://");
  }

  const client = await createAuthenticatedClient({
    walletAddressUrl: walletAddress ?? "",
    privateKey: process.env.OPEN_PAYMENTS_SECRET_KEY_PATH ?? "",
    keyId: process.env.OPEN_PAYMENTS_KEY_ID ?? "",
  });

  return client;
}

/**
 * Get details of a wallet address
 * @param input
 * @returns
 */
export async function walletAddress(
  input: SchemaWalletAddress
): Promise<WalletAddress> {
  const client = await getAuthenticatedClient();

  if (input.id && input.id.startsWith("$")) {
    input.id = input.id.replace("$", "https://");
  }

  const walletAddressDetails: WalletAddress = await client.walletAddress.get({
    url: input.id,
  });

  console.log("<< Wallet address details");
  console.log(walletAddressDetails);

  return walletAddressDetails;
}

/**
 * Get an access token to create an incoming payment resource
 * @param input
 * @returns
 */
export async function accessIncoming(input: AccessIncoming) {
  const client = await getAuthenticatedClient();

  // get wallet address details of the client
  const walletAddressDetails = await walletAddress({
    id: process.env.OPEN_PAYMENTS_CLIENT_ADDRESS!,
  });

  // request grant
  const grant = await client.grant.request(
    {
      url: walletAddressDetails.authServer,
    },
    {
      access_token: {
        access: [{ type: input.type, actions: input.actions }],
      },
    }
  );

  return grant;
}

/**
 * Get an access token to create a quote resource
 * @param input
 * @returns
 */
export async function accessQuote(input: AccessQuote) {
  const client = await getAuthenticatedClient();

  // get wallet address details of the client
  const walletAddressDetails = await walletAddress({
    id: process.env.OPEN_PAYMENTS_CLIENT_ADDRESS!,
  });

  // request grant
  const grant = await client.grant.request(
    {
      url: walletAddressDetails.authServer,
    },
    {
      access_token: { access: [{ type: input.type, actions: input.actions }] },
    }
  );

  return grant;
}

/**
 * Get an access token after a pending grant has been accepted by the sender of an outgoing payment
 * @param input
 * @returns
 */
export async function continueAccess(input: Continue) {
  const client = await getAuthenticatedClient();

  // get wallet address details of the client
  const walletAddressDetails = await walletAddress({
    id: process.env.OPEN_PAYMENTS_CLIENT_ADDRESS!,
  });

  // continue grant request
  const grant = (await client.grant.continue(
    {
      accessToken: input.access_token.value,
      url: input.uri,
    },
    {
      interact_ref: input.interact_ref!,
    }
  )) as Grant;

  return grant;
}

/**
 * Get an access token to create an outgoing payment resource
 * This method will return a pending grant which must be authorized by the sender
 * @param input
 * @returns
 */
export async function accessOutgoing(input: AccessOutgoing) {
  const client = await getAuthenticatedClient();

  // get wallet address details of the client
  const walletAddressDetails = await walletAddress({
    id: process.env.OPEN_PAYMENTS_CLIENT_ADDRESS!,
  });

  // request grant
  const grant = await client.grant.request(
    {
      url: walletAddressDetails.authServer,
    },
    {
      access_token: {
        access: [
          {
            identifier: input.identifier,
            type: input.type,
            actions: input.actions,
            limits: input.limits,
          },
        ],
      },
      interact: input.interact,
    }
  );

  return grant;
}

/**
 * This method rotates an access token (used for recurring payments) or revokes an existing access token
 * @param input
 * @returns
 */
export async function manageAccessToken(input: ManageAccessToken) {
  const client = await getAuthenticatedClient();

  // continue grant request
  if (input.action === "rotate") {
    const grant = (await client.token.rotate({
      accessToken: input.access_token,
      url: input.url,
    })) as Grant;

    return grant;
  } else {
    await client.token.revoke({
      accessToken: input.access_token,
      url: input.url,
    });
  }
}

/**
 * This method cancels an existing access token
 * @param input
 * @returns
 */
export async function cancelAccess(input: CancelGrant) {
  const client = await getAuthenticatedClient();

  // cancel grant
  await client.grant.cancel({
    url: input.url!,
    accessToken: input.access_token!,
  });
}

/**
 * Create an incoming payment resource after acquiring the create incoming payment access token
 * @param input
 * @returns
 */
export async function incomingPayment(input: IncomingPayment) {
  const client = await getAuthenticatedClient();

  // get wallet address details of the client
  const walletAddressDetails = await walletAddress({
    id: process.env.OPEN_PAYMENTS_CLIENT_ADDRESS!,
  });

  // create incoming payment
  const incomingPayment = await client.incomingPayment.create(
    {
      url: walletAddressDetails.resourceServer as string,
      accessToken: input.accessToken!,
    },
    {
      walletAddress: input.walletAddress,
      incomingAmount: input.incomingAmount,
      expiresAt: new Date(input.expiresAt!).toISOString(),
    }
  );

  console.log("<< Resource created");
  console.log(incomingPayment);

  return incomingPayment;
}

/**
 *  Create a quote resource after acquiring the create quote access token
 * @param input
 * @returns
 */
export async function quote(input: Quote) {
  const client = await getAuthenticatedClient();

  // get wallet address details of the client
  const walletAddressDetails = await walletAddress({
    id: process.env.OPEN_PAYMENTS_CLIENT_ADDRESS!,
  });

  // create quote
  const quote = await client.quote.create(
    {
      url: walletAddressDetails.resourceServer as string,
      accessToken: input.accessToken!,
    },
    {
      method: input.method,
      walletAddress: input.walletAddress,
      receiver: input.receiver,
    }
  );

  console.log("<< Resource created");
  console.log(quote);

  return quote;
}

/**
 * Create an outgoing payment resource after acquiring the create outgoing payment access token
 * @param input
 * @returns
 */
export async function outgoingPayment(input: OutgoingPayment) {
  const client = await getAuthenticatedClient();

  // get wallet address details of the client
  const walletAddressDetails = await walletAddress({
    id: process.env.OPEN_PAYMENTS_CLIENT_ADDRESS!,
  });

  // create outgoing payment
  const outgoingPayment = await client.outgoingPayment.create(
    {
      url: walletAddressDetails.resourceServer as string,
      accessToken: input.accessToken,
    },
    {
      walletAddress: input.walletAddress,
      quoteId: input.quoteId!,
    }
  );

  console.log("<< Resource created");
  console.log(outgoingPayment);

  return outgoingPayment;
}

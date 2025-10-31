import dotenv from "dotenv";
import {
  type WalletAddress,
  type Grant,
  createAuthenticatedClient,
  type GrantRequest,
  GrantContinuationRequest,
} from "@interledger/open-payments";
import {
  GrantOrTokenRequestArgs,
  ResourceRequestArgs,
  UnauthenticatedResourceRequestArgs,
} from "@interledger/open-payments/dist/client";
import {
  CreateIncomingPaymentArgs,
  CreateOutgoingPaymentArgs,
  CreateQuoteArgs,
} from "@interledger/open-payments/dist/types";

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
  input: UnauthenticatedResourceRequestArgs
): Promise<WalletAddress> {
  const client = await getAuthenticatedClient();

  if (input.url && input.url.startsWith("$")) {
    input.url = input.url.replace("$", "https://");
  }

  const walletAddressDetails: WalletAddress = await client.walletAddress.get({
    url: input.url,
  });

  console.log("<< Wallet address details");
  console.log(walletAddressDetails);

  return walletAddressDetails;
}

/**
 * Get an access token to create a resource on the resource server
 * @param input
 * @returns
 */
export async function grantRequest(
  input: UnauthenticatedResourceRequestArgs & GrantRequest
) {
  const client = await getAuthenticatedClient();

  // get wallet address details of the client
  const walletAddressDetails = await walletAddress({
    url: process.env.OPEN_PAYMENTS_CLIENT_ADDRESS!,
  });

  // request grant
  const grant = await client.grant.request(
    {
      url: walletAddressDetails.authServer,
    },
    {
      ...{ access_token: input.access_token },
      ...(input.interact && { interact: input.interact }),
    }
  );

  return grant;
}

/**
 * Get an access token after a pending grant has been accepted by the sender of an outgoing payment
 * @param input
 * @returns
 */
export async function continueAccess(
  input: GrantOrTokenRequestArgs & GrantContinuationRequest
) {
  const client = await getAuthenticatedClient();

  // get wallet address details of the client
  const walletAddressDetails = await walletAddress({
    url: process.env.OPEN_PAYMENTS_CLIENT_ADDRESS!,
  });

  // continue grant request
  const grant = (await client.grant.continue(
    {
      accessToken: input.accessToken!,
      url: input.url,
    },
    {
      interact_ref: input.interact_ref!,
    }
  )) as Grant;

  return grant;
}

/**
 * This method rotates an access token (used for recurring payments)
 * @param input
 * @returns
 */
export async function tokenRotate(input: GrantOrTokenRequestArgs) {
  const client = await getAuthenticatedClient();

  const grant = (await client.token.rotate({
    accessToken: input.accessToken!,
    url: input.url,
  })) as Grant;

  return grant;
}

/**
 * This method revokes an existing access token
 * @param input
 * @returns
 */
export async function tokenRevoke(input: GrantOrTokenRequestArgs) {
  const client = await getAuthenticatedClient();

  const result = await client.token.revoke({
    accessToken: input.accessToken!,
    url: input.url,
  });

  return result;
}

/**
 * This method cancels an existing access token
 * @param input
 * @returns
 */
export async function cancelAccess(input: GrantOrTokenRequestArgs) {
  const client = await getAuthenticatedClient();

  // cancel grant
  await client.grant.cancel({
    url: input.url!,
    accessToken: input.accessToken!,
  });
}

/**
 * Create an incoming payment resource after acquiring the create incoming payment access token
 * @param input
 * @returns
 */
export async function incomingPayment(
  input: ResourceRequestArgs & CreateIncomingPaymentArgs
) {
  const client = await getAuthenticatedClient();

  // get wallet address details of the client
  const walletAddressDetails = await walletAddress({
    url: process.env.OPEN_PAYMENTS_CLIENT_ADDRESS!,
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
 * Get an incoming payment resource
 * @param input
 * @returns
 */
export async function getIncomingPayment(input: ResourceRequestArgs) {
  const client = await getAuthenticatedClient();

  // get wallet address details of the client
  const walletAddressDetails = await walletAddress({
    url: process.env.OPEN_PAYMENTS_CLIENT_ADDRESS!,
  });

  const incomingPayment = await client.incomingPayment.get({
    url: input.url,
    accessToken: input.accessToken!,
  });

  console.log("<< Incoming payment retrieved");
  console.log(incomingPayment);

  return incomingPayment;
}

/**
 * Complete an incoming payment resource
 * @param input
 * @returns
 */
export async function completeIncomingPayment(input: ResourceRequestArgs) {
  const client = await getAuthenticatedClient();

  // get wallet address details of the client
  const walletAddressDetails = await walletAddress({
    url: process.env.OPEN_PAYMENTS_CLIENT_ADDRESS!,
  });

  const completedPayment = await client.incomingPayment.complete({
    url: input.url,
    accessToken: input.accessToken!,
  });

  console.log("<< Incoming payment completed");
  console.log(completedPayment);

  return completedPayment;
}

/**
 * List incoming payment resources
 * @param input
 * @returns
 */
export async function listIncomingPayments(input: any) {
  const client = await getAuthenticatedClient();

  // get wallet address details of the client
  const walletAddressDetails = await walletAddress({
    url: process.env.OPEN_PAYMENTS_CLIENT_ADDRESS!,
  });

  const {
    accessToken,
    url,
    walletAddress: inputWalletAddress,
    ...listArgs
  } = input;

  const incomingPayments = await client.incomingPayment.list(
    {
      url: walletAddressDetails.resourceServer as string,
      accessToken: accessToken!,
      walletAddress: inputWalletAddress || walletAddressDetails.id,
    },
    listArgs
  );

  console.log("<< Incoming payments listed");
  console.log(incomingPayments);

  return incomingPayments;
}

/**
 *  Create a quote resource after acquiring the create quote access token
 * @param input
 * @returns
 */
export async function quote(input: ResourceRequestArgs & CreateQuoteArgs) {
  const client = await getAuthenticatedClient();

  // get wallet address details of the client
  const walletAddressDetails = await walletAddress({
    url: process.env.OPEN_PAYMENTS_CLIENT_ADDRESS!,
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
 * Get a quote resource
 * @param input
 * @returns
 */
export async function getQuote(input: ResourceRequestArgs) {
  const client = await getAuthenticatedClient();

  // get wallet address details of the client
  const walletAddressDetails = await walletAddress({
    url: process.env.OPEN_PAYMENTS_CLIENT_ADDRESS!,
  });

  const quoteResult = await client.quote.get({
    url: input.url,
    accessToken: input.accessToken!,
  });

  console.log("<< Quote retrieved");
  console.log(quoteResult);

  return quoteResult;
}

/**
 * Create an outgoing payment resource after acquiring the create outgoing payment access token
 * @param input
 * @returns
 */
export async function outgoingPayment(
  input: ResourceRequestArgs & CreateOutgoingPaymentArgs
) {
  const client = await getAuthenticatedClient();

  // get wallet address details of the client
  const walletAddressDetails = await walletAddress({
    url: process.env.OPEN_PAYMENTS_CLIENT_ADDRESS!,
  });

  const { url, accessToken, ...createArgs } = input;

  // create outgoing payment
  const outgoingPayment = await client.outgoingPayment.create(
    {
      url: walletAddressDetails.resourceServer as string,
      accessToken: accessToken!,
    },
    createArgs
  );

  console.log("<< Resource created");
  console.log(outgoingPayment);

  return outgoingPayment;
}

/**
 * Get an outgoing payment resource
 * @param input
 * @returns
 */
export async function getOutgoingPayment(input: ResourceRequestArgs) {
  const client = await getAuthenticatedClient();

  // get wallet address details of the client
  const walletAddressDetails = await walletAddress({
    url: process.env.OPEN_PAYMENTS_CLIENT_ADDRESS!,
  });

  const outgoingPaymentResult = await client.outgoingPayment.get({
    url: input.url,
    accessToken: input.accessToken!,
  });

  console.log("<< Outgoing payment retrieved");
  console.log(outgoingPaymentResult);

  return outgoingPaymentResult;
}

/**
 * List outgoing payment resources
 * @param input
 * @returns
 */
export async function listOutgoingPayments(input: any) {
  const client = await getAuthenticatedClient();

  // get wallet address details of the client
  const walletAddressDetails = await walletAddress({
    url: process.env.OPEN_PAYMENTS_CLIENT_ADDRESS!,
  });

  const {
    accessToken,
    url,
    walletAddress: inputWalletAddress,
    ...listArgs
  } = input;

  const outgoingPayments = await client.outgoingPayment.list(
    {
      url: walletAddressDetails.resourceServer as string,
      accessToken: accessToken!,
      walletAddress: inputWalletAddress || walletAddressDetails.id,
    },
    listArgs
  );

  console.log("<< Outgoing payments listed");
  console.log(outgoingPayments);

  return outgoingPayments;
}

import fs from "fs";
import path from "path";
import $RefParser from "@apidevtools/json-schema-ref-parser";
import authServerSchema from "../openapi/auth-server.json";
import walletAddressServerSchema from "../openapi/wallet-address-server.json";
import resourceServerSchema from "../openapi/resource-server.json";
import { compileFromFile } from "json-schema-to-typescript";

async function main() {
  /** Wallet Address Server */
  await generateSchema(
    walletAddressServerSchema.components.schemas["wallet-address"],
    walletAddressServerSchema.components,
    "wallet-address"
  );

  /** Auth Server  */
  await generateSchema(
    authServerSchema.components.schemas["access-incoming"],
    authServerSchema.components,
    "access-incoming"
  );

  await generateSchema(
    authServerSchema.components.schemas["access-quote"],
    authServerSchema.components,
    "access-quote"
  );

  await generateSchema(
    authServerSchema.components.schemas["access-outgoing"],
    authServerSchema.components,
    "access-outgoing"
  );

  await generateSchema(
    authServerSchema.components.schemas.continue,
    authServerSchema.components,
    "continue"
  );

  await generateSchema(
    authServerSchema.components.schemas["manage-token"],
    authServerSchema.components,
    "manage-token"
  );

  await generateSchema(
    authServerSchema.components.schemas["cancel-access"],
    authServerSchema.components,
    "cancel-access"
  );

  /** Resource Server  */

  await generateSchema(
    resourceServerSchema.components.schemas["incoming-payment"],
    resourceServerSchema.components,
    "incoming-payment"
  );

  await generateSchema(
    resourceServerSchema.components.schemas.quote,
    resourceServerSchema.components,
    "quote"
  );

  await generateSchema(
    resourceServerSchema.components.schemas["outgoing-payment"],
    resourceServerSchema.components,
    "outgoing-payment"
  );
}

async function generateSchema(
  jsonSchema: object,
  components: object,
  endpoint: string
) {
  const schema = JSON.parse(JSON.stringify(jsonSchema));
  schema.components = components;

  const hydratedGrantRequestSchema = await $RefParser.dereference(schema, {
    mutateInputSchema: false,
  });

  const jsonSchemaOutputPath = path.resolve(
    __dirname,
    `../public/schemas/${endpoint}.json`
  );
  fs.mkdirSync(path.dirname(jsonSchemaOutputPath), { recursive: true });
  fs.writeFileSync(
    jsonSchemaOutputPath,
    JSON.stringify(hydratedGrantRequestSchema, null, 2)
  );

  // generate typescript types
  const typeOutputPath = path.resolve(__dirname, `../types/${endpoint}.d.ts`);
  compileFromFile(`${jsonSchemaOutputPath}`).then((ts) =>
    fs.writeFileSync(typeOutputPath, ts)
  );

  console.log(`✅ Schema generated at ${jsonSchemaOutputPath}`);
  console.log(`✅ Type generated at ${typeOutputPath}`);
}

main().catch((err) => {
  console.error("❌ Failed to generate schema:", err);
  process.exit(1);
});

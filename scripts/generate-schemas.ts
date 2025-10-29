import fs from "fs";
import path from "path";
import $RefParser from "@apidevtools/json-schema-ref-parser";
import * as TJS from "typescript-json-schema";

async function main() {
  /** Wallet Address Server */

  await generateSchemaFromType(
    ["UnauthenticatedResourceRequestArgs"],
    "wallet-address_get"
  );

  /** Auth Server  */

  await generateSchemaFromType(
    ["UnauthenticatedResourceRequestArgs", "GrantRequest"],
    "grant_request"
  );

  await generateSchemaFromType(
    ["GrantOrTokenRequestArgs", "GrantContinuationRequest"],
    "grant_continue"
  );

  await generateSchemaFromType(["GrantOrTokenRequestArgs"], "grant_cancel");

  await generateSchemaFromType(["GrantOrTokenRequestArgs"], "token_rotate");

  await generateSchemaFromType(["GrantOrTokenRequestArgs"], "token_revoke");

  /** Resource Server  */

  await generateSchemaFromType(
    ["ResourceRequestArgs", "CreateIncomingPaymentArgs"],
    "incoming-payment_create"
  );

  await generateSchemaFromType(
    ["ResourceRequestArgs", "CreateQuoteArgs"],
    "quote_create"
  );

  await generateSchemaFromType(
    ["ResourceRequestArgs", "CreateOutgoingPaymentArgs"],
    "outgoing-payment_create"
  );
}

/**
 * Generate JSON schema from TypeScript type definitions (intersection)
 * @param types - Array of TypeScript type/interface names to intersect
 * @param outputFileName - The name of the output schema file (without extension)
 * @param sourceFiles - Array of TypeScript source files containing the type definitions
 */
export async function generateSchemaFromType(
  types: string[],
  outputFileName: string,
  sourceFiles: string[] = [
    "../node_modules/@interledger/open-payments/dist/client/index.d.ts",
    "../node_modules/@interledger/open-payments/dist/types.d.ts",
  ]
): Promise<void> {
  try {
    // Convert relative paths to absolute paths
    const absoluteSourceFiles = sourceFiles.map((file) =>
      path.resolve(__dirname, file)
    );

    // Settings for the schema generator
    const settings: TJS.PartialArgs = {
      required: true,
      noExtraProps: false,
      propOrder: true,
      typeOfKeyword: false,
      constAsEnum: true,
    };

    // Programmatically create the schema
    const program = TJS.getProgramFromFiles(absoluteSourceFiles, {
      skipLibCheck: true,
    });

    // Generate schemas for each type
    const typeSchemas: any[] = [];
    for (const typeName of types) {
      const schema = TJS.generateSchema(program, typeName, settings);
      if (!schema) {
        throw new Error(`Could not generate schema for type: ${typeName}`);
      }
      typeSchemas.push(schema);
    }

    // Create intersection schema using allOf
    let intersectionSchema: any;
    if (typeSchemas.length === 1) {
      // Single type, no need for intersection
      intersectionSchema = typeSchemas[0];
    } else {
      // Multiple types, create intersection using allOf
      intersectionSchema = {
        allOf: typeSchemas,
      };
    }

    // Dereference the schema to resolve all references
    // intersectionSchema = await $RefParser.dereference(intersectionSchema, {
    //   mutateInputSchema: false,
    // });

    // Ensure output directory exists
    const outputPath = path.resolve(
      __dirname,
      `../public/schemas/${outputFileName}.json`
    );
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    // Write the schema to file
    fs.writeFileSync(outputPath, JSON.stringify(intersectionSchema, null, 2));

    const typesStr = types.join(" & ");
    console.log(
      `✅ Schema generated from TypeScript types '${typesStr}' at ${outputPath}`
    );
  } catch (error) {
    console.error(
      `Failed to generate schema from types [${types.join(", ")}]:`,
      error
    );
    throw error;
  }
}

main().catch((err) => {
  console.error("Failed to generate schema:", err);
  process.exit(1);
});

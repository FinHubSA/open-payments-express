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

  await generateSchemaFromType(["ResourceRequestArgs"], "incoming-payment_get");

  await generateSchemaFromType(
    ["ResourceRequestArgs"],
    "incoming-payment_complete"
  );

  await generateSchemaFromType(
    ["CollectionRequestArgs"],
    "incoming-payment_list"
  );

  await generateSchemaFromType(
    ["ResourceRequestArgs", "CreateQuoteArgs"],
    "quote_create"
  );

  await generateSchemaFromType(["ResourceRequestArgs"], "quote_get");

  await generateSchemaFromType(
    ["ResourceRequestArgs", "CreateOutgoingPaymentArgs"],
    "outgoing-payment_create"
  );

  await generateSchemaFromType(["ResourceRequestArgs"], "outgoing-payment_get");

  await generateSchemaFromType(
    ["CollectionRequestArgs"],
    "outgoing-payment_list"
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
  const tempFilePath = path.resolve(
    __dirname,
    `temp-${outputFileName}-${Date.now()}.ts`
  );

  try {
    const moduleClient = "ClientModule";
    const moduleTypes = "TypesModule";

    // Create a helper to check which module contains each type
    // For now, assume client module for Request types and types module for Create/Grant types
    const getTypeReference = (typeName: string) => {
      // Types from client/index.d.ts
      if (typeName.includes("RequestArgs") || typeName.includes("Token")) {
        return `${moduleClient}.${typeName}`;
      }
      // Types from types.d.ts (Grant, Create, etc.)
      return `${moduleTypes}.${typeName}`;
    };

    // Create the temporary TypeScript file with the intersection type
    const tempFileContent = `
import type * as ${moduleClient} from "${sourceFiles[0]}";
import type * as ${moduleTypes} from "${sourceFiles[1]}";

type ${outputFileName.replace(/-/g, "_")}Type = ${types.map(getTypeReference).join(" & ")};

export { ${outputFileName.replace(/-/g, "_")}Type };
`;

    // Write the temporary file
    fs.writeFileSync(tempFilePath, tempFileContent, "utf-8");

    // Convert relative paths to absolute paths
    const absoluteSourceFiles = sourceFiles.map((file) =>
      path.resolve(__dirname, file)
    );
    absoluteSourceFiles.push(tempFilePath);

    // Settings for the schema generator
    const settings: TJS.PartialArgs = {
      required: true,
      noExtraProps: false,
      propOrder: true,
      typeOfKeyword: false,
      constAsEnum: true,
    };

    // Programmatically create the schema from the temporary file
    const program = TJS.getProgramFromFiles(absoluteSourceFiles, {
      skipLibCheck: true,
    });

    // Generate schema from the intersection type
    const finalTypeName = `${outputFileName.replace(/-/g, "_")}Type`;
    const schema = TJS.generateSchema(program, finalTypeName, settings);

    if (!schema) {
      throw new Error(
        `Could not generate schema for intersection type: ${finalTypeName}`
      );
    }

    // Ensure output directory exists
    const outputPath = path.resolve(
      __dirname,
      `../public/schemas/${outputFileName}.json`
    );
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    // Write the schema to file
    fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2));

    const typesStr = types.join(" & ");
    console.log(
      `✅ Schema generated from TypeScript types '${typesStr}' at /public/schemas/${outputFileName}.json`
    );
  } catch (error) {
    console.error(
      `Failed to generate schema from types [${types.join(", ")}]:`,
      error
    );
    throw error;
  } finally {
    // Clean up: delete the temporary file
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
}

main().catch((err) => {
  console.error("Failed to generate schema:", err);
  process.exit(1);
});

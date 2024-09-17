// file imports
const { pluralize, toCamelCase, toSnakeCase } = require("./helper.js");

export default function getModelContent(moduleName) {
  const camelCaseModuleName = toCamelCase(moduleName);
  const snakeCaseModuleName = toSnakeCase(moduleName);
  const pluralSnakeCaseModuleName = pluralize(snakeCaseModuleName);
  return `
// module imports
import { model, Schema } from "mongoose";

// variable initializations

const ${camelCaseModuleName}Schema = new Schema(
  { title: { type: String } },
  { timestamps: true }
);

export default model("${pluralSnakeCaseModuleName}", ${camelCaseModuleName}Schema);
    `;
}

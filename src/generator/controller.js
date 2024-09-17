// file imports
import { pluralize, toCamelCase, toPascalCase } from "./helper.js";

export default function getControllerContent(moduleName) {
  const camelCaseModuleName = toCamelCase(moduleName);
  const pascalCaseModuleName = toPascalCase(moduleName);
  const pluralCamelCaseModuleName = pluralize(camelCaseModuleName);
  const pluralPascalCaseModuleName = pluralize(pascalCaseModuleName);
  return `
// module imports
import { isValidObjectId } from "mongoose";

// file imports
import ${pascalCaseModuleName}Model from "./model.js";
import { ErrorHandler } from "../../middlewares/error-handler.js";

// destructuring assignments

// variable initializations

/**
 * @description Add ${camelCaseModuleName}
 * @param {Object} ${camelCaseModuleName}Obj ${camelCaseModuleName} data
 * @returns {Object} ${camelCaseModuleName} data
 */
export const add${pascalCaseModuleName} = async (${camelCaseModuleName}Obj) => {
  return await ${pascalCaseModuleName}Model.create(${camelCaseModuleName}Obj);
};

/**
 * @description Add ${pluralCamelCaseModuleName}
 * @param {Object[]} ${pluralCamelCaseModuleName}Array ${pluralCamelCaseModuleName} data
 * @returns {Object} ${camelCaseModuleName} data
 */
export const add${pluralPascalCaseModuleName} = async (${pluralCamelCaseModuleName}Array) => {
  return await ${pascalCaseModuleName}Model.create(${pluralCamelCaseModuleName}Array);
};

/**
 * @description Update ${camelCaseModuleName} data
 * @param {String} ${camelCaseModuleName} ${camelCaseModuleName} id
 * @param {Object} ${camelCaseModuleName}Obj ${camelCaseModuleName} data
 * @returns {Object} ${camelCaseModuleName} data
 */
export const update${pascalCaseModuleName}ById = async (${camelCaseModuleName}, ${camelCaseModuleName}Obj) => {
  if (!${camelCaseModuleName}) throw new ErrorHandler("Please enter ${camelCaseModuleName} id!", 400);
  if (!isValidObjectId(${camelCaseModuleName}))
    throw new ErrorHandler("Please enter valid ${camelCaseModuleName} id!", 400);
  const ${camelCaseModuleName}Exists = await ${pascalCaseModuleName}Model.findByIdAndUpdate(
    ${camelCaseModuleName},
    ${camelCaseModuleName}Obj,
    { new: true }
  );
  if (!${camelCaseModuleName}Exists) throw new ErrorHandler("${camelCaseModuleName} not found!", 404);
  return ${camelCaseModuleName}Exists;
};

/**
 * @description Update ${camelCaseModuleName} data
 * @param {Object} query ${camelCaseModuleName} data
 * @param {Object} ${camelCaseModuleName}Obj ${camelCaseModuleName} data
 * @returns {Object} ${camelCaseModuleName} data
 */
export const update${pascalCaseModuleName} = async (query, ${camelCaseModuleName}Obj) => {
  if (!query || Object.keys(query).length === 0)
    throw new ErrorHandler("Please enter query!", 400);
  const ${camelCaseModuleName}Exists = await ${pascalCaseModuleName}Model.findOneAndUpdate(query, ${camelCaseModuleName}Obj, {
    new: true,
  });
  if (!${camelCaseModuleName}Exists) throw new ErrorHandler("${camelCaseModuleName} not found!", 404);
  return ${camelCaseModuleName}Exists;
};

/**
 * @description Update ${pluralCamelCaseModuleName} data
 * @param {Object} query ${camelCaseModuleName} data
 * @param {Object} ${camelCaseModuleName}Obj ${camelCaseModuleName} data
 * @returns {Object} updating result data
 */
export const update${pluralPascalCaseModuleName} = async (query, ${camelCaseModuleName}Obj) => {
  if (!query || Object.keys(query).length === 0)
    throw new ErrorHandler("Please enter query!", 400);
  return await ${pascalCaseModuleName}Model.updateMany(query, ${camelCaseModuleName}Obj);
};

/**
 * @description Delete ${camelCaseModuleName}
 * @param {String} ${camelCaseModuleName} ${camelCaseModuleName} id
 * @returns {Object} ${camelCaseModuleName} data
 */
export const delete${pascalCaseModuleName}ById = async (${camelCaseModuleName}) => {
  if (!${camelCaseModuleName}) throw new ErrorHandler("Please enter ${camelCaseModuleName} id!", 400);
  if (!isValidObjectId(${camelCaseModuleName}))
    throw new ErrorHandler("Please enter valid ${camelCaseModuleName} id!", 400);
  const ${camelCaseModuleName}Exists = await ${pascalCaseModuleName}Model.findByIdAndDelete(${camelCaseModuleName});
  if (!${camelCaseModuleName}Exists) throw new ErrorHandler("${camelCaseModuleName} not found!", 404);
  return ${camelCaseModuleName}Exists;
};

/**
 * @description Delete ${camelCaseModuleName}
 * @param {String} query ${camelCaseModuleName} data
 * @returns {Object} ${camelCaseModuleName} data
 */
export const delete${pascalCaseModuleName} = async (query) => {
  if (!query || Object.keys(query).length === 0)
    throw new ErrorHandler("Please enter query!", 400);
  const ${camelCaseModuleName}Exists = await ${pascalCaseModuleName}Model.findOneAndDelete(query);
  if (!${camelCaseModuleName}Exists) throw new ErrorHandler("${camelCaseModuleName} not found!", 404);
  return ${camelCaseModuleName}Exists;
};

/**
 * @description Delete ${pluralCamelCaseModuleName}
 * @param {String} query ${camelCaseModuleName} data
 * @returns {Object} deletion data
 */
export const delete${pluralPascalCaseModuleName} = async (query) => {
  if (!query || Object.keys(query).length === 0)
    throw new ErrorHandler("Please enter query!", 400);
  return await ${pascalCaseModuleName}Model.deleteMany(query);
};

/**
 * @description Get ${camelCaseModuleName}
 * @param {String} ${camelCaseModuleName} ${camelCaseModuleName} id
 * @returns {Object} ${camelCaseModuleName} data
 */
export const get${pascalCaseModuleName}ById = async (${camelCaseModuleName}) => {
  if (!${camelCaseModuleName}) throw new ErrorHandler("Please enter ${camelCaseModuleName} id!", 400);
  if (!isValidObjectId(${camelCaseModuleName}))
    throw new ErrorHandler("Please enter valid ${camelCaseModuleName} id!", 400);
  const ${camelCaseModuleName}Exists = await ${pascalCaseModuleName}Model.findById(${camelCaseModuleName}).select(
    "-createdAt -updatedAt -__v"
  );
  if (!${camelCaseModuleName}Exists) throw new ErrorHandler("${camelCaseModuleName} not found!", 404);
  return ${camelCaseModuleName}Exists;
};

/**
 * @description Get ${camelCaseModuleName}
 * @param {Object} query ${camelCaseModuleName} data
 * @returns {Object} ${camelCaseModuleName} data
 */
export const get${pascalCaseModuleName} = async (query) => {
  if (!query || Object.keys(query).length === 0)
    throw new ErrorHandler("Please enter query!", 400);
  const ${camelCaseModuleName}Exists = await ${pascalCaseModuleName}Model.findOne(query).select(
    "-createdAt -updatedAt -__v"
  );
  if (!${camelCaseModuleName}Exists) throw new ErrorHandler("${camelCaseModuleName} not found!", 404);
  return ${camelCaseModuleName}Exists;
};

/**
 * @description Get ${pluralCamelCaseModuleName}
 * @param {Object} params ${pluralCamelCaseModuleName} fetching parameters
 * @returns {Object[]} ${pluralCamelCaseModuleName} data
 */
export const get${pluralPascalCaseModuleName} = async (params) => {
  let { limit, page } = params;
  page = page - 1 || 0;
  limit = limit || 10;
  const query = {};
  const [result] = await ${pascalCaseModuleName}Model.aggregate([
    { $match: query },
    { $sort: { createdAt: -1 } },
    { $project: { createdAt: 0, updatedAt: 0, __v: 0 } },
    {
      $facet: {
        totalCount: [{ $count: "totalCount" }],
        data: [{ $skip: page * limit }, { $limit: limit }],
      },
    },
    { $unwind: "$totalCount" },
    {
      $project: {
        totalCount: "$totalCount.totalCount",
        totalPages: { $ceil: { $divide: ["$totalCount.totalCount", limit] } },
        data: 1,
      },
    },
  ]);
  return { data: [], totalCount: 0, totalPages: 0, ...result };
};

/**
 * @description Check ${camelCaseModuleName} existence
 * @param {Object} query ${camelCaseModuleName} data
 * @returns {Boolean} ${camelCaseModuleName} existence status
 */
export const check${pascalCaseModuleName}Existence = async (query) => {
  if (!query || Object.keys(query).length === 0)
    throw new ErrorHandler("Please enter query!", 400);
  return await ${pascalCaseModuleName}Model.exists(query);
};

/**
 * @description Count ${pluralCamelCaseModuleName}
 * @param {Object} query ${camelCaseModuleName} data
 * @returns {Number} ${pluralCamelCaseModuleName} count
 */
export const count${pluralPascalCaseModuleName} = async (query) => {
  if (!query || Object.keys(query).length === 0)
    throw new ErrorHandler("Please enter query!", 400);
  return await ${pascalCaseModuleName}Model.countDocuments(query);
};
    `;
}

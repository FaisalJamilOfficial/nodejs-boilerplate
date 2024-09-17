// file imports
import { pluralize, toCamelCase, toPascalCase } from "./helper.js";

export default function getRouteContent(moduleName) {
  const camelCaseModuleName = toCamelCase(moduleName);
  const pascalCaseModuleName = toPascalCase(moduleName);
  const pluralPascalCaseModuleName = pluralize(pascalCaseModuleName);
  return `
// module imports
import { Router } from "express";

// file imports
import * as ${camelCaseModuleName}Controller from "./controller.js";
import { exceptionHandler } from "../../middlewares/exception-handler.js";
import {
  verifyToken,
  verifyAdmin,
  verifyUser,
} from "../../middlewares/authenticator.js";

// destructuring assignments

// variable initializations
const router = Router();

router.get(
  "/",
  verifyToken,
  verifyUser,
  exceptionHandler(async (req, res) => {
    const { page, limit } = req.query;
    let { keyword } = req.query;
    keyword = keyword?.toString() || "";
    const args = {
      keyword,
      limit: Number(limit),
      page: Number(page),
    };
    const response = await ${camelCaseModuleName}Controller.get${pluralPascalCaseModuleName}(args);
    res.json(response);
  })
);

router
  .route("/admin")
  .all(verifyToken, verifyAdmin)
  .post(
    exceptionHandler(async (req, res) => {
      const { title } = req.body;
      const args = { title };
      const response = await ${camelCaseModuleName}Controller.add${pascalCaseModuleName}(args);
      res.json(response);
    })
  )
  .put(
    exceptionHandler(async (req, res) => {
      let { ${camelCaseModuleName} } = req.query;
      const { title } = req.body;
      const args = { title };
      ${camelCaseModuleName} = ${camelCaseModuleName}?.toString() || "";
      const response = await ${camelCaseModuleName}Controller.update${pascalCaseModuleName}ById(${camelCaseModuleName}, args);
      res.json(response);
    })
  )
  .get(
    exceptionHandler(async (req, res) => {
      const { page, limit } = req.query;
      let { keyword } = req.query;
      keyword = keyword?.toString() || "";
      const args = {
        keyword,
        limit: Number(limit),
        page: Number(page),
      };
      const response = await ${camelCaseModuleName}Controller.get${pluralPascalCaseModuleName}(args);
      res.json(response);
    })
  )
  .delete(
    exceptionHandler(async (req, res) => {
      let { ${camelCaseModuleName} } = req.query;
      ${camelCaseModuleName} = ${camelCaseModuleName}?.toString() || "";
      const response = await ${camelCaseModuleName}Controller.delete${pascalCaseModuleName}ById(${camelCaseModuleName});
      res.json(response);
    })
  );

router.get(
  "/:${camelCaseModuleName}",
  verifyToken,
  verifyAdmin,
  exceptionHandler(async (req, res) => {
    const { ${camelCaseModuleName} } = req.params;
    const response = await ${camelCaseModuleName}Controller.get${pascalCaseModuleName}ById(${camelCaseModuleName});
    res.json(response);
  })
);

export default router;
    `;
}

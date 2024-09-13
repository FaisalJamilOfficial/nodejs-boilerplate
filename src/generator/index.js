// module imports
import fs from "fs";
import path from "path";
import chalk from "chalk";

// file imports
import RouteGenerator from "./route.js";
import ModelGenerator from "./model.js";
import ControllerGenerator from "./controller.js";
import { singularize, toKebabCase } from "./helper.js";

// variable initializations
const __dirname = `${process.cwd()}/src/modules/`;

(function generateModule() {
  try {
    for (let index = 2; index < process.argv.length; index++) {
      let moduleName = process.argv[index];

      if (!moduleName) throw new Error("Module name is required!");

      moduleName = toKebabCase(singularize(moduleName));

      const modulePath = __dirname + moduleName;

      if (fs.existsSync(modulePath)) {
        console.log(
          chalk.blue("Warning: Module already exists ->", moduleName)
        );
        continue;
        // throw new Error("Module already exists!");
      }

      console.log("modulePath", modulePath);
      // make module folder
      fs.mkdirSync(modulePath);

      // make controller file
      fs.appendFileSync(
        path.join(modulePath, "controller.js"),
        ControllerGenerator(moduleName)
      );

      // make model file
      fs.appendFileSync(
        path.join(modulePath, "model.js"),
        ModelGenerator(moduleName)
      );

      // make route file
      fs.appendFileSync(
        path.join(modulePath, "route.js"),
        RouteGenerator(moduleName)
      );

      console.log(
        chalk.green(
          `
Success: Module created successfully -> ${moduleName}
Folder(1): src/modules
Files(3): controller.js, model.js, route.js
`
        )
      );
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();

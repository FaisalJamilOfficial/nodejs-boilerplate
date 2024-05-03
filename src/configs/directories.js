// module imports
import path from "path";

// variable initializations
const __basedir = path.dirname(import.meta.url).toString().replace("configs", "");

export const PUBLIC_DIRECTORY = __basedir + "/public/";

// module imports
import nodeSchedule from "node-schedule";
import { v4 } from "uuid";

// file imports
// import { deactivateElementByName } from "../modules/cron-job/controller";
import { ErrorHandler } from "../middlewares/error-handler.js";

class NodeScheduler {
  constructor() {
    this.nodeSchedule = nodeSchedule;
  }

  /**
   * @description Schedule job
   * @param {Date} time job date time
   * @param {Object} rule job pattern rule
   * @param {Function} func function
   * @returns {Object} scheduler response
   */
  schedule(params) {
    const { time, rule, func } = params;
    let response;
    const name = v4();
    if (time && new Date(time) < new Date())
      throw new ErrorHandler("Time cannot be in the past");
    if (time)
      response = nodeSchedule.scheduleJob(name, time, async () => {
        await func();
        // await deactivateElementByName(name);
      });
    if (rule) response = nodeSchedule.scheduleJob(name, rule, func);
    console.log("-JOB_SCHEDULED-");
    return response;
  }
}
export default NodeScheduler;

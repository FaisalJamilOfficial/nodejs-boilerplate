// module imports
import nodeSchedule from "node-schedule";

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
  async schedule(params) {
    const { time, rule, func } = params;
    let response;
    if (time)
      response = nodeSchedule.scheduleJob(time, async function () {
        await func();
      });
    if (rule)
      response = nodeSchedule.scheduleJob(rule, async function () {
        await func();
      });
    console.log("-JOB_SCHEDULED-");
    return response;
  }
}
export default NodeScheduler;

// module imports
import nodeSchedule from "node-schedule";

class NodeScheduler {
  constructor() {
    this.nodeSchedule = nodeSchedule;
  }

  /**
   * @description Schedule job
   * @param {Date} date job date time
   * @param {Object} rule job pattern rule
   * @param {Function} func function
   * @returns {Object} scheduler response
   */
  async schedule(params) {
    const { date, rule, func } = params;
    let response;
    if (date)
      response = nodeSchedule.scheduleJob(date, async function () {
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

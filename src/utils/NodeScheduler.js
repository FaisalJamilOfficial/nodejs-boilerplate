const node_schedule = require("node-schedule");

class NodeScheduler {
	constructor() {
		this.node_schedule = node_schedule;
	}

	/**
	 * Schedule job
	 * @param {Date} date job date time
	 * @param {object} rule job pattern rule
	 * @param {Function} func function
	 * @returns {object} scheduler response
	 */
	async schedule(parameters) {
		const { date, rule, func } = parameters;
		let response;
		if (date)
			response = node_schedule.scheduleJob(date, async function () {
				await func();
			});
		if (rule)
			response = node_schedule.scheduleJob(rule, async function () {
				await func();
			});
		console.log("-JOB_SCHEDULED-");
		return response;
	}
}
module.exports = NodeScheduler;

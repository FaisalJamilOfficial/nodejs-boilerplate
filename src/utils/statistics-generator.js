// file imports

// destructuring assignments

class StatisticsGenerator {
  /**
   * Generate weekly statistics
   * @param {object} model mongo database model
   * @param {object} query query
   * @param {number} year year number
   * @param {number} month month number
   * @param {number} week week number
   * @returns {object} statistics
   */
  async generateWeeklyStatistics(params) {
    const { model } = params;
    let { query, week, month, year } = params;

    if (!model) return null;

    if (query);
    else query = {};

    const date = new Date();
    if (!year) year = date.getFullYear();
    if (!month) month = date.getMonth() + 1;
    if (!week)
      week = Math.ceil(
        Math.floor(
          (date - new Date(date.getFullYear(), 0, 1)) / (24 * 60 * 60 * 1000)
        ) / 7
      );
    const queryTime = [
      {
        $eq: [
          {
            $year: "$createdAt",
          },
          year,
        ],
      },
      {
        $eq: [
          {
            $month: "$createdAt",
          },
          month,
        ],
      },
      {
        $eq: [
          {
            $week: "$createdAt",
          },
          week,
        ],
      },
    ];

    const data = await model.aggregate([
      { $match: query },
      {
        $match: {
          $expr: {
            $and: queryTime,
          },
        },
      },
      {
        $project: {
          createdAt: 1,
          dayOfMonth: { $dayOfMonth: "$createdAt" },
          week: { $week: "$createdAt" },
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
      },
      {
        $group: {
          _id: {
            dayOfMonth: "$dayOfMonth",
            week: "$week",
            month: "$month",
            year: "$year",
          },
          count: { $count: {} },
        },
      },
      {
        $project: {
          count: 1,
          _id: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.dayOfMonth",
              // hour: 12,
            },
          },
        },
      },
    ]);
    return {
      success: true,
      data,
    };
  }

  /**
   * Generate monthly statistics
   * @param {object} model mongo database model
   * @param {object} query query
   * @param {number} year year number
   * @param {number} month month number
   * @returns {object} statistics
   */
  async generateMonthlyStatistics(params) {
    const { model } = params;
    let { query, month, year } = params;

    if (!model) return null;

    if (query);
    else query = {};

    const date = new Date();
    if (!year) year = date.getFullYear();
    if (!month) month = date.getMonth() + 1;

    const queryTime = [
      {
        $eq: [
          {
            $year: "$createdAt",
          },
          year,
        ],
      },
      {
        $eq: [
          {
            $month: "$createdAt",
          },
          month,
        ],
      },
    ];

    const data = await model.aggregate([
      { $match: query },
      {
        $match: {
          $expr: {
            $and: queryTime,
          },
        },
      },
      {
        $project: {
          createdAt: 1,
          dayOfMonth: { $dayOfMonth: "$createdAt" },
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
      },
      {
        $group: {
          _id: { dayOfMonth: "$dayOfMonth", month: "$month", year: "$year" },
          count: { $count: {} },
        },
      },
      {
        $project: {
          count: 1,
          _id: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.dayOfMonth",
              // hour: 12,
            },
          },
        },
      },
    ]);
    return {
      success: true,
      data,
    };
  }

  /**
   * Generate yearly statistics
   * @param {object} model mongo database model
   * @param {object} query query
   * @param {number} year year number
   * @returns {object} statistics
   */
  async generateYearlyStatistics(params) {
    const { model } = params;
    let { query, year } = params;

    if (!model) return null;

    if (query);
    else query = {};

    const date = new Date();
    if (!year) year = date.getFullYear();

    const queryTime = [
      {
        $eq: [
          {
            $year: "$createdAt",
          },
          year,
        ],
      },
    ];

    const data = await model.aggregate([
      { $match: query },
      {
        $match: {
          $expr: {
            $and: queryTime,
          },
        },
      },
      {
        $project: {
          createdAt: 1,
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
      },
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          count: { $count: {} },
        },
      },
      {
        $project: {
          count: 1,
          _id: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              // day: "$_id.dayOfMonth",
              // hour: 12,
            },
          },
        },
      },
    ]);
    return {
      success: true,
      data,
    };
  }
}

export default StatisticsGenerator;

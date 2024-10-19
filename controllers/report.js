const Expense = require('../models/index');
const sequelize = require('../util/database');
const { Op } = require('sequelize');

exports.getAllReports = async (req, res, next) => {
  try {
    let startDate, endDate;
    const timePeriod = req.query.timePeriod;
    const page = req.query.page || 1;
    const itemsPerPage = req.query.itemsPerPage ? parseInt(req.query.itemsPerPage, 10) : 10;
    const offset = (page - 1) * itemsPerPage;
    const limit = itemsPerPage;

    if (timePeriod === 'daily') {
      startDate = sequelize.literal('CURDATE()');
      endDate = sequelize.literal('CURDATE() + INTERVAL 1 DAY');
    } else if (timePeriod === 'weekly') {
      startDate = sequelize.literal('CURDATE() - INTERVAL WEEKDAY(CURDATE()) DAY');
      endDate = sequelize.literal('CURDATE() + INTERVAL (6 - WEEKDAY(CURDATE())) DAY');
    } else if (timePeriod === 'monthly') {
      startDate = sequelize.literal('CURDATE() - INTERVAL DAYOFMONTH(CURDATE())-1 DAY');
      endDate = sequelize.literal('LAST_DAY(CURDATE())');
    } else if (timePeriod === 'yearly') {
      startDate = sequelize.literal('CURDATE() - INTERVAL DAYOFYEAR(CURDATE())-1 DAY');
      endDate = sequelize.literal('CURDATE() + INTERVAL (365 - DAYOFYEAR(CURDATE())) DAY');
    }

    const expenses = await Expense.findAll({
      attributes: [
        'id',
        'income',
        'expense',
        'Description',
        'category',
        [sequelize.literal('DATE(createdAt)'), 'Date'],
      ],
      where: {
        userId: req.user.id,
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      limit: limit,
      offset: offset,
    });

    const totalExpenses = await Expense.count({
      where: {
          userId: req.user.id,
          createdAt: {
              [Op.between]: [startDate, endDate],
          },
      },
  });

  const totalPages = Math.ceil(totalExpenses / limit);

  res.status(200).json({
      allExpenses: expenses,
      totalPages: totalPages,
      currentPage: page,
  });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('error year', err);
  }
};

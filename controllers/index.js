const Expense = require('../models/index');
const User = require('../models/signup')
const sequelize = require('../util/database')
const S3Services = require('../services/S3services')
const FilesDownloaded = require('../models/filesDownloaded')

exports.getAddExpense = (req, res, next) => {
  res.render('expense/add-expense', {
    pageTitle: 'Add Expense',
    path: '/expense/add-expense'
  });
};

exports.postAddExpense = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const expenseAmount = req.body.expenseAmount;
    const expenseDescription = req.body.expenseDescription;
    const category = req.body.category;
    const userId = req.user.id;

    // Checking if the selected radio button is 'income' or 'expense'
    const isIncome = req.body.Income
    console.log('isincome: ',isIncome)
    // Creating a new expense
    const Details = await Expense.create(
      {
        [isIncome ? 'income' : 'expense']: expenseAmount,
        Description: expenseDescription,
        category: category,
        userId: userId,
      },
      { transaction: t }
    );

    // Updating totalExpense or totalIncome in UserDetails based on the radio button selection
    const user = await User.findByPk(userId, { transaction: t });
    if (user) {
      if (isIncome) {
        user.totalIncome = user.totalIncome + parseInt(expenseAmount);
      } else {
        user.totalExpense = user.totalExpense + parseInt(expenseAmount);
      }
      await user.save({ transaction: t });
    }

    await t.commit();

    res.status(201).json({ newExpenseDetails: Details });
    console.log('Expense added to server');
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
    console.error(err);
  }
};


// Update the getAllExpenses route in your controller
exports.getAllExpenses = async (req, res, next) => {
  try {
    const page = req.query.page || 1; // Get the page from the query parameters or default to 1
    const itemsPerPage = 5;
    const offset = (page - 1) * itemsPerPage;

    const { count, rows: expenses } = await Expense.findAndCountAll({
      where: { userId: req.user.id },
      offset,
      limit: itemsPerPage,
    });

    const totalPages = Math.ceil(count / itemsPerPage);

    res.status(200).json({ expenses, totalPages, currentPage: page });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.downloadExpenses = async (req, res) => {
  try {
    const expenses = await req.user.getExpenses();
    console.log(expenses)
    const stringifiedExpenses = JSON.stringify(expenses);
    const userId = req.user.id
    const filename = `Expense${userId}/${new Date()}.txt`;
    const fileURL = await S3Services.uploadToS3(stringifiedExpenses, filename);
    res.status(200).json({ fileURL, success: true })
  } catch (err){
    console.log(err)
    res.status(500).json({ fileURL: '', success: false, err: err })
  }
}

exports.postFileURLS = async (req, res) => {
  try{
  const fileURL = req.body.fileUrls
  const userId = req.user.id;

  console.log('file url from backend',fileURL)
  const Details = await FilesDownloaded.create(
    { fileURL: fileURL,
      userId: userId }
  )
    res.status(201).json({ newFilesUrlDetails: Details });
    console.log('Files added to server!');
  } catch (err){
    console.log(err)
    res.status(500).json({ success: false, err: err })
  }
}

// Update the getFileURLS route in your controller
exports.getFileURLS = async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 1; // Get the page from the query parameters or default to 1
      const itemsPerPage = 5; // Set the number of items per page
      const offset = (page - 1) * itemsPerPage;

      const files = await FilesDownloaded.findAll({
          where: { userId: req.user.id },
          offset,
          limit: itemsPerPage,
      });
      const totalCount = await FilesDownloaded.count();
      const totalPages = Math.ceil(totalCount / itemsPerPage);

      res.status(200).json({ allFileURLS: files, totalPages, currentPage: page });
  } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, err: err });
  }
};


exports.deleteExpense = async (req, res, next) => {
  const expenseId = req.params.expenseId;
  const t = await sequelize.transaction();

  try {
    // Find the expense to check if it belongs to the logged-in user
    const expense = await Expense.findOne({
      where: { id: expenseId, userId: req.user.id },
      transaction: t
    });

    if (!expense) {
      await t.rollback();
      return res.status(404).json({ message: 'Expense not found or unauthorized' });
    }

    const user = await User.findByPk(req.user.id, { transaction: t });
    if (user) {
      user.totalExpense = user.totalExpense - expense.expenseAmount;
      await user.save({ transaction: t });
    }
    // Only delete the expense if it belongs to the logged-in user
    const result = await Expense.destroy({
      where: { id: expenseId },
      transaction: t
    });

    await t.commit();

    res.status(200).json({ message: 'Expense deleted successfully', result });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err });
  }
};


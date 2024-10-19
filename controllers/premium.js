const Expense = require('../models/index');
const User = require('../models/signup');
const Sequelize = require('sequelize');

exports.showLeaderBoard = async (req, res) => {
    try {
        // Find all expenses and group by unique userId, include UserDetails for user names
        // const leaderboardofusers = await User.findAll({
        //     attributes: [
        //         'id', 'username', 
        //         [Sequelize.fn('SUM', Sequelize.col('expenses.expenseAmount')), 'totalAmount'],
        //     ],
        //     include: [
        //         {
        //             model: Expense,
        //             attributes: [],
        //         },
        //     ],
        //     group: ['user.id'],
        //     order: [['totalAmount', 'DESC']],
        // });

        //final optimized way
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = 5; // Set the number of items per page
        const offset = (page - 1) * itemsPerPage;

        const leaderboardofusers = await User.findAll({
            attributes: [
                'id',
                'username',
                'totalExpense',
            ],
            offset: offset,
            limit: itemsPerPage,
            order: [['totalExpense', 'DESC']],
        });

        const totalCount = await User.count();
        const totalPages = Math.ceil(totalCount / itemsPerPage);

        res.status(200).json({ allLeaderBoardUsers: leaderboardofusers, totalPages, currentPage: page });
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.error(err);
    }
};

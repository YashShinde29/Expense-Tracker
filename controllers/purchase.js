const Razorpay = require('razorpay');
const Order = require('../models/orders');
const User = require('../models/signup')
const dotenv = require('dotenv')
dotenv.config()

exports.isPremiumUser = async (req, res) => {
    try {
        const userDetails = await User.findAll({ where: { id: req.user.id }});
        const premiumStatus = userDetails[0].dataValues.ispremiumuser
        console.log('premiustatus', premiumStatus)
        res.status(200).json({ permuimStatus: premiumStatus });
      } catch (err) {
        res.status(500).json({ error: err });
      }
}
exports.purchasePremium = async (req, res) => {
    try {
        var rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const amount = 1500;
        rzp.orders.create({ amount, currency: "INR" }, (err, order) => {
            if (err) {
                throw new Error('error 1', JSON.stringify(err));
            }

            req.user.createOrder({ orderid: order.id, status: 'PENDING' })
                .then(() => {
                    return res.status(201).json({ order, key_id: rzp.key_id });
                })
                .catch(err => {
                    throw new Error('error 2',err);
                });
        });
    } catch (err) {
        console.log('error 3', err);
        res.status(403).json({ message: 'something went wrong', error: err });
    }
};

exports.updateTransactionStatus = async (req, res) => {
    try {
        console.log('req.body: ', req.body)
        const { payment_id, order_id } = req.body;
        console.log('paymentId and orderID', { payment_id, order_id });

        const order = await Order.findOne({ where: { orderid: order_id } });
        const [orderUpdate, userUpdate] = await Promise.all([
            order.update({ paymentid: payment_id, status: 'SUCCESSFUL' }),
            req.user.update({ ispremiumuser: true })
        ]);

        return res.status(202).json({ success: true, message: "Transaction Successful" });
    } catch (err) {
        console.log(err);
        res.status(403).json({ message: 'something went wrong', error: err });
    }
};


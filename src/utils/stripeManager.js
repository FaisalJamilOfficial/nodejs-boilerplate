const { STRIPE_ID } = require("../services/config");

const stripe = require("stripe")(STRIPE_ID);
const { paymentAccountsModel } = require("../models");

const { PAYMENT_ACCOUNT_TYPES } = require("../configs/enums");
const { STRIPE_ACCOUNT, STRIPE_CUSTOMER } = PAYMENT_ACCOUNT_TYPES;

exports.createCardTokenStripe = async (req, res, next) => {
	try {
		const { number, exp_month, exp_year, cvc, name } = req.body;
		if (!number) return next(new Error("Please enter number!"));
		if (!(typeof exp_month === "number"))
			return next(new Error("Please enter exp_month!"));
		if (!(typeof exp_year === "number"))
			return next(new Error("Please enter exp_year!"));
		if (!cvc) return next(new Error("Please enter cvc!"));
		if (!name) return next(new Error("Please enter name!"));

		const token = await stripe.tokens.create({
			card: {
				number: "4242424242424242",
				exp_month: 4,
				exp_year: 2025,
				cvc: "314",
				name: "Abdullah",
			},
		});
		res.json({ success: true, token });
	} catch (error) {
		next(error);
	}
};

exports.deleteStripeCard = async (req, res, next) => {
	try {
		const { customerId } = req.body;
		if (!customerId) return next(new Error("Please enter customerId!"));
		const response = await stripe.customers.del(customerId);
		res.json({ success: true, response });
	} catch (error) {
		next(error);
	}
};

exports.refundStripeCharge = async (req, res, next) => {
	try {
		const { paymentId } = req.query;
		if (!paymentId) return next(new Error("Please enter paymentId!"));
		const response = await stripe.refunds.create({ charge: paymentId });
		res.json({ success: true, response });
	} catch (error) {
		next(error);
	}
};

exports.saveCard = async (req, res, next) => {
	try {
		const { token, cardHolderName } = req.body;

		if (token) {
		} else return next(new Error("Please enter token!"));

		if (cardHolderName) {
		} else return next(new Error("Please enter cardHolderName!"));

		const existsPaymentAccount = await paymentAccountsModel.exists({
			user: req.user._id,
		});
		let userStripeID;

		if (existsPaymentAccount)
			userStripeID = existsPaymentAccount.account.stripeID;
		else {
			const customer = await stripe.customers.create({ phone: req.user.phone });
			if (customer) userStripeID = customer.id;
			else return next(new Error("Stripe customer creation failed!"));
		}
		const card = await stripe.customers.createSource(userStripeID, {
			source: token,
		});

		if (card) {
			card.cardHolderName = cardHolderName;
			const paymentAccountObj = {
				user: req.user._id,
				type: STRIPE_CUSTOMER,
				account: card,
			};
			const paymentAccount = await paymentAccountsModel.create(
				paymentAccountObj
			);

			return res.status(200).json({
				success: true,
				paymentAccount,
			});
		} else return next(new Error("Stripe source creation failed!"));
	} catch (error) {
		next(error);
	}
};

exports.chargeCard = async (req, res, next) => {
	try {
		const { transaction_amount, token, customer_id, description } = req.body;
		if (transaction_amount) {
		} else return next(new Error("Please enter transaction_amount!"));
		if (token) {
		} else return next(new Error("Please enter token!"));
		if (customer_id) {
		} else return next(new Error("Please enter customer_id!"));
		const payment = await stripe.charges.create({
			customer: customer_id,
			amount: transaction_amount * 100, // Unit: cents
			currency: "usd",
			source: token, // default source
			description, // description
		});
		return res.status(200).json({
			success: true,
			payment,
		});
	} catch (error) {
		next(error);
	}
};
exports.createAccount = async (req, res, next) => {
	try {
		const existsPaymentAccount = await paymentAccountsModel.exists({
			user: req.user._id,
		});
		let userStripeID;

		if (existsPaymentAccount)
			userStripeID = existsPaymentAccount.account.stripeID;
		else {
			const account = await stripe.accounts.create({ email: req.user.email });
			if (account) {
				const paymentAccountObj = {
					user: req.user._id,
					type: STRIPE_ACCOUNT,
					account,
				};
				const paymentAccount = await paymentAccountsModel.create(
					paymentAccountObj
				);

				return res.status(200).json({
					success: true,
					paymentAccount,
				});
			} else return next(new Error("Stripe account creation failed!"));
		}
	} catch (error) {
		next(error);
	}
};

exports.getAllAccounts = async (req, res, next) => {
	try {
		const accounts = await paymentAccountsModel.find({ user: req.user._id });
		return res.status(200).json({
			success: true,
			accounts,
		});
	} catch (error) {
		next(error);
	}
};

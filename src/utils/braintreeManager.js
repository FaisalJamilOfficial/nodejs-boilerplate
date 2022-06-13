const braintree = require("braintree");

const { paymentAccountsModel } = require("../models");
const { BRAINTREE_MERCHANT_ID, BRAINTREE_PUBLIC_KEY, BRAINTREE_PRIVATE_KEY } =
	process.env;

const { PAYMENT_ACCOUNT_TYPES } = require("../configs/enums");
const { BRAINTREE } = PAYMENT_ACCOUNT_TYPES;

const gateway = new braintree.BraintreeGateway({
	environment: braintree.Environment.Sandbox,
	merchantId: BRAINTREE_MERCHANT_ID,
	publicKey: BRAINTREE_PUBLIC_KEY,
	privateKey: BRAINTREE_PRIVATE_KEY,
});

exports.getClientToken = (req, res, next) => {
	try {
		const { customerId } = req.query;
		gateway.clientToken.generate(
			{
				customerId,
			},
			(err, response) => {
				if (err) next(err);
				return res.status(200).json({ clientToken: response.clientToken });
			}
		);
	} catch (error) {
		return next(error);
	}
};

exports.setNonce = async (req, res, next) => {
	const { payment_method_nonce } = req.body;
	if (!payment_method_nonce) {
		return next(new Error("Please enter payment_method_nonce!"));
	}
	try {
		const result = await gateway.customer.create({
			paymentMethodNonce: payment_method_nonce,
		});
		if (result) {
			if (result.customer) {
				const paymentAccountObj = {
					user: req.user._id,
					type: BRAINTREE,
					account: result.customer,
				};
				const paymentAccount = await paymentAccountsModel.create(
					paymentAccountObj
				);
			}
			return res.status(200).json({
				success: true,
				paymentAccount,
			});
		} else return next(new Error("Please enter valid payment method nonce"));
	} catch (error) {
		next(error);
	}
};

exports.checkout = (req, res, next) => {
	const { transaction_amount, device_data, customer_id, nonce } = req.body;
	if (!transaction_amount) {
		return next(new Error("Please enter transaction_amount!"));
	} else if (!device_data) {
		return next(new Error("Please enter device_data!"));
	}
	try {
		gateway.transaction.sale(
			{
				//paymentMethodNonce: nonce,
				amount: transaction_amount,
				customerId: customer_id,
				deviceData: device_data,
				options: {
					submitForSettlement: true,
				},
			},
			(err, result) => {
				if (err) return next(err);
				return res.status(200).json({
					success: true,
					transaction: result,
				});
			}
		);
	} catch (error) {
		next(error);
	}
};
exports.getAllAccounts = async (req, res, next) => {
	try {
		const accounts = await paymentAccountsModel.find({ user: req.use._id });
		return res.status(200).json({
			success: true,
			accounts,
		});
	} catch (error) {
		next(error);
	}
};

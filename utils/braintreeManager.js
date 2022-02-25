const braintree = require("braintree");

const paymentOptionsModel = require("../models/paymentAccounts");
const { BRAINTREE_MERCHANT_ID, BRAINTREE_PUBLIC_KEY, BRAINTREE_PRIVATE_KEY } =
	process.env;

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
				const paymentOption = {
					user: req.user._id,
					customerId: result.customer.id,
					cardType: result.customer.paymentMethods[0].cardType,
					cardHolderName: result.customer.paymentMethods[0].cardHolderName,
					imageUrl: result.customer.paymentMethods[0].imageUrl,
					last4: result.customer.paymentMethods[0].last4,
					token: result.customer.paymentMethods[0].token,
				};
				var customer = await paymentOptionsModel.create(paymentOption);
			}
			return res.status(200).json({
				success: result.success,
				result: result.success ? customer : result.message,
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
					success: result.success,
					result: result.success ? result : result.message,
				});
			}
		);
	} catch (error) {
		next(error);
	}
};
exports.getAllCards = async (req, res, next) => {
	try {
		const cards = await paymentOptionsModel.find({ user: req.user._id });
		return res.status(200).json({
			success: true,
			cards,
		});
	} catch (error) {
		next(error);
	}
};

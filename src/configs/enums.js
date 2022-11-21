exports.CONVERSATION_STATUSES = {
	PENDING: "pending",
	ACCEPTED: "accepted",
	REJECTED: "rejected",
};

exports.MESSAGE_STATUSES = {
	UNREAD: "unread",
	READ: "read",
	DELETED: "deleted",
};

exports.NOTIFICATION_TYPES = {
	NEW_MESSAGE: "new-message",
	NEW_CONVERSATION: "new-conversation",
};

exports.PAYMENT_ACCOUNT_TYPES = {
	BRAINTREE: "braintree",
	STRIPE_CUSTOMER: "stripe-customer",
	STRIPE_ACCOUNT: "stripe-account",
};

exports.GEO_JSON_TYPES = {
	POINT: "Point",
	LINESTRING: "LineString",
	POLYGON: "Polygon",
	MULTIPOINT: "MultiPoint",
	MULTILINESTRING: "MultiLineString",
	MULTIPOLYGON: "MultiPolygon",
};

exports.USER_STATUSES = {
	ACTIVE: "active",
	DELETED: "deleted",
};

exports.USER_TYPES = {
	CUSTOMER: "customer",
	ADMIN: "admin",
	SUPER_ADMIN: "super-admin",
	MULTI: "multi",
};

exports.OTP_TYPES = {
	LOGIN: "login",
	SIGN_UP: "sign-up",
	OTHER: "other",
};

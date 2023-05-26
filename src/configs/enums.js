export const CONVERSATION_STATUSES = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
};

export const MESSAGE_STATUSES = {
  UNREAD: "unread",
  READ: "read",
  DELETED: "deleted",
};

export const NOTIFICATION_TYPES = {
  NEW_MESSAGE: "new_message",
  NEW_CONVERSATION: "new_conversation",
};

export const PAYMENT_ACCOUNT_TYPES = {
  BRAINTREE: "braintree",
  STRIPE_CUSTOMER: "stripe_customer",
  STRIPE_ACCOUNT: "stripe_account",
};

export const GEO_JSON_TYPES = {
  POINT: "Point",
  LINESTRING: "LineString",
  POLYGON: "Polygon",
  MULTIPOINT: "MultiPoint",
  MULTILINESTRING: "MultiLineString",
  MULTIPOLYGON: "MultiPolygon",
};

export const USER_STATUSES = {
  ACTIVE: "active",
  DELETED: "deleted",
};

export const USER_TYPES = {
  CUSTOMER: "customer",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
  MULTI: "multi",
};

export const OTP_TYPES = {
  LOGIN: "login",
  SIGN_UP: "sign_up",
  OTHER: "other",
};

export const ENVIRONMENTS = {
  PRODUCTION: "production",
  DEVELOPMENT: "development",
};

export const NOTIFICATION_STATUSES = {
  UNREAD: "unread",
  READ: "read",
};

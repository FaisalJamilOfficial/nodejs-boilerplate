const { isValidObjectId } = require("mongoose");
const { usersModel, customersModel, adminsModel } = require("../models");
const FilesDeleter = require("../utils/FilesDeleter");

/**
 * Add user
 * @param {string} email user email address
 * @param {string} password user password
 * @param {string} phone user phone number
 * @param {string} type user type
 * @returns {object} user data
 */
exports.addUser = async (params) => {
  const { email, password, phone, type } = params;
  const userObj = {};

  if (email) userObj.email = email;
  if (password) userObj.password = password;
  if (phone) userObj.phone = phone;
  if (type) userObj.type = type;
  const user = await usersModel.create(userObj);
  await user.setPassword(password);

  return {
    success: true,
    data: user,
  };
};

/**
 * Update user
 * @param {string} user user id
 * @param {string} email user email address
 * @param {string} phone user phone number
 * @param {string} password user password
 * @param {string} type user type
 * @param {string} status user status
 * @param {boolean} isOnline user connectivity state
 * @param {object} fcm user fcm
 * @param {string} firstName user first name
 * @param {string} lastName user last name
 * @param {[object]} images user images array
 * @param {[number]} coordinates user location coordinates
 * @param {string} customer customer id
 * @param {string} admin admin id
 * @returns {object} user data
 */
exports.updateUser = async (params) => {
  const {
    user,
    email,
    phone,
    password,
    type,
    status,
    firstName,
    lastName,
    images,
    customer,
    admin,
  } = params;
  let { isOnline, coordinates, fcm } = params;

  if (user);
  else throw new Error("Please enter user id!|||400");
  if (isValidObjectId(user));
  else throw new Error("Please enter valid user id!|||400");

  const userExists = await usersModel
    .findById(user)
    .select("-createdAt -updatedAt -__v");
  if (userExists);
  else throw new Error("User not found!|||404");

  if (email) userExists.email = email;
  if (password) await userExists.setPassword(password);
  if (phone) userExists.phone = phone;
  if (type) userExists.type = type;
  if (status) userExists.status = status;
  if (fcm) {
    if (fcm?.token && fcm?.device) {
      let alreadyExists = false;
      userExists.fcms.forEach((element) => {
        if (element.device === fcm.device) {
          alreadyExists = true;
          element.token = fcm.token;
        }
      });
      if (alreadyExists);
      else userExists.fcms.push({ device: fcm.device, token: fcm.token });
    } else throw new Error("Please enter FCM token and device both!|||400");
  }
  if (isOnline) {
    isOnline = JSON.parse(isOnline);
    if (typeof isOnline === "boolean") userExists.isOnline = isOnline;
  }
  if (firstName) userExists.firstName = firstName;
  if (lastName) userExists.lastName = lastName;
  if (firstName || lastName)
    userExists.name = userExists.firstName + " " + userExists.lastName;
  if (images) {
    if (userExists.image)
      new FilesDeleter().deleteImage({ image: userExists.image });
    userExists.image = images[0].path;
  }
  if (coordinates) {
    if (coordinates?.length === 2)
      userExists.location.coordinates = coordinates;
    else
      throw new Error(
        "Please enter location longitude and latitude both!|||400"
      );
  }

  if (customer)
    if (await customersModel.exists({ _id: customer })) {
      userExists.customer = customer;
      userExists.isCustomer = true;
    } else throw new Error("Customer not found!|||404");
  if (admin)
    if (await adminsModel.exists({ _id: admin })) {
      userExists.admin = admin;
      userExists.isAdmin = true;
    } else throw new Error("Admin not found!|||404");

  await usersModel.updateOne({ _id: userExists._id }, userExists);
  return {
    success: true,
    data: userExists,
  };
};

/**
 * Delete user
 * @param {string} user user id
 * @returns {object} user data
 */
exports.deleteUser = async (params) => {
  const { user } = params;
  if (user);
  else throw new Error("Please enter user id!|||400");
  if (isValidObjectId(user));
  else throw new Error("Please enter valid user id!|||400");
  const userExists = await usersModel.findByIdAndDelete(user);
  if (userExists);
  else throw new Error("user not found!|||404");
  return {
    success: true,
    data: userExists,
  };
};

/**
 * Get user
 * @param {string} user user id
 * @returns {object} user data
 */
exports.getUser = async (params) => {
  const { user, email, phone, googleId, facebookId, twitterId } = params;
  const query = {};
  if (user) query._id = user;
  if (email) query.email = email;
  if (googleId) query.googleId = googleId;
  if (facebookId) query.facebookId = facebookId;
  if (twitterId) query.twitterId = twitterId;
  if (phone) query.phone = phone;
  if (Object.keys(query).length === 0) query._id = null;

  let userExists = await usersModel
    .findOne(query)
    .select("-createdAt -updatedAt -__v");
  if (userExists) userExists = await userExists.populate(userExists.type);
  return {
    success: !!userExists,
    data: userExists,
  };
};

/**
 * Get users
 * @param {string} q users search keyword
 * @param {string} type users type
 * @param {string} user user id not match
 * @param {number} limit users limit
 * @param {number} page users page number
 * @returns {[object]} array of users
 */
exports.getUsers = async (params) => {
  const { q, type, user } = params;
  let { page, limit } = params;
  if (!limit) limit = 10;
  if (!page) page = 0;
  if (page) page = page - 1;
  const query = {};
  if (type) query.type = type;
  if (user) query._id = { $ne: user };
  if (q && q.trim() !== "") {
    query.$or = [
      { email: { $regex: q, $options: "i" } },
      { phone: { $regex: q, $options: "i" } },
      { firstName: { $regex: q, $options: "i" } },
      { lastName: { $regex: q, $options: "i" } },
      { name: { $regex: q, $options: "i" } },
    ];
  }
  const users = await usersModel
    .find(query)
    .populate("customer admin")
    .select("-createdAt -updatedAt -__v")
    .sort({ createdAt: -1 })
    .skip(page * limit)
    .limit(limit);
  const totalCount = await usersModel.find(query).count();
  return {
    success: true,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    data: users,
  };
};

// /**
//  * Get users data
//  * @param {string} user user id
//  * @param {string} q search keyword
//  * @param {number} limit messages limit
//  * @param {number} page messages page number
//  * @param {string} status user status
//  * @param {string} type user type
//  * @returns {[object]} array of users
//  */
// exports.getAllUsers = async (params) => {
//   const { user, q, status, type } = params;
//   let { page, limit } = params;
//   const query = {};
//   if (!limit) limit = 10;
//   if (!page) page = 1;
//   query._id = { $ne: user };
//   if (type) query.type = type;
//   if (status) query.status = status;
//   if (q && q.trim() !== "") {
//     var wildcard = [
//       {
//         $regexMatch: {
//           input: "$firstName",
//           regex: q,
//           options: "i",
//         },
//       },
//       {
//         $regexMatch: {
//           input: "$lastName",
//           regex: q,
//           options: "i",
//         },
//       },
//       {
//         $regexMatch: {
//           input: "$name",
//           regex: q,
//           options: "i",
//         },
//       },
//       {
//         $regexMatch: {
//           input: "$phone",
//           regex: q,
//           options: "i",
//         },
//       },
//       {
//         $regexMatch: {
//           input: "$email",
//           regex: q,
//           options: "i",
//         },
//       },
//     ];
//   }
//   const aggregation = [
//     { $match: query },
//     { $project: { hash: 0, salt: 0, type: 0 } },
//     {
//       $lookup: {
//         from: "customers",
//         localField: "customer",
//         foreignField: "_id",
//         as: "customer",
//       },
//     },
//     { $unwind: { path: "$customer" } },
//     {
//       $match: {
//         $expr: {
//           $and: [
//             {
//               $or: wildcard ?? {},
//             },
//           ],
//         },
//       },
//     },
//     {
//       $facet: {
//         totalCount: [{ $count: "totalCount" }],
//         data: [{ $skip: page * limit }, { $limit: limit }],
//       },
//     },
//     { $unwind: "$totalCount" },
//     {
//       $project: {
//         totalCount: "$totalCount.totalCount",
//         totalPages: {
//           $ceil: {
//             $divide: ["$totalCount.totalCount", limit],
//           },
//         },
//         data: 1,
//       },
//     },
//   ];
//   const users = await usersModel
//     .aggregate(aggregation)
//     .sort({ createdAt: -1 })
//     .skip((page - 1) * limit)
//     .limit(limit);

//   return {
//     success: true,
//     ...users[0],
//   };
// };

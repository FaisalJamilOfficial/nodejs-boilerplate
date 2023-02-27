// module imports
import { isValidObjectId } from "mongoose";

// file imports
import * as models from "../models/index.js";
import FilesDeleter from "../utils/files-deleter.js";

// destructuring assignments
const { usersModel, customersModel, adminsModel } = models;

/**
 * @description Add user
 * @param {String} email user email address
 * @param {String} password user password
 * @param {String} phone user phone number
 * @param {String} type user type
 * @returns {Object} user data
 */
export const addUser = async (params) => {
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
 * @description Update user
 * @param {String} user user id
 * @param {String} email user email address
 * @param {String} phone user phone number
 * @param {String} password user password
 * @param {String} type user type
 * @param {String} status user status
 * @param {Boolean} isOnline user connectivity state
 * @param {Object} fcm user fcm
 * @param {String} firstName user first name
 * @param {String} lastName user last name
 * @param {[object]} images user images array
 * @param {[number]} coordinates user location coordinates
 * @param {String} customer customer id
 * @param {String} admin admin id
 * @returns {Object} user data
 */
export const updateUser = async (params) => {
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
 * @description Delete user
 * @param {String} user user id
 * @returns {Object} user data
 */
export const deleteUser = async (params) => {
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
 * @description Get user
 * @param {String} user user id
 * @returns {Object} user data
 */
export const getUser = async (params) => {
  const { user, email, phone, googleId, facebookId, twitterId } = params;
  const query = {};
  if (user) query._id = user;
  if (email) query.email = email;
  if (googleId) query.googleId = googleId;
  if (facebookId) query.facebookId = facebookId;
  if (twitterId) query.twitterId = twitterId;
  if (phone) query.phone = phone;
  else query._id = null;

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
 * @description Get users
 * @param {String} q users search keyword
 * @param {String} type users type
 * @param {String} user user id not match
 * @param {Number} limit users limit
 * @param {Number} page users page number
 * @returns {[Object]} array of users
 */
export const getUsers = async (params) => {
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
//  * @param {String} user user id
//  * @param {String} q search keyword
//  * @param {Number} limit messages limit
//  * @param {Number} page messages page number
//  * @param {String} status user status
//  * @param {String} type user type
//  * @returns {[Object]} array of users
//  */
// export const getAllUsers = async (params) => {
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

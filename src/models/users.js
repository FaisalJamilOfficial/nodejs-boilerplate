// module imports
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// file imports
import { USER_STATUSES, USER_TYPES, GEO_JSON_TYPES } from "../configs/enums.js";

// destructuring assignments
const { ACTIVE, DELETED } = USER_STATUSES;
const { CUSTOMER, ADMIN, SUPER_ADMIN, MULTI } = USER_TYPES;
const {
  POINT,
  LINESTRING,
  POLYGON,
  MULTIPOINT,
  MULTILINESTRING,
  MULTIPOLYGON,
} = GEO_JSON_TYPES;

// variable initializations
const Schema = mongoose.Schema;
const model = mongoose.model;

const fcm = {
  device: { type: String, required: [true, "Please enter FCM device id!"] },
  token: { type: String, required: [true, "Please enter FCM token!"] },
};

const userSchema = new Schema(
  {
    email: {
      type: String,
      lowercase: true,
      trim: true,
      required: [true, "Please enter email address!"],
      unique: [true, "Email must be unique!"],
      validate: {
        validator: function (v) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address!`,
      },
      index: true,
    },
    password: {
      type: String,
      required: [true, "Please enter password!"],
      minlength: [6, "Password must be at least 6 characters"],
      maxlength: [1024, "Password cannot exceed 1024 characters"],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      index: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    fcms: [fcm],
    location: {
      type: {
        type: String,
        enum: [
          POINT,
          LINESTRING,
          POLYGON,
          MULTIPOINT,
          MULTILINESTRING,
          MULTIPOLYGON,
        ],
        default: POINT,
        required: true,
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
        required: true,
      },
    },
    type: {
      type: String,
      enum: [CUSTOMER, ADMIN, SUPER_ADMIN, MULTI],
      required: [true, "Please enter user type!"],
      index: true,
    },
    status: {
      type: String,
      enum: [ACTIVE, DELETED],
      default: ACTIVE,
      index: true,
    },
    isOnline: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPasswordSet: {
      type: Boolean,
      default: true,
      select: false,
      required: true,
    },
    lastLogin: {
      type: Date,
      select: false,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "customers",
      select: false,
      index: true,
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: "admins",
      select: false,
      index: true,
    },
    isCustomer: {
      type: Boolean,
      select: false,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      select: false,
      default: false,
    },
    googleID: {
      type: String,
      trim: true,
    },
    facebookID: {
      type: String,
      trim: true,
    },
    twitterID: {
      type: String,
      trim: true,
    },
    otp: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.getSignedjwtToken = function () {
  return jwt.sign({ _id: this._id, type: this.type }, process.env.JWT_SECRET);
};

userSchema.methods.populate = async function (field) {
  if (field === SUPER_ADMIN || this.type === SUPER_ADMIN) field = "";
  return await model("users", userSchema)
    .findById(this._id)
    .populate(field ?? this.type);
};

userSchema.methods.setPassword = async function (newPassword) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(newPassword, salt);
  this.save();
};

userSchema.methods.validatePassword = async function (enteredPassword) {
  const userExists = await model("users", userSchema)
    .findById(this._id, { password: 1 })
    .select("+password");
  const isMatched = await bcrypt.compare(enteredPassword, userExists.password);
  return isMatched;
};

export default model("users", userSchema);

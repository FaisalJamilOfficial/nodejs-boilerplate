// module imports
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { model, Schema } from "mongoose";

// file imports
import {
  USER_STATUSES,
  USER_TYPES,
  GEO_JSON_TYPES,
} from "../../configs/enum.js";

// destructuring assignments
const { ACTIVE } = USER_STATUSES;
const { SUPER_ADMIN } = USER_TYPES;
const { POINT } = GEO_JSON_TYPES;

// variable initializations

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
      unique: true,
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
      // required: [true, "Please enter password!"],
      required: true,
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

        enum: Object.values(GEO_JSON_TYPES),
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
      enum: Object.values(USER_TYPES),
      // required: [true, "Please enter user type!"],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUSES),
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
    isEmailVerified: {
      type: Boolean,
      default: true,
      select: false,
      required: true,
    },
    lastLogin: {
      type: Date,
      select: false,
    },
    profile: {
      type: Schema.Types.ObjectId,
      ref: "profiles",
      select: false,
      index: true,
    },
    isAdmin: {
      type: Boolean,
      select: false,
      default: false,
    },
    googleId: {
      type: String,
      trim: true,
    },
    facebookId: {
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
  return jwt.sign(
    { _id: this._id, type: this.type },
    process.env.JWT_SECRET || ""
  );
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
  return await bcrypt.compare(enteredPassword, userExists?.password || "");
};

export default model("users", userSchema);

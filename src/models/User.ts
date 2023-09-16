import { Schema, Document, Model, model } from 'mongoose';
import * as bcrypt from "bcrypt";
import Joi from 'joi';

export interface IUserDocument extends Document {
  userName: string;
  name: string;
  email: string;
  gender: 'male' | 'female';
  bio: string;
  department: string;
  nationality: string;
  avatar: Schema.Types.ObjectId;
  password: string;
  resetToken: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserModel extends Model<IUserDocument> {
  login(email: string, password: string): Promise<IUserDocument>;
}

const UserSchema: Schema<IUserDocument, UserModel> = new Schema(
  {
    email: {
      type: String,
      required: [true, "email is required"],
      lowercase: true,
      trim: true,
      unique: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    userName: {
      type: String,
      unique: true,
      required: [true, 'Please enter a userName!']
    },
    name: {
      type: String,
      required: [true, 'Please enter your full name!']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    password: {
      type: String,
      required: [true, 'Please enter a password'],
      minlength: [6, 'Minimum password length is 6 characters'],
    },
    bio: {
      type: String,
      default: "Your bio goes here."
    },
    department: {
      type: String,
      default: "Your department goes here."
    },
    nationality: {
      type: String,
      default: "Your country goes here."
    },
    avatar: {
      type: Schema.Types.ObjectId,
      ref:"File",
      default: "63f73594ba3c0813a218ff2e"
    },
    resetToken: {
      type: String,
      default: ""
    },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    },
    populate: {
      path: 'avatar',
      model: 'File'
    },
  }
);

// Pre-save hook to hash the password before saving
UserSchema.pre('save', async function(next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Static method to login a user
UserSchema.statics.login = async function(email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error('incorrect password');
  }
  throw Error('incorrect email');
};

const User = model<IUserDocument, UserModel>('User', UserSchema);

export const userValidation = Joi.object({
  email: Joi.string().min(6).required().email().trim().lowercase(),
  password: Joi.string().min(6).required().trim(),
  userName: Joi.string().trim().alphanum().pattern(/^[^\s]+$/).required(),
  name: Joi.string().required().trim(),
  bio: Joi.string().default("Your bio goes here.").trim(),
  department: Joi.string().default("Your department goes here.").trim(),
  nationality: Joi.string().default("Your country goes here.").trim(),
  avatar: Joi.string().hex().length(24),
  favoriteTags: Joi.array().max(5),
  resetToken: Joi.string().default(""),
  gender: Joi.string().valid('male', 'female').required()
});

export default User;

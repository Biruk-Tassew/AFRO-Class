import Joi from 'joi';
import { IUserDocument, userValidation } from './User';
import { Schema, Model, model } from 'mongoose';
import bcrypt from 'bcrypt';

export interface ITeacherDocument extends IUserDocument {
  subject: [string];
}

interface TeacherModel extends Model<ITeacherDocument> {
  login(email: string, password: string): Promise<ITeacherDocument | null>;
}

const TeacherSchema: Schema<ITeacherDocument, TeacherModel> = new Schema(
  {
    subject: {
        type: [String], // An array of strings
        required: true,
    },
  },
  {}
);

export const teacherValidation = userValidation.keys({
  subject: Joi.string().required(),
}).options({ abortEarly: false });

// Custom login method for teachers
TeacherSchema.statics.login = async function (email, password) {
  const teacher = await this.findOne({ email });
  if (teacher) {
    const auth = await bcrypt.compare(password, teacher.password);
    if (auth) {
      return teacher;
    }
  }
  return null;
};

const Teacher = model<ITeacherDocument, TeacherModel>('Teacher', TeacherSchema);

export default Teacher;

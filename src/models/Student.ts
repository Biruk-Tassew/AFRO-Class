import Joi from 'joi';
import { IUserDocument, userValidation } from './User';
import { Schema, Model, model } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IStudentDocument extends IUserDocument {
  grade: number;
}

interface StudentModel extends Model<IStudentDocument> {
  login(email: string, password: string): Promise<IStudentDocument>;
}

const StudentSchema: Schema<IStudentDocument, StudentModel> = new Schema(
  {
    grade: {
      type: Number,
      required: true,
      default: 0.0,
    },
  },
  {}
);

export const studentValidation = userValidation.keys({
  grade: Joi.number().min(0).max(100).required(),
}).options({ abortEarly: false });

// Custom login method for students
StudentSchema.statics.login = async function (email, password) {
  const student = await this.findOne({ email });
  if (student) {
    const auth = await bcrypt.compare(password, student.password);
    if (auth) {
      return student;
    }
  }
  return null;
};

const Student = model<IStudentDocument, StudentModel>('Student', StudentSchema);

export default Student;

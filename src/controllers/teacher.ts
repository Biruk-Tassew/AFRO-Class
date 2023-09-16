import { Request, Response } from 'express';
import Teacher, { ITeacherDocument, teacherValidation } from '../models/Teacher';
import configs from '../config/config';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const maxAge = 30 * 24 * 60 * 60; // 30 days
const jwtSecret = configs.JWT_SECRET;

export const createToken = (teacher: ITeacherDocument) => {
  return jwt.sign({ id: teacher._id }, jwtSecret, {
    expiresIn: maxAge,
  });
};

const teacherController = {
  // Create a new teacher
  signup: async (req: Request, res: Response) => {
    try {
      let { userName, name, email, bio, department, nationality, avatar, password, subject } = req.body;

      const validatedTeacher = await teacherValidation.validateAsync({
        userName,
        name,
        email,
        bio,
        department,
        nationality,
        avatar,
        password,
        subject,
      });

      const teacherByEmail = await Teacher.findOne({ email }).lean().exec();

      if (teacherByEmail) {
        return res
          .status(400)
          .json({
            error: 'That email is already registered',
            message: 'Must provide a unique email',
          })
          .end();
      }

      const teacherByUserName = await Teacher.findOne({ userName }).lean().exec();

      if (teacherByUserName) {
        return res
          .status(400)
          .json({
            error: 'That username is already registered',
            message: 'Must provide a unique username',
          })
          .end();
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newTeacher: ITeacherDocument = new Teacher({
        ...validatedTeacher,
        password: hashedPassword,
      });

      const savedTeacher = await newTeacher.save();

      // Generate and send JWT token
      const token = createToken(savedTeacher);
      res.header('token', token);
      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });

      // Finish registering the teacher and send a success message
      const curTeacher = await Teacher.findOne({ _id: savedTeacher._id })
        .populate('avatar')
        .lean()
        .exec();

      return res
        .status(201)
        .json({
          token: token,
          message: 'Teacher registered successfully!',
          data: curTeacher,
        })
        .end();
    } catch (err: any) {
      if (err.isJoi === true) {
        return res
          .status(400)
          .json({ error: err.details[0].message, message: err.details[0].message })
          .end();
      }
      return res
        .status(400)
        .json({ error: 'Wrong format of user info sent.', message: err.message })
        .end();
    }
  },

  // Teacher login
  teacherLogin: async (req: Request, res: Response) => {
    try {
      let { email, password } = req.body;
      email = email.trim();
      password = password.trim();

      if (email === null || password === null || email === '' || password === '') {
        return res
          .status(400)
          .json({ error: 'Wrong format of teacher info sent.', message: 'Must provide Email and password.' })
          .end();
      }

      const teacher: ITeacherDocument | null = await Teacher.login(email, password);

      if (!teacher) {
        return res.status(400).json({ error: 'Wrong Teacher credentials.', message: 'Invalid Email or password.' }).end();
      }

      const token = createToken(teacher);

      res.header('token', token);
      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });

      const curTeacher = await Teacher.findOne({ _id: teacher._id }).lean().exec();
      return res.status(200).json({
        token: token,
        message: 'Teacher logged in successfully',
        data: curTeacher,
      });
    } catch (err: any) {
      if (err.isJoi === true) {
        return res.status(400).json({ error: err.details[0].message });
      }
      return res.status(400).json({ error: 'Wrong Teacher credentials.', message: 'Must provide Email and password.' }).end();
    }
  },

  // Retrieve all teachers
  getAllTeachers: async (req: Request, res: Response) => {
    try {
      const teachers = await Teacher.find();

      res.status(200).json({
        message: 'Retrieved teacher by ID successfully!',
        data: teachers,
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to retrieve teachers', message: error.message });
    }
  },

  // Retrieve a specific teacher by ID
  getTeacherById: async (req: Request, res: Response) => {
    try {
      const teacherId = req.params.id;
      const teacher = await Teacher.findById(teacherId);

      if (!teacher) {
        return res.status(404).json({ error: 'Teacher not found' });
      }

      res.status(200).json({
        message: 'Retrieved teacher by ID successfully!',
        data: teacher,
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to retrieve teacher', message: error.message });
    }
  },

  // Update a specific teacher by ID
  updateTeacherById: async (req: Request, res: Response) => {
    try {
      const teacherId = req.params.id;
      const updatedTeacherData = req.body;

      const updatedTeacher = await Teacher.findByIdAndUpdate(teacherId, updatedTeacherData, { new: true });

      if (!updatedTeacher) {
        return res.status(404).json({ error: 'Teacher not found' });
      }

      res.status(200).json({
        message: 'Updated teacher by ID successfully!',
        data: updatedTeacher,
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update teacher', message: error.message });
    }
  },

  // Delete a specific teacher by ID
  deleteTeacherById: async (req: Request, res: Response) => {
    try {
      const teacherId = req.params.id;
      const deletedTeacher = await Teacher.findByIdAndRemove(teacherId);

      if (!deletedTeacher) {
        return res.status(404).json({ error: 'Teacher not found' });
      }

      res.status(200).json({
        message: 'Deleted teacher by ID successfully!',
        data: deletedTeacher,
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete teacher', message: error.message });
    }
  },
};

export default teacherController;

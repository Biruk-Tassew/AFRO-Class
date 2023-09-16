import { Request, Response } from 'express';
import Student, { IStudentDocument, studentValidation } from '../models/Student';
import configs from '../config/config';
import jwt from "jsonwebtoken";

const maxAge = 30 * 24 * 60 * 60; // 30 days
const jwtSecret = configs.JWT_SECRET;
export const createToken = (id: IStudentDocument) => {
    return jwt.sign({ id }, jwtSecret, {
      expiresIn: maxAge
    });
  };
  

const studentController = {
  // Create a new student
  signup: async (req: Request, res: Response) => {
    try {
      let {
        userName,
        name,
        email,
        bio,
        department,
        nationality,
        avatar,
        password,
        grade
      } = req.body;

      const validatedStudent = await studentValidation.validateAsync({
        userName,
        name,
        email,
        bio,
        department,
        nationality,
        avatar,
        password,
        grade
      });

      const studentByEmail = await Student.findOne({ email }).lean().exec();

      if (studentByEmail) {
        return res
          .status(400)
          .json({
            error: 'That email is already registered',
            message: 'Must provide unique email',
          })
          .end();
      }

      const studentByUserName = await Student.findOne({ userName }).lean().exec();

      if (studentByUserName) {
        return res
          .status(400)
          .json({
            error: 'That user Name is already registered',
            message: 'Must provide unique userName',
          })
          .end();
      }

      const newStudent: IStudentDocument = new Student(validatedStudent);

      const savedStudent = await newStudent.save();

      // Generate and send JWT token
      const token = createToken(savedStudent);
      res.header('token', token);
      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });

      // Finish registering the student and send a success message
      const cur_student = await Student.findOne({ _id: savedStudent._id })
        .populate('avatar')
        .lean()
        .exec();

      return res
        .status(201)
        .json({
          token: token,
          message: 'Student registered successfully!',
          data: cur_student,
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

  studentLogin: async (req: Request, res: Response) => {
    try {
      let { email, password } = req.body;
      email = email.trim();
      password = password.trim();
  
      if (email === null || password === null || email === "" || password === "") {
        return res
          .status(400)
          .json({ error: "Wrong format of student info sent.", message: "Must provide Email and password." })
          .end();
      }
  
      const student: IStudentDocument = await Student.login(email, password);
  
      const token = createToken(student);
  
      res.header('token', token);
      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
  
      const cur_student = await Student.findOne({ _id: student._id }).lean().exec();
      return res.status(200).json({
        token: token,
        message: 'Student logged in successfully',
        data: cur_student,
      });
    } catch (err: any) {
      if (err.isJoi === true) {
        return res.status(400).json({ error: err.details[0].message });
      }
      return res.status(400).json({ error: "Wrong Student credentials.", message: "Must provide Email and password." }).end();
    }
  },

  // Retrieve all students
  getAllStudents: async (req: Request, res: Response) => {
    try {
      const students = await Student.find();

      res.status(200).json({
        message: 'Retrieved student by ID successfully!',
        data: students,
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to retrieve students', message: error.message });
    }
  },

  // Retrieve a specific student by ID
  getStudentById: async (req: Request, res: Response) => {
    try {
      const studentId = req.params.id;
      const student = await Student.findById(studentId);

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      res.status(200).json({
        message: 'Retrieved student by ID successfully!',
        data: student,
      });
    } catch (error : any) {
      res.status(500).json({ error: 'Failed to retrieve student', message: error.message });
    }
  },

  // Update a specific student by ID
  updateStudentById: async (req: Request, res: Response) => {
    try {
      const studentId = req.params.id;
      const updatedStudentData = req.body;

      const updatedStudent = await Student.findByIdAndUpdate(studentId, updatedStudentData, { new: true });

      if (!updatedStudent) {
        return res.status(404).json({ error: 'Student not found' });
      }

      res.status(200).json({
        message: 'Updated student by ID successfully!',
        data: updatedStudent,
      });
    } catch (error : any) {
      res.status(500).json({ error: 'Failed to update student', message: error.message });
    }
  },

  // Delete a specific student by ID
  deleteStudentById: async (req: Request, res: Response) => {
    try {
      const studentId = req.params.id;
      const deletedStudent = await Student.findByIdAndRemove(studentId);

      if (!deletedStudent) {
        return res.status(404).json({ error: 'Student not found' });
      }

      res.status(200).json({
        message: 'Deleted student by ID successfully!',
        data: deletedStudent,
      });
    } catch (error : any) {
      res.status(500).json({ error: 'Failed to delete student', message: error.message });
    }
  },
};

export default studentController;

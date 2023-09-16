import { Request, Response, NextFunction} from 'express'
import Teacher, { ITeacherDocument, teacherValidation } from '../models/Teacher'
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import configs from '../config/config';

dotenv.config()
const jwtSecret = process.env.JWT_SECRET || configs.JWT_SECRET;


const isAuthenticated = (req: Request, res:Response, next: NextFunction) => {
  let token = req.headers['authorization'] || req.body.token || req.headers.cookie?.split('=')[1] || req.cookies?.jwt;
  
  if (token) {
    const bearer = token.split(' ');
    if(bearer.length == 2){
      token = bearer[1];
    }else{
      token = bearer[0];
    }
    jwt.verify(token, jwtSecret, async (err: any, decodedToken: any) => {
      if (err) {
        return res.status(400).json({ error: {msg: "Teacher not authenticated. The token sent is bad or expired."}}).end();
      } else {
        let teacher = await Teacher.findById(decodedToken.id._id);
        if(!teacher){
          return res.status(400).json({ error: {msg: "Teacher not authenticated or token sent is bad or expired."}}).end();
        }
        req.body.teacher = teacher;
        next();
      }
    });
  } else {
      return res.status(400).json({ error: {msg: "Teacher not authenticated!"}}).end();
  }
};

export default isAuthenticated;
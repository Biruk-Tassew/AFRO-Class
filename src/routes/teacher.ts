import { Router, Request, Response, NextFunction } from "express";
import TeacherControllers from "../controllers/teacher";
import isAuthenticated from "../middlewares/authenticateTeacher";
import multipleUpload from "../middlewares/multipleUpload";

const teacherRouter = Router();

teacherRouter.post("/login", TeacherControllers.teacherLogin);
teacherRouter.post("/signup", multipleUpload as (req: Request, res: Response, next: NextFunction) => Promise<void>, TeacherControllers.signup);
teacherRouter.get("/", isAuthenticated, TeacherControllers.getAllTeachers);
teacherRouter.post("/:id", isAuthenticated, TeacherControllers.getTeacherById);
teacherRouter.put("/id", isAuthenticated, TeacherControllers.updateTeacherById);
teacherRouter.delete("/id", isAuthenticated, TeacherControllers.deleteTeacherById);


export default teacherRouter;
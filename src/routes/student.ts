import { Router, Request, Response, NextFunction } from "express";
import StudentControllers from "../controllers/student";
import isAuthenticated from "../middlewares/authenticateStudent";
import multipleUpload from "../middlewares/multipleUpload";

const studentRouter = Router();

studentRouter.post("/login", StudentControllers.studentLogin);
studentRouter.post("/signup", multipleUpload as (req: Request, res: Response, next: NextFunction) => Promise<void>, StudentControllers.signup);
studentRouter.get("/", isAuthenticated, StudentControllers.getAllStudents);
studentRouter.post("/:id", isAuthenticated, StudentControllers.getStudentById);
studentRouter.put("/id", isAuthenticated, StudentControllers.updateStudentById);
studentRouter.delete("/id", isAuthenticated, StudentControllers.deleteStudentById);


export default studentRouter;
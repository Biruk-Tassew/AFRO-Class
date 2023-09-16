import DataURIParser from "datauri/parser";
import { Request, Response, NextFunction } from "express";
import cloudinaryConfigs from '../config/cloudinary'
import cloudinary from '../services/cloundinary'
import File from "../models/files";

const parser = new DataURIParser()
export const upload = async(req: Request, res: Response, next: NextFunction, file:any, isValidFormat:any) => {
    const fileFormat = file.mimetype.split('/')[1] 
    const { base64 } = parser.format(fileFormat,file.data);

    if (!isValidFormat(fileFormat)) {
      throw new Error(`Invalid file format sent!`)
    }

    const result =  await cloudinary.uploader.upload(`data:image/${fileFormat};base64,${base64}`, {folder: cloudinaryConfigs.FOLDER_NAME})

    const data = {
        name: result.fieldname || 'File name',
        fileAddress: `${result.secure_url}`,
        cloudinaryId: `${result.public_id}`
    };

    const new_file = await File.create({...data})
    return new_file._id.toString()
}
import { NextFunction, Request, Response } from 'express'
import DataURIParser from 'datauri/parser';
import { upload } from '../services/upload';

const imageFormats = [".jpg", ".jpeg", ".png", "jpg", "jpeg", "png", "octet-stream", "pdf", "csv", "doc", "xml", "html"]
interface FileRequest extends Request{
  files: any;
}
const isValidFormat = (fileFormat: any) => {
  let isValidFile = false
  for(let i=0; i < imageFormats.length; i++){
    if(fileFormat === imageFormats[i]){
      isValidFile = true
      break
    }
  }
  return isValidFile
}


export default async function multipleUpload (req:FileRequest, res:Response, next:NextFunction) {
    try {
      let archiveFiles = req.files;
      if (!req.files){
        return next()
      }
      
      let multipleArchivePromise = []
      const parser = new DataURIParser()
      for (let i=0; archiveFiles.archives && i<archiveFiles.archives.length; i++){
          const archive = await upload(req,res,next,archiveFiles.archives[i],isValidFormat)
          multipleArchivePromise.push(archive)
      }
     
      if (archiveFiles.archives && !archiveFiles.archives.length){
          const archive = await upload(req,res,next,archiveFiles.archives,isValidFormat)
          multipleArchivePromise.push(archive)
      }

      //If there is avatar sent add the avatar to body
      if (archiveFiles.avatar && !archiveFiles.avatar.length){
          const avatar = await upload(req,res,next,archiveFiles.avatar,isValidFormat)
          req.body.avatar = avatar
      }

      req.body.archives = multipleArchivePromise
      next()
      return
    } catch (err) {
      next(err)
      return
    }
  }

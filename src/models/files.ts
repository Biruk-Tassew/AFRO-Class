import mongoose, {Schema,Document} from "mongoose";

export interface IFile extends Document{
    name: String,
    fileAddress: String,
    cloudinaryId: String,
    createdAt: Date
}

const fileSchema: Schema<IFile> = new mongoose.Schema({
    name: {
        type: String,
        default: "File Name"
    },
    fileAddress: {
        type: String
    },
    cloudinaryId: {
        type: String
    },
},
{
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
})

const File = mongoose.model<IFile>('File',fileSchema)
export default File
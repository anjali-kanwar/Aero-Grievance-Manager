import Note from "../models/Notes.js";

export async function getAllNotes(req,res) {
    try {
        const notes = await Note.find();
        res.status(200).json(notes);
    }
    catch(error) {
        console.log("Error in getAllNotes controller",error);
        res.status(500).json({message: "Internal server error"});
    }
};
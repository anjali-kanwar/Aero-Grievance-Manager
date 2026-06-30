import mongoose from "mongoose";

const grievanceSchema = new mongoose.Schema(
  {
    organizationName: { type: String, required: true },
    complainingUnit: { type: String, required: true },
    logExtract: { type: String, required: true },
    status: { type: String, enum: ["Resolved", "Pending"], required: true },
    remarks: { type: String, required: true },
  },
  { timestamps: true } // gives us createdAt -> used as Date & Time
);

const Grievance = mongoose.model("Grievance", grievanceSchema);
export default Grievance;
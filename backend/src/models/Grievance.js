import mongoose from "mongoose";

const grievanceSchema = new mongoose.Schema(
  {
    organizationName: { type: String, required: true },
    complainingUnit: { type: String, required: true },
    logExtract: { type: String, required: true },
    status: { type: String, enum: ["Resolved", "Pending"], required: true },
    response: { type: String, required: true },
    pdc: { type: Date, required: true },
    remarks: { type: String, required: true },
  },
  { timestamps: true }
);

const Grievance = mongoose.model("Grievance", grievanceSchema);
export default Grievance;
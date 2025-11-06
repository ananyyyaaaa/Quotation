import mongoose from "mongoose";

const managerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mobileNumber: { type: String, trim: true },
  },
  { timestamps: true }
);

managerSchema.index(
  { mobileNumber: 1 },
  { unique: true, partialFilterExpression: { mobileNumber: { $ne: null } } }
);
managerSchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { mobileNumber: null } }
);

export default mongoose.model("Manager", managerSchema);

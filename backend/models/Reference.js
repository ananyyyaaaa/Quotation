import mongoose from "mongoose";

const referenceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mobileNumber: { type: String, trim: true },
  },
  { timestamps: true }
);

referenceSchema.index(
  { mobileNumber: 1 },
  { unique: true, partialFilterExpression: { mobileNumber: { $ne: null } } }
);
referenceSchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { mobileNumber: null } }
);

export default mongoose.model("Reference", referenceSchema);

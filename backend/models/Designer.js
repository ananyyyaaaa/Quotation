import mongoose from "mongoose";

const designerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mobileNumber: { type: String, trim: true },
  },
  { timestamps: true }
);

// Unique when mobile exists, else unique by name
designerSchema.index(
  { mobileNumber: 1 },
  { unique: true, partialFilterExpression: { mobileNumber: { $ne: null } } }
);
designerSchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { mobileNumber: null } }
);

export default mongoose.model("Designer", designerSchema);

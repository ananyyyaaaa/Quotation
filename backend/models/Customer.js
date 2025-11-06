import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    gstNumber: { type: String },
    building: { type: String },
    floor: { type: String },
    nearestLandmark: { type: String },
    address: { type: String },
    mobileNumber: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Partial unique index for mobileNumber when provided
customerSchema.index(
  { mobileNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { mobileNumber: { $ne: null } },
  }
);

// ✅ Fixed: Partial unique index for name when mobileNumber is null
customerSchema.index(
  { name: 1 },
  {
    unique: true,
    partialFilterExpression: { mobileNumber: { $eq: null } },
  }
);


export default mongoose.model("Customer", customerSchema);

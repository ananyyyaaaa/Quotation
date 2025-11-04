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
      sparce: true,
      unique: true, // ensures backend duplication prevention
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);

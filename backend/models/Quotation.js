import mongoose from "mongoose";

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: { type: Number, unique: true },
    date: String,
    status: String,
    businessUnit: String,
    product: String,
    quotationType: String,
    reference: String,
    designer: String,
    manager: String,
    category: String,
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    shippingAddress: {
      gstNumber: String,
      building: String,
      floor: String,
      nearestLandmark: String,
      address: String,
      mobileNumber: String,
    },
    remarks: String,
    blocks: Array,
  },
  { timestamps: true }
);

export default mongoose.model("Quotation", quotationSchema);

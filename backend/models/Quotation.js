import mongoose from "mongoose";

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: { type: Number, unique: true },
    date: String,
    status: String,
    businessUnit: String,
    category: String,
    product: String,
    quotationType: String,
    reference: String,
    designer: String,
    manager: String,
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
    specialDiscount: { type: Number, default: 0 },
    finalProjectValue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Quotation", quotationSchema);

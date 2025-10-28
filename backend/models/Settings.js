import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    // Company Information
    legalName: { type: String, default: "" },
    gstin: { type: String, default: "" },
    pan: { type: String, default: "" },
    stateCode: { type: String, default: "" },
    stateName: { type: String, default: "" },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    
    // Quotation Defaults
    prefix: { type: String, default: "" },
    nextNumber: { type: Number, default: 1 },
    defaultGst: { type: Number, default: 18 },
    validityDays: { type: Number, default: 15 },
    terms: { type: String, default: "" },
  },
  { timestamps: true }
);

// Singleton pattern: always return the same single document
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

settingsSchema.statics.updateSettings = async function(data) {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create(data);
  } else {
    Object.assign(settings, data);
    await settings.save();
  }
  return settings;
};

export default mongoose.model("Settings", settingsSchema);



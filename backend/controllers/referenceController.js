import Reference from "../models/Reference.js";

// ✅ Get all references
export const getReferences = async (req, res) => {
  try {
    const references = await Reference.find();
    res.json(references);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Add new reference with validation and unique rules
export const addReference = async (req, res) => {
  try {
    let { name, mobileNumber } = req.body;

    name = name.trim();
    mobileNumber = mobileNumber ? mobileNumber.trim() : null;
    if (mobileNumber === "") mobileNumber = null;

    // ✅ Validate mobile number if provided
    if (mobileNumber && !/^\d{10}$/.test(mobileNumber)) {
      return res.status(400).json({ message: "Mobile number must be 10 digits if provided" });
    }

    const newReference = new Reference({ name, mobileNumber });
    await newReference.save();

    res.status(201).json(newReference);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      if (error.keyPattern?.mobileNumber)
        return res.status(400).json({ message: "Mobile number already exists" });
      if (error.keyPattern?.name)
        return res.status(400).json({ message: "Reference name already exists (no mobile provided)" });
      return res.status(400).json({ message: "Duplicate entry detected" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

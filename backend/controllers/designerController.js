import Designer from "../models/Designer.js";

export const getDesigners = async (req, res) => {
  try {
    const designers = await Designer.find();
    res.json(designers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addDesigner = async (req, res) => {
  try {
    let { name, mobileNumber } = req.body;

    name = name.trim();
    mobileNumber = mobileNumber ? mobileNumber.trim() : null;
    if (mobileNumber === "") mobileNumber = null;

    if (mobileNumber && !/^\d{10}$/.test(mobileNumber)) {
      return res.status(400).json({ message: "Mobile number must be 10 digits if provided" });
    }

    const newDesigner = new Designer({ name, mobileNumber });
    await newDesigner.save();

    res.status(201).json(newDesigner);
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern?.mobileNumber)
        return res.status(400).json({ message: "Mobile number already exists" });
      if (error.keyPattern?.name)
        return res.status(400).json({ message: "Designer name already exists (no mobile provided)" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

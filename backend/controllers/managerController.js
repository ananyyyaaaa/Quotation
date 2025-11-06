import Manager from "../models/Manager.js";

// ✅ Get all managers
export const getManagers = async (req, res) => {
  try {
    const managers = await Manager.find();
    res.json(managers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Add new manager with validation and unique rules
export const addManager = async (req, res) => {
  try {
    let { name, mobileNumber } = req.body;

    name = name.trim();
    mobileNumber = mobileNumber ? mobileNumber.trim() : null;
    if (mobileNumber === "") mobileNumber = null;

    // ✅ Validate mobile number if provided
    if (mobileNumber && !/^\d{10}$/.test(mobileNumber)) {
      return res.status(400).json({ message: "Mobile number must be 10 digits if provided" });
    }

    const newManager = new Manager({ name, mobileNumber });
    await newManager.save();

    res.status(201).json(newManager);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      if (error.keyPattern?.mobileNumber)
        return res.status(400).json({ message: "Mobile number already exists" });
      if (error.keyPattern?.name)
        return res.status(400).json({ message: "Manager name already exists (no mobile provided)" });
      return res.status(400).json({ message: "Duplicate entry detected" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

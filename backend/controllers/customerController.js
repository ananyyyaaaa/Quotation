import Customer from "../models/Customer.js";

// ✅ Get all customers
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Add new customer with duplicate + validation
export const addCustomer = async (req, res) => {
  try {
    let { name, gstNumber, building, floor, nearestLandmark, address, mobileNumber } = req.body;

    // ✅ Trim values safely
    name = name.trim();
    mobileNumber = mobileNumber ? mobileNumber.trim() : null;
    if (mobileNumber === "") mobileNumber = null;

    // ✅ Allow empty mobile number, validate only if provided
    if (mobileNumber && !/^\d{10}$/.test(mobileNumber)) {
      return res.status(400).json({ message: "Mobile number must be 10 digits if provided" });
    }

    // ✅ Validate GST (optional but must be 15 alphanumeric)
    if (gstNumber && !/^[A-Z0-9]{15}$/i.test(gstNumber)) {
      return res.status(400).json({ message: "GST number must be 15 alphanumeric characters" });
    }

    // ✅ Custom duplicate check logic
    let existingCustomer;

    if (mobileNumber) {
      // Check uniqueness by mobile number
      existingCustomer = await Customer.findOne({ mobileNumber });
      if (existingCustomer) {
        return res.status(400).json({ message: "Mobile number already exists" });
      }
    } else {
      // Check uniqueness by name if mobile not provided
      existingCustomer = await Customer.findOne({
        name,
        $or: [{ mobileNumber: "" }, { mobileNumber: null }],
      });
      if (existingCustomer) {
        return res
          .status(400)
          .json({ message: "Customer name already exists (mobile not provided)" });
      }
    }

    // ✅ Create and save new customer
    const newCustomer = new Customer({
      name,
      gstNumber,
      building,
      floor,
      nearestLandmark,
      address,
      mobileNumber,
    });

    await newCustomer.save();
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error(error);
    // Handle duplicate key error (from unique index)
    if (error.code === 11000) {
      if (error.keyPattern && error.keyPattern.mobileNumber) {
        return res.status(400).json({ message: "Mobile number already exists" });
      } else if (error.keyPattern && error.keyPattern.name) {
        return res
          .status(400)
          .json({ message: "Customer name already exists (mobile not provided)" });
      }
      return res.status(400).json({ message: "Duplicate entry detected" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

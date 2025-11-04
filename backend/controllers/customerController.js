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
    if (mobileNumber) mobileNumber = mobileNumber.trim();

    // ✅ Allow empty mobile number, validate only if provided
    if (mobileNumber && !/^\d{10}$/.test(mobileNumber)) {
      return res.status(400).json({ message: "Mobile number must be 10 digits if provided" });
    }

    // ✅ Set null if empty
    if (!mobileNumber) {
      mobileNumber = null;
    }

    // ✅ Validate GST (optional but must be 15 alphanumeric)
    if (gstNumber && !/^[A-Z0-9]{15}$/i.test(gstNumber)) {
      return res.status(400).json({ message: "GST number must be 15 alphanumeric characters" });
    }

    // ✅ Duplicate mobile check (only if provided)
    if (mobileNumber) {
      const existing = await Customer.findOne({ mobileNumber });
      if (existing) {
        return res.status(400).json({ message: "Customer with this mobile number already exists" });
      }
    }

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
      return res.status(400).json({ message: "Mobile number already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

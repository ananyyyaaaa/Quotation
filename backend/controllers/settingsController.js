import Settings from "../models/Settings.js";

/**
 * 📋 Get settings (singleton)
 */
export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.status(200).json({ success: true, settings });
  } catch (error) {
    console.error("❌ Error fetching settings:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 💾 Save/Update settings (singleton)
 */
export const saveSettings = async (req, res) => {
  try {
    console.log("=== SAVE SETTINGS ===");
    console.log("Request body:", req.body);
    
    const settings = await Settings.updateSettings(req.body);
    
    res.status(200).json({ 
      success: true, 
      message: "Settings saved successfully",
      settings 
    });
  } catch (error) {
    console.error("❌ Error saving settings:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};



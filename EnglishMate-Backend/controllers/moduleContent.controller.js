import ModuleContent from "../models/ModuleContent.js";

// Add new module (admin / developer use)
export const addModuleContent = async (req, res) => {
  try {
    const content = await ModuleContent.create(req.body);
    res.status(201).json(content);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Fetch module content for frontend
export const getModuleContent = async (req, res) => {
  try {
    const { level, moduleName } = req.params;
    const content = await ModuleContent.findOne({ level, moduleName });

    res.json(content);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

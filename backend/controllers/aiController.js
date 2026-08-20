const { diagnoseIssue } = require('../services/aiService');

const getDiagnosis = async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ success: false, message: 'Please provide a description of the problem' });
    }

    const diagnosis = await diagnoseIssue(description);
    res.json({ success: true, diagnosis });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDiagnosis };

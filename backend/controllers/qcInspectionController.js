const QCInspection = require('../models/QCInspection');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// ===== Simple PIN config stored in a dedicated collection =====
const pinConfigSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'qc_pin' },
  hashedPin: { type: String, required: true },
}, { timestamps: true });

const PinConfig = mongoose.models.PinConfig || mongoose.model('PinConfig', pinConfigSchema);

// ---------------------------------------------------------------
// @desc    Verify QC PIN
// @route   POST /api/qc-inspections/verify-pin
// @access  Protected
// ---------------------------------------------------------------
const verifyQCPin = async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin) {
      return res.status(400).json({ message: 'Vui lòng nhập mã PIN' });
    }

    const config = await PinConfig.findOne({ key: 'qc_pin' });
    if (!config) {
      return res.status(404).json({ message: 'Chưa cài đặt mã PIN QC. Vui lòng liên hệ Admin.' });
    }

    const isMatch = await bcrypt.compare(pin, config.hashedPin);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mã PIN không đúng' });
    }

    res.json({ success: true, message: 'Xác thực PIN thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------
// @desc    Set / Update QC PIN (Admin only)
// @route   PUT /api/qc-inspections/pin
// @access  Admin
// ---------------------------------------------------------------
const setQCPin = async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin || pin.length < 4) {
      return res.status(400).json({ message: 'Mã PIN phải có ít nhất 4 ký tự' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(pin, salt);

    await PinConfig.findOneAndUpdate(
      { key: 'qc_pin' },
      { hashedPin },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Đã cập nhật mã PIN QC thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------
// @desc    Check if QC PIN exists
// @route   GET /api/qc-inspections/pin-status
// @access  Protected
// ---------------------------------------------------------------
const getPinStatus = async (req, res) => {
  try {
    const config = await PinConfig.findOne({ key: 'qc_pin' });
    res.json({ hasPin: !!config });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------
// @desc    Get all QC inspections (with filters)
// @route   GET /api/qc-inspections
// @access  Protected
// ---------------------------------------------------------------
const getInspections = async (req, res) => {
  try {
    const { verdict, sampleType } = req.query;
    const filter = {};

    if (verdict) filter.verdict = verdict;
    if (sampleType) filter.sampleType = sampleType;

    const inspections = await QCInspection.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json(inspections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------
// @desc    Get single QC inspection
// @route   GET /api/qc-inspections/:id
// @access  Protected
// ---------------------------------------------------------------
const getInspectionById = async (req, res) => {
  try {
    const inspection = await QCInspection.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!inspection) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu kiểm QC' });
    }

    res.json(inspection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------
// @desc    Create QC inspection (requires PIN verification)
// @route   POST /api/qc-inspections
// @access  Protected + PIN
// ---------------------------------------------------------------
const createInspection = async (req, res) => {
  try {
    const { pin, ...inspectionData } = req.body;

    // Verify PIN
    if (!pin) {
      return res.status(400).json({ message: 'Vui lòng nhập mã PIN để tạo phiếu QC' });
    }

    const config = await PinConfig.findOne({ key: 'qc_pin' });
    if (!config) {
      return res.status(404).json({ message: 'Chưa cài đặt mã PIN QC. Vui lòng liên hệ Admin.' });
    }

    const isMatch = await bcrypt.compare(pin, config.hashedPin);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mã PIN không đúng, không thể tạo phiếu' });
    }

    // Create inspection
    const inspection = new QCInspection({
      ...inspectionData,
      createdBy: req.user._id,
    });

    const created = await inspection.save();
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------
// @desc    Update QC inspection
// @route   PUT /api/qc-inspections/:id
// @access  Protected
// ---------------------------------------------------------------
const updateInspection = async (req, res) => {
  try {
    const inspection = await QCInspection.findById(req.params.id);

    if (!inspection) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu kiểm QC' });
    }

    // Update fields
    const allowedFields = [
      'orderName', 'sampleType', 'inspector', 'inspectionDate',
      'images', 'referenceImages', 'checklist',
      'verdict', 'defectDescription', 'correctiveAction', 'notes',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        inspection[field] = req.body[field];
      }
    });

    const updated = await inspection.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------
// @desc    Delete QC inspection
// @route   DELETE /api/qc-inspections/:id
// @access  Protected
// ---------------------------------------------------------------
const deleteInspection = async (req, res) => {
  try {
    const inspection = await QCInspection.findById(req.params.id);

    if (!inspection) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu kiểm QC' });
    }

    await QCInspection.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa phiếu kiểm QC' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getInspections,
  getInspectionById,
  createInspection,
  updateInspection,
  deleteInspection,
  verifyQCPin,
  setQCPin,
  getPinStatus,
};

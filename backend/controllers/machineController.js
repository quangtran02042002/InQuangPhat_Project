// backend/controllers/machineController.js
const Machine = require('../models/Machine');

// 1. Tạo máy mới
exports.createMachine = async (req, res) => {
  try {
    let imagesLinks = [];
    let videosLinks = []; // Mảng chứa video

    // 1. Xử lý Ảnh
    if (req.files && req.files['images']) {
      imagesLinks = req.files['images'].map(file => ({
        public_id: file.filename,
        url: file.path
      }));
    }

    // 2. Xử lý Video (Nhiều video)
    // Lưu ý: Key bây giờ là 'videos' (số nhiều) khớp với Route
    if (req.files && req.files['videos']) {
      videosLinks = req.files['videos'].map(file => ({
        public_id: file.filename,
        url: file.path
      }));
    }

    const machineData = {
      name: req.body.name,
      category: req.body.category,
      description: req.body.description,
      
      videos: videosLinks, // Lưu mảng video vào DB
      images: imagesLinks
    };

    const machine = await Machine.create(machineData);

    res.status(201).json({ success: true, machine });
  } catch (error) {
    console.error("Lỗi:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// 2. Lấy tất cả máy
exports.getAllMachines = async (req, res) => {
  try {
    const machines = await Machine.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      machines
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Xóa máy
exports.deleteMachine = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) return res.status(404).json({ success: false, message: 'Không tìm thấy máy' });
    
    // Lưu ý: Nếu muốn xóa triệt để, có thể thêm code xóa ảnh trên Cloudinary tại đây dựa vào public_id
    
    await machine.deleteOne();
    res.status(200).json({ success: true, message: 'Đã xóa máy thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getSingleMachine = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy máy này'
      });
    }

    res.status(200).json({
      success: true,
      machine
    });
  } catch (error) {
    // Xử lý lỗi nếu ID không đúng định dạng MongoDB
    if (error.name === 'CastError') {
        return res.status(404).json({ success: false, message: 'ID máy không hợp lệ' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.updateMachine = async (req, res) => {
  try {
    let machine = await Machine.findById(req.params.id);
    if (!machine) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy máy' });
    }

    // 1. Cập nhật thông tin cơ bản
    machine.name = req.body.name;
    machine.category = req.body.category;
    machine.description = req.body.description;
    
    // Nếu người dùng nhập link Youtube mới thì cập nhật, nếu không giữ nguyên hoặc rỗng
    // (Lưu ý: Logic này ưu tiên nếu có file video upload bên dưới thì sẽ đè link này sau)
    if (req.body.videoLink) { 
       // Frontend sẽ gửi key 'videoLink' nếu là text youtube
       // Nhưng ở model ta lưu trong mảng videos hoặc trường video cũ. 
       // Để đơn giản ta tạm bỏ qua link youtube trong array video phức tạp, 
       // ta chỉ update các trường text cơ bản trước.
    }

    // 2. Xử lý ẢNH (Images)
    // a. Lấy danh sách ảnh CŨ mà người dùng muốn giữ lại (Frontend gửi lên dạng JSON string)
    let keptImages = [];
    if (req.body.oldImages) {
        keptImages = JSON.parse(req.body.oldImages);
    }

    // b. Lấy danh sách ảnh MỚI vừa upload
    let newImages = [];
    if (req.files && req.files['images']) {
      newImages = req.files['images'].map(file => ({
        public_id: file.filename,
        url: file.path
      }));
    }

    // c. Gộp lại: Ảnh cũ giữ lại + Ảnh mới
    machine.images = [...keptImages, ...newImages];


    // 3. Xử lý VIDEO (Videos) - Tương tự ảnh
    let keptVideos = [];
    if (req.body.oldVideos) {
        keptVideos = JSON.parse(req.body.oldVideos);
    }

    let newVideos = [];
    if (req.files && req.files['videos']) {
      newVideos = req.files['videos'].map(file => ({
        public_id: file.filename,
        url: file.path
      }));
    }

    // Lưu ý: Nếu Model của bạn dùng trường 'videos' (số nhiều) thì dùng dòng dưới:
    if (machine.videos) {
        machine.videos = [...keptVideos, ...newVideos];
    }

    await machine.save();

    res.status(200).json({
      success: true,
      machine
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
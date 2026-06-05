const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const sharp = require('sharp');
const auth = require('../middleware/auth');
const Prediction = require('../models/Prediction');

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpg, jpeg, png, webp) are allowed'));
  }
});

// @route   POST api/analyze
// @desc    Upload image, run Roboflow inference, draw bounding boxes using sharp, and save to DB
// @access  Private
router.post('/', [auth, upload.single('image')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const filePath = req.file.path;
    const fileName = req.file.filename;

    // 1. Get Roboflow API Key
    const apiKey = process.env.ROBOFLOW_API_KEY || 'Z329Y2FN1wOL2HvocEIg';
    if (!apiKey) {
      return res.status(500).json({ error: 'Roboflow API key is not configured' });
    }

    // 2. Read image & convert to Base64 for Roboflow
    const imageBase64 = fs.readFileSync(filePath, { encoding: 'base64' });

    // 3. Query Roboflow API
    const modelId = "my-first-project-2rhyc/2";
    let predictions = [];
    let roboflowResult = {};

    try {
      const response = await axios({
        method: 'POST',
        url: `https://detect.roboflow.com/${modelId}`,
        params: {
          api_key: apiKey
        },
        data: imageBase64,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      roboflowResult = response.data;
      predictions = roboflowResult.predictions || [];
    } catch (apiErr) {
      console.error('Roboflow API request failed:', apiErr.response ? apiErr.response.data : apiErr.message);
      return res.status(502).json({ error: 'Failed to communicate with Roboflow Inference API', details: apiErr.message });
    }

    // 4. Draw bounding boxes on the image using sharp & SVG composite overlay
    const annotatedFileName = 'annotated-' + fileName;
    const annotatedFilePath = path.join(__dirname, '../uploads', annotatedFileName);
    
    try {
      const metadata = await sharp(filePath).metadata();
      const width = metadata.width;
      const height = metadata.height;

      // Build SVG overlay
      let svgString = `<svg width="${width}" height="${height}">`;
      
      predictions.forEach(pred => {
        const x = pred.x;
        const y = pred.y;
        const w = pred.width;
        const h = pred.height;
        const className = pred.class || 'obj';
        const confidence = pred.confidence || 0;

        // Convert center x,y,width,height to top-left corners
        const x1 = x - w / 2;
        const y1 = y - h / 2;
        const label = `${className} (${confidence.toFixed(2)})`;

        // Calculate label positioning
        const labelHeight = Math.max(Math.round(height * 0.03), 16);
        const labelWidth = label.length * (labelHeight * 0.55);
        const labelY = Math.max(y1 - labelHeight, 0);

        svgString += `
          <rect x="${x1}" y="${y1}" width="${w}" height="${h}" fill="none" stroke="#00FF00" stroke-width="3" />
          <rect x="${x1}" y="${labelY}" width="${labelWidth}" height="${labelHeight}" fill="#00FF00" />
          <text x="${x1 + 4}" y="${labelY + labelHeight - 4}" font-family="Arial, sans-serif" font-size="${labelHeight - 2}px" font-weight="bold" fill="#000000">
            ${label}
          </text>
        `;
      });
      
      svgString += `</svg>`;

      await sharp(filePath)
        .composite([{ input: Buffer.from(svgString), top: 0, left: 0 }])
        .toFile(annotatedFilePath);

    } catch (sharpErr) {
      console.error('Sharp annotation rendering failed:', sharpErr.message);
      // If annotation fails, copy original image as annotated to avoid breaking app
      fs.copyFileSync(filePath, annotatedFilePath);
    }

    // 5. Determine primary prediction (highest confidence)
    let primary = null;
    if (predictions.length === 1) {
      primary = predictions[0];
    } else if (predictions.length > 1) {
      primary = predictions.reduce((best, cur) => {
        return (cur.confidence || 0) > (best.confidence || 0) ? cur : best;
      }, predictions[0]);
    }

    const diseaseLabel = primary ? (primary.class || 'Unknown') : 'healthy';
    const confidenceScore = primary ? Math.round(primary.confidence * 100) : 100;

    // 6. Save to MongoDB
    const newPrediction = new Prediction({
      userId: req.user.id,
      originalName: fileName,
      annotatedName: annotatedFileName,
      disease: diseaseLabel,
      confidence: confidenceScore
    });

    await newPrediction.save();

    // 7. Format Response (match Django fields where needed)
    res.json({
      predictions: predictions,
      image_url: `/uploads/${fileName}`,
      annotated_url: `/uploads/${annotatedFileName}`,
      raw: roboflowResult,
      dbRecord: newPrediction
    });

  } catch (err) {
    console.error('Inference server error:', err);
    res.status(500).json({ error: 'Server error processing image analysis', details: err.message });
  }
});

// @route   GET api/analyze/history
// @desc    Get user's past predictions
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const history = await Prediction.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/analyze/history/:id
// @desc    Delete a prediction record and its files
// @access  Private
router.delete('/history/:id', auth, async (req, res) => {
  try {
    const recordId = req.params.id;
    const dbRecord = await Prediction.findById(recordId);
    if (!dbRecord) {
      return res.status(404).json({ msg: 'Record not found' });
    }

    // Check user authorization
    if (dbRecord.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Delete files from filesystem
    const uploadsDir = path.join(__dirname, '../uploads');
    const originalPath = path.join(uploadsDir, dbRecord.originalName);
    const annotatedPath = path.join(uploadsDir, dbRecord.annotatedName);

    try {
      if (fs.existsSync(originalPath)) fs.unlinkSync(originalPath);
      if (fs.existsSync(annotatedPath)) fs.unlinkSync(annotatedPath);
    } catch (fsErr) {
      console.error('Failed to delete files:', fsErr.message);
    }

    await Prediction.findByIdAndDelete(recordId);
    res.json({ msg: 'Record and images deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

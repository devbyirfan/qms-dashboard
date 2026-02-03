const express = require('express');
const { body, validationResult } = require('express-validator');
const authenticateToken = require('../middleware/auth');
const Checker = require('../models/Checker');
const PDFDocument = require('pdfkit');
const upload = require('../middleware/upload');
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Get all checkers
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Fetching all checkers...');
    const checkers = await Checker.getAll();
    console.log('✅ Checkers fetched:', checkers.length);
    res.json({ success: true, data: checkers });
  } catch (error) {
    console.error('❌ Get checkers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single checker
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const checker = await Checker.getById(req.params.id);
    if (!checker) {
      return res.status(404).json({ error: 'Checker not found' });
    }
    res.json({ success: true, data: checker });
  } catch (error) {
    console.error('❌ Get checker error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create checker with enhanced validation
router.post('/', authenticateToken, [
  body('name').notEmpty().withMessage('Name is required'),
  body('emp_id').notEmpty().withMessage('Employee ID is required'),
  body('unit').notEmpty().withMessage('Unit is required'),
  body('test_marks').isNumeric().withMessage('Test marks must be a number'),
  body('age').optional().isInt({ min: 18, max: 70 }).withMessage('Age must be between 18 and 70'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const checker = await Checker.create(req.body);
    res.status(201).json({ success: true, data: checker, message: 'Checker added successfully' });
  } catch (error) {
    console.error('❌ Create checker error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Employee ID already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Update checker
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const checker = await Checker.update(req.params.id, req.body);
    if (!checker) {
      return res.status(404).json({ error: 'Checker not found' });
    }
    res.json({ success: true, data: checker, message: 'Checker updated successfully' });
  } catch (error) {
    console.error('❌ Update checker error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete checker
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await Checker.delete(req.params.id);
    res.json({ success: true, message: 'Checker deleted successfully' });
  } catch (error) {
    console.error('❌ Delete checker error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Search checkers (enhanced with new fields)
router.get('/search/:query', authenticateToken, async (req, res) => {
  try {
    const checkers = await Checker.search(req.params.query);
    res.json({ success: true, data: checkers });
  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get performance stats
router.get('/stats/performance', authenticateToken, async (req, res) => {
  try {
    console.log('📊 Fetching performance stats...');
    const stats = await Checker.getPerformanceStats();
    console.log('✅ Stats fetched:', stats);
    res.json({ success: true, stats });
  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get performance by unit
router.get('/stats/by-unit', authenticateToken, async (req, res) => {
  try {
    console.log('📊 Fetching performance by unit...');
    const data = await Checker.getPerformanceByUnit();
    console.log('✅ Unit performance fetched:', data.length);
    res.json({ success: true, data });
  } catch (error) {
    console.error('❌ Performance by unit error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get performance by department (NEW)
router.get('/stats/by-department', authenticateToken, async (req, res) => {
  try {
    console.log('📊 Fetching performance by department...');
    const data = await Checker.getPerformanceByDepartment();
    console.log('✅ Department performance fetched:', data.length);
    res.json({ success: true, data });
  } catch (error) {
    console.error('❌ Performance by department error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get monthly performance trends (NEW)
router.get('/stats/monthly', authenticateToken, async (req, res) => {
  try {
    console.log('📊 Fetching monthly performance...');
    const data = await Checker.getMonthlyPerformance();
    console.log('✅ Monthly performance fetched:', data.length);
    res.json({ success: true, data });
  } catch (error) {
    console.error('❌ Monthly performance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get performance distribution
router.get('/stats/distribution', authenticateToken, async (req, res) => {
  try {
    console.log('📊 Fetching performance distribution...');
    const data = await Checker.getPerformanceDistribution();
    console.log('✅ Distribution fetched:', data.length);
    res.json({ success: true, data });
  } catch (error) {
    console.error('❌ Performance distribution error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get statistics by age group (NEW)
router.get('/stats/by-age', authenticateToken, async (req, res) => {
  try {
    console.log('📊 Fetching age group statistics...');
    const data = await Checker.getByAgeGroup();
    console.log('✅ Age group stats fetched:', data.length);
    res.json({ success: true, data });
  } catch (error) {
    console.error('❌ Age group stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get statistics by education level (NEW)
router.get('/stats/by-education', authenticateToken, async (req, res) => {
  try {
    console.log('📊 Fetching education statistics...');
    const data = await Checker.getByEducation();
    console.log('✅ Education stats fetched:', data.length);
    res.json({ success: true, data });
  } catch (error) {
    console.error('❌ Education stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Generate Enhanced PDF Report
router.get('/report/pdf', authenticateToken, async (req, res) => {
  try {
    console.log('📄 Generating enhanced PDF report...');
    const checkers = await Checker.getAll();
    const stats = await Checker.getPerformanceStats();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=quality-checkers-report.pdf');

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(res);

    // Header
    doc.fontSize(24).fillColor('#2c3e50').text('Quality Management System', { align: 'center' });
    doc.fontSize(16).fillColor('#3498db').text('Comprehensive Checkers Performance Report', { align: 'center' });
    doc.moveDown(2);

    // Stats Summary
    doc.fillColor('#000').fontSize(10);
    doc.text(`Report Generated: ${new Date().toLocaleString()}`, { align: 'right' });
    doc.moveDown(1);
    
    doc.rect(50, doc.y, 500, 100).fillAndStroke('#f8f9fa', '#e9ecef');
    doc.fillColor('#2c3e50').fontSize(14).font('Helvetica-Bold');
    doc.text('Performance Summary', 60, doc.y + 10);
    doc.fontSize(10).font('Helvetica');
    doc.fillColor('#000');
    doc.text(`Total Checkers: ${stats.total_checkers || 0}`, 60, doc.y + 5);
    doc.text(`Average Marks: ${parseFloat(stats.avg_marks || 0).toFixed(2)}%`, 60, doc.y + 5);
    doc.text(`Highest Score: ${parseFloat(stats.max_marks || 0).toFixed(2)}%`, 60, doc.y + 5);
    doc.text(`Lowest Score: ${parseFloat(stats.min_marks || 0).toFixed(2)}%`, 60, doc.y + 5);
    doc.text(`Pretest Average: ${parseFloat(stats.avg_pretest || 0).toFixed(2)}%`, 60, doc.y + 5);
    doc.text(`Posttest Average: ${parseFloat(stats.avg_posttest || 0).toFixed(2)}%`, 60, doc.y + 5);
    doc.moveDown(2);

    // Detailed Table Header
    const tableTop = doc.y;
    doc.fillColor('#2c3e50').fontSize(9).font('Helvetica-Bold');
    doc.text('Name', 50, tableTop, { width: 80 });
    doc.text('Emp ID', 130, tableTop, { width: 50 });
    doc.text('Designation', 180, tableTop, { width: 70 });
    doc.text('Dept', 250, tableTop, { width: 60 });
    doc.text('Age', 310, tableTop, { width: 30 });
    doc.text('Marks', 340, tableTop, { width: 40 });
    doc.text('Type', 380, tableTop, { width: 40 });
    doc.text('Education', 420, tableTop, { width: 80 });

    doc.moveTo(50, tableTop + 12).lineTo(550, tableTop + 12).stroke('#2c3e50');
    doc.moveDown(0.5);

    // Table Data
    doc.font('Helvetica').fontSize(8).fillColor('#000');
    let y = tableTop + 18;
    
    checkers.forEach((checker, index) => {
      if (y > 720) {
        doc.addPage();
        y = 50;
        // Repeat header on new page
        doc.fillColor('#2c3e50').fontSize(9).font('Helvetica-Bold');
        doc.text('Name', 50, y, { width: 80 });
        doc.text('Emp ID', 130, y, { width: 50 });
        doc.text('Designation', 180, y, { width: 70 });
        doc.text('Dept', 250, y, { width: 60 });
        doc.text('Age', 310, y, { width: 30 });
        doc.text('Marks', 340, y, { width: 40 });
        doc.text('Type', 380, y, { width: 40 });
        doc.text('Education', 420, y, { width: 80 });
        doc.moveTo(50, y + 12).lineTo(550, y + 12).stroke('#2c3e50');
        y += 18;
        doc.font('Helvetica').fontSize(8).fillColor('#000');
      }
      
      // Alternate row colors
      if (index % 2 === 0) {
        doc.rect(50, y - 2, 500, 14).fill('#f8f9fa');
        doc.fillColor('#000');
      }
      
      doc.text(checker.name || '-', 50, y, { width: 80, ellipsis: true });
      doc.text(checker.emp_id || '-', 130, y, { width: 50 });
      doc.text(checker.designation || '-', 180, y, { width: 70, ellipsis: true });
      doc.text(checker.department || '-', 250, y, { width: 60, ellipsis: true });
      doc.text(checker.age ? checker.age.toString() : '-', 310, y, { width: 30 });
      doc.fillColor('#27ae60').text(checker.test_marks ? checker.test_marks.toFixed(1) : '0', 340, y, { width: 40 });
      doc.fillColor('#3498db').text(checker.test_type || '-', 380, y, { width: 40 });
      doc.fillColor('#000').text(checker.education || '-', 420, y, { width: 80, ellipsis: true });
      
      y += 14;
    });

    // Footer
    doc.fontSize(8).fillColor('#7f8c8d');
    doc.text(
      'Generated by QMS Digital Apparels - Quality Management System',
      50,
      doc.page.height - 50,
      { align: 'center' }
    );

    doc.end();
    console.log('✅ Enhanced PDF generated successfully');
  } catch (error) {
    console.error('❌ PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

module.exports = router;

// Upload checker profile picture
router.post('/:id/upload-picture', authenticateToken, upload.single('picture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        // Delete old picture if exists
        const checker = await Checker.getById(req.params.id);
        if (checker && checker.picture_filename) {
            const oldPath = path.join(__dirname, '../../frontend/uploads', checker.picture_filename);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }
        
        // Update checker with new picture
        const picturePath = `/uploads/${req.file.filename}`;
        await pool.query(
            'UPDATE checkers SET profile_picture = $1, picture_filename = $2 WHERE id = $3',
            [picturePath, req.file.filename, req.params.id]
        );
        
        res.json({ 
            success: true, 
            message: 'Profile picture uploaded successfully',
            picturePath: picturePath
        });
    } catch (error) {
        console.error('❌ Upload picture error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete checker profile picture
router.delete('/:id/delete-picture', authenticateToken, async (req, res) => {
    try {
        const checker = await Checker.getById(req.params.id);
        if (checker && checker.picture_filename) {
            const filePath = path.join(__dirname, '../../frontend/uploads', checker.picture_filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        
        await pool.query(
            'UPDATE checkers SET profile_picture = NULL, picture_filename = NULL WHERE id = $1',
            [req.params.id]
        );
        
        res.json({ success: true, message: 'Profile picture deleted successfully' });
    } catch (error) {
        console.error('❌ Delete picture error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
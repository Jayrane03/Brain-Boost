const express = require('express');
const router = express.Router();
const profileController = require('../controller/profile-cont');
const authenticateToken = require('../middleware/auth');

// Profile routes
router.get('/profile', authenticateToken, profileController.getProfile);
router.post('/profile', authenticateToken, profileController.upload.single('profilePhoto'), profileController.createProfile);
router.put('/edit-profile', authenticateToken, profileController.upload.single('profilePhoto'), profileController.updateProfile);

// Home route


// Contact form route
router.post('/contact-form', authenticateToken, profileController.contactForm);

// Enrollment route
router.post('/get-enroll', authenticateToken, profileController.enrollInCourse);

module.exports = router;
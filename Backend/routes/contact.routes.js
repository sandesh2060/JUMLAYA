// ============================================
// Backend/routes/contact.routes.js
// Path: Backend/routes/contact.routes.js
// ============================================
const express = require("express");
const router = express.Router();
const {
  submitContactForm,
  getContactInfo,
  getAllContactMessages,
  getContactMessageById,
  updateContactMessageStatus,
  deleteContactMessage,
} = require("../controllers/contact.controller");
const { protect, admin } = require("../middleware/auth");
const { body } = require("express-validator");

// ============================================
// VALIDATION MIDDLEWARE
// ============================================
const contactValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("phone")
    .optional()
    .trim()
    .matches(/^[+]?[\d\s()-]+$/)
    .withMessage("Please provide a valid phone number"),

  body("subject")
    .trim()
    .notEmpty()
    .withMessage("Subject is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Subject must be between 5 and 200 characters"),

  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Message must be between 10 and 2000 characters"),
];

// ============================================
// PUBLIC ROUTES
// ============================================

// @route   POST /api/contact/submit
// @desc    Submit contact form
// @access  Public
router.post("/submit", contactValidation, submitContactForm);

// @route   GET /api/contact/info
// @desc    Get contact information
// @access  Public
router.get("/info", getContactInfo);

// ============================================
// ADMIN ROUTES
// ============================================

// @route   GET /api/contact/messages
// @desc    Get all contact messages (admin)
// @access  Private/Admin
router.get("/messages", protect, admin, getAllContactMessages);

// @route   GET /api/contact/messages/:id
// @desc    Get single contact message (admin)
// @access  Private/Admin
router.get("/messages/:id", protect, admin, getContactMessageById);

// @route   PATCH /api/contact/messages/:id/status
// @desc    Update contact message status (admin)
// @access  Private/Admin
router.patch("/messages/:id/status", protect, admin, updateContactMessageStatus);

// @route   DELETE /api/contact/messages/:id
// @desc    Delete contact message (admin)
// @access  Private/Admin
router.delete("/messages/:id", protect, admin, deleteContactMessage);

module.exports = router;
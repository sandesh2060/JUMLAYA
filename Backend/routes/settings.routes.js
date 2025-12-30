// ============================================
// settings.routes.js - Public Settings Routes
// Path: Backend/routes/settings.routes.js
// ============================================
const express = require("express");
const router = express.Router();
const Settings = require("../models/settings.model");

// ============================================
// PUBLIC SETTINGS ENDPOINT
// ============================================

// GET /api/settings - Get public settings (no auth required)
router.get("/", async (req, res) => {
  try {
    console.log("📦 Fetching public settings");

    let settings = await Settings.findOne().lean();
    // Only select public fields
    if (settings) {
      // Only expose public fields (deep copy to avoid mutation)
      settings = {
        _id: settings._id,
        storeName: settings.storeName,
        storeEmail: settings.storeEmail,
        storePhone: settings.storePhone,
        storeAddress: settings.storeAddress,
        currency: settings.currency,
        currencyCode: settings.currencyCode,
        taxRate: settings.taxRate,
        shippingFee: settings.shippingFee,
        freeShippingThreshold: settings.freeShippingThreshold,
        minOrderAmount: settings.minOrderAmount,
        maxOrderAmount: settings.maxOrderAmount,
        paymentMethods: settings.paymentMethods,
        socialMedia: settings.socialMedia,
        logo: settings.logo,
        favicon: settings.favicon,
        aboutUs: settings.aboutUs,
        returnPolicy: settings.returnPolicy,
        privacyPolicy: settings.privacyPolicy,
        termsAndConditions: settings.termsAndConditions,
        shippingPolicy: settings.shippingPolicy,
        workingHours: settings.workingHours,
        notifications: settings.notifications,
        seo: settings.seo,
        maintenanceMode: settings.maintenanceMode,
      };
    }

    // Create default settings if none exist
    if (!settings) {
      console.log("⚠️ No settings found, using defaults");
      settings = {
        storeName: "JUMLAYA",
        storeEmail: "admin@jumlaya.com",
        storePhone: "+977-9800000000",
        storeAddress: "Kathmandu, Nepal",
        currency: "रु",
        currencyCode: "NPR",
        taxRate: 13,
        shippingFee: 100,
        freeShippingThreshold: 2000,
        minOrderAmount: 100,
        maxOrderAmount: 100000,
        paymentMethods: {
          cod: { enabled: true, minAmount: 0, maxAmount: 50000 },
          esewa: { enabled: false, merchantCode: "" },
          khalti: { enabled: false, publicKey: "" },
          bankTransfer: { enabled: false },
        },
        socialMedia: {},
        logo: "/logo.png",
        favicon: "/favicon.ico",
        aboutUs: "",
        returnPolicy: "",
        privacyPolicy: "",
        termsAndConditions: "",
        shippingPolicy: "",
        workingHours: {},
        notifications: {},
        seo: {
          metaTitle: "JUMLAYA - Online Shopping in Nepal",
          metaDescription: "Shop the latest products online in Nepal",
          metaKeywords: "online shopping, nepal, ecommerce",
        },
        maintenanceMode: {
          enabled: false,
          message:
            "We are currently under maintenance. Please check back soon.",
        },
      };
    }

    console.log("✅ Public settings fetched");

    res.json({
      success: true,
      message: "Settings retrieved successfully",
      data: settings,
    });
  } catch (error) {
    console.error("❌ Error fetching public settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch settings",
      error: error.message,
    });
  }
});

module.exports = router;


// ============================================
// settings.routes.js - Public Settings Routes
// Path: Backend/routes/settings.routes.js
// ✅ UPDATED VERSION WITH CLOUDINARY LOGO SUPPORT
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
        storeLogo: settings.storeLogo || "", // ✅ ADDED: Cloudinary logo URL
        storeEmail: settings.storeEmail,
        storePhone: settings.storePhone,
        storeAddress: settings.storeAddress,
        supportEmail: settings.supportEmail, // ✅ ADDED: Support email
        supportPhone: settings.supportPhone, // ✅ ADDED: Support phone
        currency: settings.currency,
        currencyCode: settings.currencyCode,
        taxRate: settings.taxRate,
        shippingFee: settings.shippingFee,
        freeShippingThreshold: settings.freeShippingThreshold,
        minOrderAmount: settings.minOrderAmount,
        maxOrderAmount: settings.maxOrderAmount,
        paymentMethods: settings.paymentMethods,
        socialMedia: settings.socialMedia,
        logo: settings.logo, // Legacy logo field (keep for backward compatibility)
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
      
      console.log("✅ Public settings fetched");
      console.log("🖼️ Logo URL:", settings.storeLogo || settings.logo || "No logo set");
    }

    // Create default settings if none exist
    if (!settings) {
      console.log("⚠️ No settings found, creating default settings in database");
      
      // Create default settings in database
      const defaultSettings = await Settings.create({
        storeName: "JUMLAYA",
        storeLogo: "", // ✅ ADDED: Empty by default, admin will upload
        storeEmail: "info@jumlaya.com",
        storePhone: "+977-9800000000",
        storeAddress: "Kathmandu, Nepal",
        supportEmail: "support@jumlaya.com", // ✅ ADDED
        supportPhone: "+977-9800000000", // ✅ ADDED
        currency: "रु",
        currencyCode: "NPR",
        taxRate: 13,
        shippingFee: 100,
        freeShippingThreshold: 2000,
        minOrderAmount: 100,
        maxOrderAmount: 100000,
        paymentMethods: {
          cod: { enabled: true, name: "Cash on Delivery" },
          esewa: { enabled: false, merchantId: "" },
          khalti: { enabled: false, publicKey: "" },
          bankTransfer: { enabled: false, accountDetails: "" },
        },
        socialMedia: {
          facebook: "",
          instagram: "",
          twitter: "",
          youtube: "",
          tiktok: ""
        },
        logo: "/logo.png", // Legacy field
        favicon: "/favicon.ico",
        aboutUs: "",
        returnPolicy: "Items can be returned within 7 days of delivery in original condition.",
        privacyPolicy: "",
        termsAndConditions: "",
        shippingPolicy: "Free shipping on orders above रु 2000. Standard delivery takes 3-5 business days.",
        workingHours: {},
        notifications: {
          emailNotifications: true,
          orderNotifications: true,
          lowStockAlerts: true,
          customerMessages: false
        },
        seo: {
          metaTitle: "JUMLAYA - Online Shopping in Nepal",
          metaDescription: "Shop the latest products online in Nepal",
          metaKeywords: "online shopping, nepal, ecommerce",
          ogImage: ""
        },
        maintenanceMode: {
          enabled: false,
          message: "We are currently under maintenance. Please check back soon.",
        },
      });

      // Return the created settings
      settings = {
        _id: defaultSettings._id,
        storeName: defaultSettings.storeName,
        storeLogo: defaultSettings.storeLogo,
        storeEmail: defaultSettings.storeEmail,
        storePhone: defaultSettings.storePhone,
        storeAddress: defaultSettings.storeAddress,
        supportEmail: defaultSettings.supportEmail,
        supportPhone: defaultSettings.supportPhone,
        currency: defaultSettings.currency,
        currencyCode: defaultSettings.currencyCode,
        taxRate: defaultSettings.taxRate,
        shippingFee: defaultSettings.shippingFee,
        freeShippingThreshold: defaultSettings.freeShippingThreshold,
        minOrderAmount: defaultSettings.minOrderAmount,
        maxOrderAmount: defaultSettings.maxOrderAmount,
        paymentMethods: defaultSettings.paymentMethods,
        socialMedia: defaultSettings.socialMedia,
        logo: defaultSettings.logo,
        favicon: defaultSettings.favicon,
        aboutUs: defaultSettings.aboutUs,
        returnPolicy: defaultSettings.returnPolicy,
        privacyPolicy: defaultSettings.privacyPolicy,
        termsAndConditions: defaultSettings.termsAndConditions,
        shippingPolicy: defaultSettings.shippingPolicy,
        workingHours: defaultSettings.workingHours,
        notifications: defaultSettings.notifications,
        seo: defaultSettings.seo,
        maintenanceMode: defaultSettings.maintenanceMode,
      };
      
      console.log("✅ Default settings created and returned");
    }

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
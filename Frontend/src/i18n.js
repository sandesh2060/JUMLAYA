// ============================================
// FILE: i18n.js - Complete English & Nepali Translations
// Path: Frontend/src/i18n/i18n.js
// ============================================
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Translation resources
const resources = {
  en: {
    translation: {
      // ============ NAVIGATION ============
      nav: {
        home: "Home",
        products: "Products",
        about: "About",
        contact: "Contact",
        cart: "Cart",
        wishlist: "Wishlist",
        profile: "Profile",
        orders: "Orders",
        settings: "Settings",
        logout: "Logout",
        login: "Login",
        register: "Register",
        notifications: "Notifications",
      },

      // ============ COMMON ============
      search: "Search products...",
      addToCart: "Add to Cart",
      addToWishlist: "Add to Wishlist",
      buyNow: "Buy Now",
      viewDetails: "View Details",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      update: "Update",
      submit: "Submit",
      confirm: "Confirm",
      close: "Close",
      view: "View",
      filter: "Filter",
      sortBy: "Sort By",
      showAll: "Show All",

      // ============ CART ============
      emptyCart: "Your cart is empty",
      cartTotal: "Cart Total",
      checkout: "Checkout",
      continueShopping: "Continue Shopping",
      removeFromCart: "Remove from Cart",
      updateCart: "Update Cart",
      cartItems: "Cart Items",
      subtotal: "Subtotal",
      total: "Total",
      quantity: "Quantity",
      price: "Price",

      // ============ WISHLIST ============
      emptyWishlist: "Your wishlist is empty",
      moveToCart: "Move to Cart",
      removeFromWishlist: "Remove from Wishlist",

      // ============ PRODUCTS ============
      allProducts: "All Products",
      categories: "Categories",
      filterByPrice: "Filter by Price",
      inStock: "In Stock",
      outOfStock: "Out of Stock",
      addedToCart: "Added to cart",
      productDetails: "Product Details",
      description: "Description",
      specifications: "Specifications",
      reviews: "Reviews",
      rating: "Rating",
      availability: "Availability",

      // ============ CHECKOUT ============
      shippingAddress: "Shipping Address",
      paymentMethod: "Payment Method",
      orderSummary: "Order Summary",
      placeOrder: "Place Order",
      billingAddress: "Billing Address",
      shippingFee: "Shipping Fee",
      tax: "Tax",
      discount: "Discount",
      grandTotal: "Grand Total",

      // ============ ORDERS ============
      myOrders: "My Orders",
      orderHistory: "Order History",
      orderDetails: "Order Details",
      orderNumber: "Order Number",
      orderDate: "Order Date",
      orderStatus: "Order Status",
      trackOrder: "Track Order",
      cancelOrder: "Cancel Order",
      returnOrder: "Return Order",
      reorder: "Reorder",
      downloadInvoice: "Download Invoice",

      // Order Statuses
      pending: "Pending",
      confirmed: "Confirmed",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
      returned: "Returned",

      // ============ PROFILE ============
      myProfile: "My Profile",
      personalInfo: "Personal Information",
      fullName: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      address: "Address",
      city: "City",
      state: "State",
      postalCode: "Postal Code",
      country: "Country",
      changePassword: "Change Password",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmPassword: "Confirm Password",

      // ============ AUTH ============
      welcomeBack: "Welcome Back",
      createAccount: "Create Account",
      forgotPassword: "Forgot Password?",
      rememberMe: "Remember Me",
      dontHaveAccount: "Don't have an account?",
      alreadyHaveAccount: "Already have an account?",
      signUp: "Sign Up",
      signIn: "Sign In",

      // ============ NOTIFICATIONS ============
      markAllRead: "Mark all read",
      markRead: "Mark read",
      noNotifications: "No notifications",
      unread: "Unread",
      read: "Read",
      all: "All",

      // ============ MESSAGES ============
      addedToWishlist: "Added to wishlist",
      removedFromCart: "Removed from cart",
      removedFromWishlist: "Removed from wishlist",
      loggedOut: "Logged out successfully",
      pleaseLogin: "Please login first",
      orderPlaced: "Order placed successfully",
      orderCancelled: "Order cancelled",
      profileUpdated: "Profile updated successfully",
      passwordChanged: "Password changed successfully",

      // ============ FOOTER ============
      aboutUs: "About Us",
      privacyPolicy: "Privacy Policy",
      termsConditions: "Terms & Conditions",
      returnPolicy: "Return Policy",
      shippingInfo: "Shipping Information",
      followUs: "Follow Us",
      newsletter: "Newsletter",
      subscribeNewsletter: "Subscribe to our newsletter",
      enterEmail: "Enter your email",
      subscribe: "Subscribe",
      allRightsReserved: "All rights reserved",

      // ============ PAYMENT ============
      cashOnDelivery: "Cash on Delivery",
      onlinePayment: "Online Payment",
      paymentSuccess: "Payment Successful",
      paymentFailed: "Payment Failed",

      // ============ CURRENCY ============
      currency: "रु",
      currencyName: "NPR",

      // ============ ERROR MESSAGES ============
      somethingWentWrong: "Something went wrong",
      pageNotFound: "Page Not Found",
      backToHome: "Back to Home",
      invalidCredentials: "Invalid email or password",
      fillAllFields: "Please fill all required fields",

      // ============ HOME PAGE ============
      home: {
        hero: {
          badge: "100% Organic & Fresh",
          title: "Fresh & Organic",
          subtitle: "Products Delivered",
          description:
            "Experience the taste of nature with our premium selection of organic products, delivered fresh to your doorstep",
          shopNow: "Shop Now",
          learnMore: "Learn More",
        },
        stats: {
          customers: "Happy Customers",
          products: "Organic Products",
          certified: "Organic Certified",
          support: "Customer Support",
        },
        whyChoose: {
          title: "Why Choose JUMLAYA?",
          description:
            "We're committed to bringing you the finest organic products with exceptional service",
        },
        features: {
          organic: {
            title: "100% Organic",
            description: "Certified organic products from trusted farms",
          },
          delivery: {
            title: "Fast Delivery",
            description: "Quick and reliable shipping to your door",
          },
          payment: {
            title: "Secure Payment",
            description: "Safe and encrypted transactions",
          },
          quality: {
            title: "Quality Assured",
            description: "Premium quality products guaranteed",
          },
        },
        organic: {
          title: "The Organic Difference",
          description:
            "When you choose organic, you're choosing health for yourself, your family, and the planet. Our products are grown without synthetic pesticides, GMOs, or artificial additives.",
          learnMore: "Learn More About Us",
        },
        benefits: {
          fresh: "Fresh from local farms",
          noChemicals: "No harmful chemicals",
          ecoFriendly: "Eco-friendly packaging",
          fairTrade: "Fair trade certified",
          supportLocal: "Support local farmers",
          sustainable: "Sustainable sourcing",
        },
        delivery: {
          sameDay: "Same Day",
          available: "Delivery Available",
        },
        featured: {
          title: "Featured Products",
          description: "Handpicked selection of our best organic products",
          viewAll: "View All Products",
        },
        cta: {
          title: "Ready to Go Organic?",
          description:
            "Join thousands of happy customers who've made the switch to healthier, more sustainable living",
          button: "Start Shopping Now",
        },
      },

      // ============ CART PAGE - DETAILED ============
      cart: {
        title: "Shopping Cart",
        itemSingular: "item in your cart",
        itemPlural: "items in your cart",
        clearCart: "Clear Cart",
        loading: "Loading cart...",
        confirmClear: "Are you sure you want to clear your cart?",
        removeItem: "Remove item",
        checkout: "Proceed to Checkout",
        continueShopping: "Continue Shopping",
        stockWarning: "Only {{stock}} left in stock!",
        empty: {
          title: "Your Cart is Empty",
          description:
            "Looks like you haven't added anything to your cart yet. Start shopping to fill it up!",
          button: "Start Shopping",
        },
        orderSummary: {
          title: "Order Summary",
          subtotal: "Subtotal",
          tax: "Tax ({{rate}}%)",
          shipping: "Shipping",
          discount: "Discount",
          total: "Total",
          free: "FREE",
        },
        freeShipping: {
          progress: "Add {{amount}} more to get FREE shipping!",
          qualified: "✓ You've qualified for FREE shipping!",
        },
        errors: {
          updateQuantity: "Failed to update quantity",
          removeItem: "Failed to remove item",
          clearCart: "Failed to clear cart",
          loginRequired: "Please login to checkout",
        },
        success: {
          cleared: "Cart cleared",
        },
      },
     // ============ ENGLISH (en) ============
notifications: {
  title: "Notifications",
  markAllRead: "Mark all as read",
  markAsRead: "Mark as read",
  viewAll: "View all notifications",
  empty: {
    title: "No notifications yet",
    message: "You're all caught up!"
  },
  aria: {
    label: "Notifications dropdown"
  },
  orders: {
    placed: {
      title: "🎉 Order Placed Successfully!",
      message: "Your order #{{orderId}} has been placed successfully. Total: NPR {{total}}. We'll notify you once it's confirmed."
    },
    confirmed: {
      title: "✅ Order Confirmed",
      message: "Your order #{{orderId}} has been confirmed and is being prepared for shipping."
    },
    shipped: {
      title: "📦 Order Shipped",
      message: "Your order #{{orderId}} has been shipped! Track your package for delivery updates."
    },
    delivered: {
      title: "🎊 Order Delivered",
      message: "Your order #{{orderId}} has been delivered! Thank you for shopping with us."
    },
    cancelled: {
      title: "❌ Order Cancelled",
      message: "Your order #{{orderId}} has been cancelled. {{reason}}"
    },
    returned: {
      title: "↩️ Return Request Received",
      message: "Your return request for order #{{orderId}} has been received. We'll process it within 2-3 business days."
    },
    payment: {
      title: "💳 Payment Received",
      message: "Payment of NPR {{amount}} for order #{{orderId}} has been successfully received."
    }
  }
},
      // ============ ABOUT PAGE ============
      about: {
        hero: {
          title: "About {{storeName}}",
          subtitle:
            "Your trusted partner in delivering fresh, organic, and sustainable products directly to your doorstep",
        },
        stats: {
          customers: "Happy Customers",
          products: "Organic Products",
          awards: "Awards Won",
          growth: "Growth Rate",
        },
        story: {
          title: "Our Story",
          defaultText:
            "Founded in 2020, {{storeName}} started with a simple mission: to make organic, sustainable products accessible to everyone. What began as a small local initiative has grown into a thriving e-commerce platform serving thousands of customers.",
          paragraph2:
            "We believe that everyone deserves access to high-quality, chemical-free products that are good for both people and the planet. That's why we work directly with certified organic farmers and sustainable producers.",
          paragraph3:
            "Today, we're proud to offer over {{products}}+ carefully curated products, from fresh produce to eco-friendly household items, all delivered with care to your doorstep.",
          certified: "Organic Certified",
        },
        values: {
          title: "Our Values",
          subtitle:
            "The principles that guide everything we do at {{storeName}}",
          quality: {
            title: "Quality First",
            description:
              "We source only the finest organic products from certified farms and trusted suppliers.",
          },
          trust: {
            title: "Trust & Transparency",
            description:
              "Full transparency in our sourcing, pricing, and delivery process for your peace of mind.",
          },
          delivery: {
            title: "Fast Delivery",
            description:
              "Quick and reliable delivery service to ensure fresh products reach your doorstep.",
          },
          support: {
            title: "Customer Support",
            description:
              "24/7 customer support to assist you with any questions or concerns you may have.",
          },
        },
        policies: {
          title: "Our Policies",
          subtitle:
            "Learn more about how we operate and protect your interests",
          return: {
            title: "Return Policy",
            description:
              "Learn about our hassle-free return and refund process",
          },
          privacy: {
            title: "Privacy Policy",
            description: "How we protect and use your personal information",
          },
          shipping: {
            title: "Shipping Policy",
            description:
              "Delivery times, shipping costs, and tracking information",
          },
          readMore: "Read More",
          notAvailable: "This policy information is not available yet.",
        },
        team: {
          title: "Meet Our Team",
          subtitle:
            "The passionate people behind {{storeName}} who work tirelessly to bring you the best",
          founder: "Founder & CEO",
          cofounder: "Co-founder & CTO",
          director: "IT Officer & Marketing Director",
        },
        cta: {
          title: "Ready to Start Your Organic Journey?",
          subtitle:
            "Join thousands of satisfied customers who have made the switch to organic living",
          button: "Shop Now",
        },
        loading: "Loading...",
        errorLoading: "Failed to load some information",
      },

      // ============ PRODUCTS PAGE ============
      productsPage: {
        title: "All Products",
        searchResults: 'Search results for "{{query}}"',
        showing: "Showing {{count}} products",
        sortBy: "Sort By",
        filters: {
          title: "Filters",
          clear: "Clear All",
          priceRange: "Price Range",
          category: "Category",
          rating: "Rating",
          inStock: "In Stock Only",
          apply: "Apply Filters",
        },
        sortOptions: {
          newest: "Newest",
          priceAsc: "Price: Low to High",
          priceDesc: "Price: High to Low",
          nameAsc: "Name: A-Z",
          nameDesc: "Name: Z-A",
          popular: "Most Popular",
        },
        noResults: "No products found",
        noResultsMessage: "Try adjusting your filters or search terms",
        loading: "Loading products...",
      },

      // ============ PAGINATION ============
      pagination: {
        previous: "Previous page",
        next: "Next page",
        page: "Page {{page}}",
      },

      // ============ MODAL ============
      modal: {
        close: "Close",
        closeOverlay: "Close modal",
      },

      // ============ PRODUCT CARD ============
      productCard: {
        addToCart: "Add to cart",
        addToWishlist: "Add to wishlist",
        removeFromWishlist: "Remove from wishlist",
        off: "OFF",
        outOfStock: "Out of Stock",
        stockLeft: "Only {{stock}} left in stock!",
        errors: {
          loginWishlist: "Please login to manage your wishlist",
          loginCart: "Please login to add items to cart",
          outOfStock: "This product is out of stock",
        },
      },

      // ============ PRODUCT FILTERS ============
      productFilters: {
        activeFilters: "Active Filters",
      },

      // ============ PRODUCT DETAILS ============
      productDetails: {
        notFound: "Product not found",
        reviewsCount: "reviews",
        available: "available",
        adding: "Adding...",
        addedToCart: "Added to Cart",
        category: "Category",
        productDescription: "Product Description",
        reviews: {
          basedOn: "Based on {{count}} reviews",
          writeReview: "Write a Review",
          submitSuccess: "Review submitted successfully!",
        },
        errors: {
          loadFailed: "Failed to load product",
        },
      },

      // ============ NOTIFICATIONS ============
      notifications: {
        title: "Notifications",
        markAllRead: "Mark all as read",
        markAsRead: "Mark as read",
        clearAll: "Clear all",
        confirmClearAll: "Are you sure you want to clear all notifications?",
        viewAll: "View all notifications",
        empty: {
          title: "No notifications yet",
          message: "We'll notify you when something important happens",
        },
        aria: {
          label: "Notifications",
        },
      },

      // ============ NAVBAR ============
      navbar: {
        brandName: "JUMLAYA",
        addedToCart: "Added to Cart • {{count}} {{items}}",
        item: "item",
        items: "items",
        noResults: "No results found",
        toggleTheme: "Toggle theme",
        changeLanguage: "Change language",
        userMenu: "User menu",
        user: "User",
        viewProfile: "View and edit profile",
        trackOrders: "Track and manage orders",
        viewSaved: "View saved items",
        accountPreferences: "Account preferences",
        mobileMenu: "Mobile menu",
        light: "Light",
        dark: "Dark",
        wishlist: "Wishlist",
        cart: "Cart",
        setting: "Settings",
      },
    },
  },
  ne: {
    translation: {
      // ============ NAVIGATION (नेपाली) ============
      nav: {
        home: "गृहपृष्ठ",
        products: "उत्पादनहरू",
        about: "हाम्रो बारेमा",
        contact: "सम्पर्क",
        cart: "कार्ट",
        wishlist: "इच्छा सूची",
        profile: "प्रोफाइल",
        orders: "अर्डरहरू",
        settings: "सेटिङहरू",
        logout: "लगआउट",
        login: "लगइन",
        register: "दर्ता गर्नुहोस्",
        notifications: "सूचनाहरू",
      },

      // ============ COMMON ============
      search: "उत्पादनहरू खोज्नुहोस्...",
      addToCart: "कार्टमा थप्नुहोस्",
      addToWishlist: "इच्छा सूचीमा थप्नुहोस्",
      buyNow: "अहिले किन्नुहोस्",
      viewDetails: "विवरण हेर्नुहोस्",
      loading: "लोड हुँदैछ...",
      error: "त्रुटि",
      success: "सफलता",
      save: "सुरक्षित गर्नुहोस्",
      cancel: "रद्द गर्नुहोस्",
      delete: "मेटाउनुहोस्",
      edit: "सम्पादन गर्नुहोस्",
      update: "अपडेट गर्नुहोस्",
      submit: "पेश गर्नुहोस्",
      confirm: "पुष्टि गर्नुहोस्",
      close: "बन्द गर्नुहोस्",
      view: "हेर्नुहोस्",
      filter: "फिल्टर",
      sortBy: "क्रमबद्ध गर्नुहोस्",
      showAll: "सबै देखाउनुहोस्",

      // ============ CART ============
      emptyCart: "तपाईंको कार्ट खाली छ",
      cartTotal: "कार्ट कुल",
      checkout: "चेकआउट",
      continueShopping: "किनमेल जारी राख्नुहोस्",
      removeFromCart: "कार्टबाट हटाउनुहोस्",
      updateCart: "कार्ट अपडेट गर्नुहोस्",
      cartItems: "कार्ट वस्तुहरू",
      subtotal: "उप-योग",
      total: "कुल",
      quantity: "परिमाण",
      price: "मूल्य",

      // ============ WISHLIST ============
      emptyWishlist: "तपाईंको इच्छा सूची खाली छ",
      moveToCart: "कार्टमा सार्नुहोस्",
      removeFromWishlist: "इच्छा सूचीबाट हटाउनुहोस्",

      // ============ PRODUCTS ============
      allProducts: "सबै उत्पादनहरू",
      categories: "श्रेणीहरू",
      filterByPrice: "मूल्य अनुसार फिल्टर गर्नुहोस्",
      inStock: "स्टकमा छ",
      outOfStock: "स्टक सकियो",
      addedToCart: "कार्टमा थपियो",
      productDetails: "उत्पादन विवरण",
      description: "विवरण",
      specifications: "विशिष्टताहरू",
      reviews: "समीक्षाहरू",
      rating: "मूल्याङ्कन",
      availability: "उपलब्धता",

      // ============ CHECKOUT ============
      shippingAddress: "ढुवानी ठेगाना",
      paymentMethod: "भुक्तानी विधि",
      orderSummary: "अर्डर सारांश",
      placeOrder: "अर्डर गर्नुहोस्",
      billingAddress: "बिलिङ ठेगाना",
      shippingFee: "ढुवानी शुल्क",
      tax: "कर",
      discount: "छुट",
      grandTotal: "कुल जम्मा",

      // ============ ORDERS ============
      myOrders: "मेरा अर्डरहरू",
      orderHistory: "अर्डर इतिहास",
      orderDetails: "अर्डर विवरण",
      orderNumber: "अर्डर नम्बर",
      orderDate: "अर्डर मिति",
      orderStatus: "अर्डर स्थिति",
      trackOrder: "अर्डर ट्र्याक गर्नुहोस्",
      cancelOrder: "अर्डर रद्द गर्नुहोस्",
      returnOrder: "अर्डर फिर्ता गर्नुहोस्",
      reorder: "पुन: अर्डर गर्नुहोस्",
      downloadInvoice: "बीजक डाउनलोड गर्नुहोस्",

      // Order Statuses
      pending: "पेन्डिङ",
      confirmed: "पुष्टि भयो",
      processing: "प्रक्रियामा छ",
      shipped: "पठाइएको",
      delivered: "डेलिभर भयो",
      cancelled: "रद्द गरियो",
      returned: "फिर्ता गरियो",

      // ============ PROFILE ============
      myProfile: "मेरो प्रोफाइल",
      personalInfo: "व्यक्तिगत जानकारी",
      fullName: "पूरा नाम",
      email: "इमेल ठेगाना",
      phone: "फोन नम्बर",
      address: "ठेगाना",
      city: "शहर",
      state: "प्रदेश",
      postalCode: "हुलाक कोड",
      country: "देश",
      changePassword: "पासवर्ड परिवर्तन गर्नुहोस्",
      currentPassword: "हालको पासवर्ड",
      newPassword: "नयाँ पासवर्ड",
      confirmPassword: "पासवर्ड पुष्टि गर्नुहोस्",

      // ============ AUTH ============
      welcomeBack: "फेरि स्वागत छ",
      createAccount: "खाता सिर्जना गर्नुहोस्",
      forgotPassword: "पासवर्ड बिर्सनुभयो?",
      rememberMe: "मलाई सम्झनुहोस्",
      dontHaveAccount: "खाता छैन?",
      alreadyHaveAccount: "पहिले नै खाता छ?",
      signUp: "साइन अप",
      signIn: "साइन इन",

      // ============ NOTIFICATIONS ============
      markAllRead: "सबै पढिएको चिन्ह लगाउनुहोस्",
      markRead: "पढिएको चिन्ह लगाउनुहोस्",
      noNotifications: "कुनै सूचना छैन",
      unread: "नपढिएको",
      read: "पढिएको",
      all: "सबै",

      // ============ MESSAGES ============
      addedToWishlist: "इच्छा सूचीमा थपियो",
      removedFromCart: "कार्टबाट हटाइयो",
      removedFromWishlist: "इच्छा सूचीबाट हटाइयो",
      loggedOut: "सफलतापूर्वक लगआउट भयो",
      pleaseLogin: "कृपया पहिले लगइन गर्नुहोस्",
      orderPlaced: "अर्डर सफलतापूर्वक राखियो",
      orderCancelled: "अर्डर रद्द गरियो",
      profileUpdated: "प्रोफाइल सफलतापूर्वक अपडेट भयो",
      passwordChanged: "पासवर्ड सफलतापूर्वक परिवर्तन भयो",

      // ============ FOOTER ============
      aboutUs: "हाम्रो बारेमा",
      privacyPolicy: "गोपनीयता नीति",
      termsConditions: "नियम र शर्तहरू",
      returnPolicy: "फिर्ता नीति",
      shippingInfo: "ढुवानी जानकारी",
      followUs: "हामीलाई फलो गर्नुहोस्",
      newsletter: "न्यूजलेटर",
      subscribeNewsletter: "हाम्रो न्यूजलेटर सदस्यता लिनुहोस्",
      enterEmail: "आफ्नो इमेल प्रविष्ट गर्नुहोस्",
      subscribe: "सदस्यता लिनुहोस्",
      allRightsReserved: "सर्वाधिकार सुरक्षित",

      // ============ PAYMENT ============
      cashOnDelivery: "डेलिभरीमा नगद",
      onlinePayment: "अनलाइन भुक्तानी",
      paymentSuccess: "भुक्तानी सफल भयो",
      paymentFailed: "भुक्तानी असफल भयो",

      // ============ CURRENCY ============
      currency: "रु",
      currencyName: "NPR",

      // ============ ERROR MESSAGES ============
      somethingWentWrong: "केही गलत भयो",
      pageNotFound: "पृष्ठ फेला परेन",
      backToHome: "गृहपृष्ठमा फर्कनुहोस्",
      invalidCredentials: "अवैध इमेल वा पासवर्ड",
      fillAllFields: "कृपया सबै आवश्यक फिल्डहरू भर्नुहोस्",

      // ============ HOME PAGE ============
      home: {
        hero: {
          badge: "१००% जैविक र ताजा",
          title: "ताजा र जैविक",
          subtitle: "उत्पादनहरू डेलिभर",
          description:
            "हाम्रो प्रिमियम जैविक उत्पादनहरूको चयन संग प्रकृतिको स्वाद अनुभव गर्नुहोस्, तपाईंको ढोकामा ताजा डेलिभर गरिन्छ",
          shopNow: "अहिले किन्नुहोस्",
          learnMore: "थप जान्नुहोस्",
        },
        stats: {
          customers: "खुशी ग्राहकहरू",
          products: "जैविक उत्पादनहरू",
          certified: "जैविक प्रमाणित",
          support: "ग्राहक सहायता",
        },
        whyChoose: {
          title: "किन JUMLAYA छनोट गर्ने?",
          description:
            "हामी तपाईंलाई उत्कृष्ट सेवाको साथ उत्तम जैविक उत्पादनहरू ल्याउन प्रतिबद्ध छौं",
        },
        features: {
          organic: {
            title: "१००% जैविक",
            description: "विश्वसनीय फार्महरूबाट प्रमाणित जैविक उत्पादनहरू",
          },
          delivery: {
            title: "छिटो डेलिभरी",
            description: "तपाईंको ढोकामा छिटो र भरपर्दो ढुवानी",
          },
          payment: {
            title: "सुरक्षित भुक्तानी",
            description: "सुरक्षित र एन्क्रिप्टेड लेनदेन",
          },
          quality: {
            title: "गुणस्तर सुनिश्चित",
            description: "प्रिमियम गुणस्तरको उत्पादनहरू ग्यारेन्टी",
          },
        },
        organic: {
          title: "जैविक भिन्नता",
          description:
            "जब तपाईं जैविक छनोट गर्नुहुन्छ, तपाईं आफ्नो, आफ्नो परिवार र ग्रहको लागि स्वास्थ्य छनोट गर्दै हुनुहुन्छ। हाम्रा उत्पादनहरू सिंथेटिक कीटनाशक, GMO, वा कृत्रिम additives बिना उब्जाइन्छ।",
          learnMore: "हाम्रो बारेमा थप जान्नुहोस्",
        },
        benefits: {
          fresh: "स्थानीय फार्महरूबाट ताजा",
          noChemicals: "हानिकारक रसायन छैन",
          ecoFriendly: "पर्यावरण मैत्री प्याकेजिङ",
          fairTrade: "फेयर ट्रेड प्रमाणित",
          supportLocal: "स्थानीय किसानहरूलाई समर्थन",
          sustainable: "दिगो स्रोत",
        },
        delivery: {
          sameDay: "सोही दिन",
          available: "डेलिभरी उपलब्ध",
        },
        featured: {
          title: "विशेष उत्पादनहरू",
          description: "हाम्रा उत्कृष्ट जैविक उत्पादनहरूको चयन",
          viewAll: "सबै उत्पादनहरू हेर्नुहोस्",
        },
        cta: {
          title: "जैविकमा जान तयार हुनुहुन्छ?",
          description:
            "हजारौं खुशी ग्राहकहरूसँग सामेल हुनुहोस् जसले स्वस्थ, अधिक दिगो जीवनमा स्विच गरेका छन्",
          button: "अहिले किनमेल सुरु गर्नुहोस्",
        },
      },
     // ============ NEPALI (ne) ============
notifications: {
  title: "सूचनाहरू",
  markAllRead: "सबै पढिएको चिन्ह लगाउनुहोस्",
  markAsRead: "पढिएको चिन्ह लगाउनुहोस्",
  viewAll: "सबै सूचनाहरू हेर्नुहोस्",
  empty: {
    title: "अझै कुनै सूचना छैन",
    message: "तपाईं सबै अद्यावधिक हुनुहुन्छ!"
  },
  aria: {
    label: "सूचना ड्रपडाउन"
  },
  orders: {
    placed: {
      title: "🎉 अर्डर सफलतापूर्वक राखियो!",
      message: "तपाईंको अर्डर #{{orderId}} सफलतापूर्वक राखिएको छ। कुल: रु {{total}}। यो पुष्टि भएपछि हामी तपाईंलाई सूचित गर्नेछौं।"
    },
    confirmed: {
      title: "✅ अर्डर पुष्टि भयो",
      message: "तपाईंको अर्डर #{{orderId}} पुष्टि भएको छ र ढुवानीको लागि तयार भइरहेको छ।"
    },
    shipped: {
      title: "📦 अर्डर पठाइयो",
      message: "तपाईंको अर्डर #{{orderId}} पठाइएको छ! डेलिभरी अपडेटको लागि आफ्नो प्याकेज ट्र्याक गर्नुहोस्।"
    },
    delivered: {
      title: "🎊 अर्डर डेलिभर भयो",
      message: "तपाईंको अर्डर #{{orderId}} डेलिभर भएको छ! हामीसँग किनमेल गर्नुभएकोमा धन्यवाद।"
    },
    cancelled: {
      title: "❌ अर्डर रद्द गरियो",
      message: "तपाईंको अर्डर #{{orderId}} रद्द गरिएको छ। {{reason}}"
    },
    returned: {
      title: "↩️ फिर्ता अनुरोध प्राप्त भयो",
      message: "अर्डर #{{orderId}} को लागि तपाईंको फिर्ता अनुरोध प्राप्त भएको छ। हामी यसलाई २-३ कार्य दिन भित्र प्रशोधन गर्नेछौं।"
    },
    payment: {
      title: "💳 भुक्तानी प्राप्त भयो",
      message: "अर्डर #{{orderId}} को लागि रु {{amount}} को भुक्तानी सफलतापूर्वक प्राप्त भएको छ।"
    }
  }
},
      // ============ CART PAGE - DETAILED (नेपाली) ============
      cart: {
        title: "किनमेल कार्ट",
        itemSingular: "वस्तु तपाईंको कार्टमा",
        itemPlural: "वस्तुहरू तपाईंको कार्टमा",
        clearCart: "कार्ट खाली गर्नुहोस्",
        loading: "कार्ट लोड हुँदैछ...",
        confirmClear: "के तपाईं आफ्नो कार्ट खाली गर्न निश्चित हुनुहुन्छ?",
        removeItem: "वस्तु हटाउनुहोस्",
        checkout: "चेकआउटमा जानुहोस्",
        continueShopping: "किनमेल जारी राख्नुहोस्",
        stockWarning: "स्टकमा मात्र {{stock}} बाँकी छ!",
        empty: {
          title: "तपाईंको कार्ट खाली छ",
          description:
            "तपाईंले अझै आफ्नो कार्टमा केही थप्नुभएको छैन जस्तो देखिन्छ। यसलाई भर्न किनमेल सुरु गर्नुहोस्!",
          button: "किनमेल सुरु गर्नुहोस्",
        },
        orderSummary: {
          title: "अर्डर सारांश",
          subtotal: "उप-योग",
          tax: "कर ({{rate}}%)",
          shipping: "ढुवानी",
          discount: "छुट",
          total: "कुल",
          free: "नि:शुल्क",
        },
        freeShipping: {
          progress: "नि:शुल्क ढुवानी पाउन {{amount}} थप थप्नुहोस्!",
          qualified: "✓ तपाईंले नि:शुल्क ढुवानीको लागि योग्य हुनुभयो!",
        },
        errors: {
          updateQuantity: "परिमाण अपडेट गर्न असफल भयो",
          removeItem: "वस्तु हटाउन असफल भयो",
          clearCart: "कार्ट खाली गर्न असफल भयो",
          loginRequired: "कृपया चेकआउट गर्न लगइन गर्नुहोस्",
        },
        success: {
          cleared: "कार्ट खाली गरियो",
        },
      },

      // ============ ABOUT PAGE (नेपाली) ============
      about: {
        hero: {
          title: "{{storeName}} को बारेमा",
          subtitle:
            "तपाईंको ढोकामा ताजा, जैविक र दिगो उत्पादनहरू पुर्याउन तपाईंको विश्वसनीय साझेदार",
        },
        stats: {
          customers: "खुशी ग्राहकहरू",
          products: "जैविक उत्पादनहरू",
          awards: "पुरस्कारहरू जितेका",
          growth: "वृद्धि दर",
        },
        story: {
          title: "हाम्रो कथा",
          defaultText:
            "२०२० मा स्थापित, {{storeName}} एक सरल मिशनको साथ सुरु भयो: जैविक, दिगो उत्पादनहरू सबैको लागि पहुँचयोग्य बनाउन। जुन एक सानो स्थानीय पहलको रूपमा सुरु भयो, अब हजारौं ग्राहकहरूलाई सेवा दिने एक फस्टाउने ई-कमर्स प्लेटफर्ममा विकसित भएको छ।",
          paragraph2:
            "हामी विश्वास गर्छौं कि सबैले उच्च गुणस्तरको, रसायन-मुक्त उत्पादनहरूमा पहुँच पाउनुपर्छ जुन मानिसहरू र ग्रह दुवैको लागि राम्रो छ। त्यसैले हामी प्रमाणित जैविक किसानहरू र दिगो उत्पादकहरूसँग सीधै काम गर्छौं।",
          paragraph3:
            "आज, हामी {{products}}+ भन्दा बढी सावधानीपूर्वक चयन गरिएका उत्पादनहरू प्रदान गर्न गर्व गर्छौं, ताजा उत्पादनदेखि पर्यावरण-मैत्री घरेलु वस्तुहरू सम्म, सबै तपाईंको ढोकामा हेरचाहको साथ डेलिभर गरिन्छ।",
          certified: "जैविक प्रमाणित",
        },
        values: {
          title: "हाम्रा मूल्यहरू",
          subtitle:
            "{{storeName}} मा हामीले गर्ने सबै कुरालाई मार्गदर्शन गर्ने सिद्धान्तहरू",
          quality: {
            title: "गुणस्तर पहिलो",
            description:
              "हामी प्रमाणित फार्महरू र विश्वसनीय आपूर्तिकर्ताहरूबाट मात्र उत्कृष्ट जैविक उत्पादनहरू स्रोत गर्छौं।",
          },
          trust: {
            title: "विश्वास र पारदर्शिता",
            description:
              "तपाईंको मानसिक शान्तिको लागि हाम्रो स्रोत, मूल्य निर्धारण र डेलिभरी प्रक्रियामा पूर्ण पारदर्शिता।",
          },
          delivery: {
            title: "छिटो डेलिभरी",
            description:
              "ताजा उत्पादनहरू तपाईंको ढोकामा पुग्न सुनिश्चित गर्न छिटो र भरपर्दो डेलिभरी सेवा।",
          },
          support: {
            title: "ग्राहक सहायता",
            description:
              "तपाईंसँग भएका कुनै पनि प्रश्न वा चिन्तामा सहायता गर्न 24/7 ग्राहक सहायता।",
          },
        },
        policies: {
          title: "हाम्रा नीतिहरू",
          subtitle:
            "हामी कसरी सञ्चालन गर्छौं र तपाईंको हितको रक्षा गर्छौं भन्ने बारे थप जान्नुहोस्",
          return: {
            title: "फिर्ता नीति",
            description:
              "हाम्रो सजिलो फिर्ता र रिफन्ड प्रक्रियाको बारेमा जान्नुहोस्",
          },
          privacy: {
            title: "गोपनीयता नीति",
            description:
              "हामी तपाईंको व्यक्तिगत जानकारीलाई कसरी सुरक्षित र प्रयोग गर्छौं",
          },
          shipping: {
            title: "ढुवानी नीति",
            description: "डेलिभरी समय, ढुवानी लागत र ट्र्याकिङ जानकारी",
          },
          readMore: "थप पढ्नुहोस्",
          notAvailable: "यो नीति जानकारी अझै उपलब्ध छैन।",
        },
        team: {
          title: "हाम्रो टोलीलाई भेट्नुहोस्",
          subtitle:
            "{{storeName}} पछाडि भावुक मानिसहरू जसले तपाईंलाई उत्कृष्ट ल्याउन अथक परिश्रम गर्छन्",
          founder: "संस्थापक र CEO",
          cofounder: "सह-संस्थापक र CTO",
          director: "IT अधिकारी र मार्केटिङ निर्देशक",
        },
        cta: {
          title: "आफ्नो जैविक यात्रा सुरु गर्न तयार हुनुहुन्छ?",
          subtitle:
            "हजारौं सन्तुष्ट ग्राहकहरूसँग सामेल हुनुहोस् जसले जैविक जीवनमा स्विच गरेका छन्",
          button: "अहिले किन्नुहोस्",
        },
        loading: "लोड हुँदैछ...",
        errorLoading: "केही जानकारी लोड गर्न असफल भयो",
      },

      // ============ PRODUCTS PAGE (नेपाली) ============
      productsPage: {
        title: "सबै उत्पादनहरू",
        searchResults: '"{{query}}" को खोज परिणामहरू',
        showing: "{{count}} उत्पादनहरू देखाउँदै",
        sortBy: "क्रमबद्ध गर्नुहोस्",
        filters: {
          title: "फिल्टरहरू",
          clear: "सबै हटाउनुहोस्",
          priceRange: "मूल्य दायरा",
          category: "श्रेणी",
          rating: "मूल्याङ्कन",
          inStock: "स्टकमा मात्र",
          apply: "फिल्टर लागू गर्नुहोस्",
        },
        sortOptions: {
          newest: "नयाँ",
          priceAsc: "मूल्य: कम देखि उच्च",
          priceDesc: "मूल्य: उच्च देखि कम",
          nameAsc: "नाम: क देखि ज्ञ",
          nameDesc: "नाम: ज्ञ देखि क",
          popular: "सबैभन्दा लोकप्रिय",
        },
        noResults: "कुनै उत्पादन फेला परेन",
        noResultsMessage:
          "आफ्नो फिल्टर वा खोज शब्दहरू समायोजन गर्ने प्रयास गर्नुहोस्",
        loading: "उत्पादनहरू लोड हुँदैछ...",
      },

      // ============ PAGINATION (नेपाली) ============
      pagination: {
        previous: "अघिल्लो पृष्ठ",
        next: "अर्को पृष्ठ",
        page: "पृष्ठ {{page}}",
      },

      // ============ MODAL (नेपाली) ============
      modal: {
        close: "बन्द गर्नुहोस्",
        closeOverlay: "मोडल बन्द गर्नुहोस्",
      },

      // ============ PRODUCT CARD (नेपाली) ============
      productCard: {
        addToCart: "कार्टमा थप्नुहोस्",
        addToWishlist: "इच्छा सूचीमा थप्नुहोस्",
        removeFromWishlist: "इच्छा सूचीबाट हटाउनुहोस्",
        off: "छुट",
        outOfStock: "स्टक सकियो",
        stockLeft: "स्टकमा मात्र {{stock}} बाँकी छ!",
        errors: {
          loginWishlist:
            "कृपया आफ्नो इच्छा सूची व्यवस्थापन गर्न लगइन गर्नुहोस्",
          loginCart: "कृपया कार्टमा वस्तुहरू थप्न लगइन गर्नुहोस्",
          outOfStock: "यो उत्पादन स्टक सकिएको छ",
        },
      },

      // ============ PRODUCT FILTERS (नेपाली) ============
      productFilters: {
        activeFilters: "सक्रिय फिल्टरहरू",
      },

      // ============ PRODUCT DETAILS (नेपाली) ============
      productDetails: {
        notFound: "उत्पादन फेला परेन",
        reviewsCount: "समीक्षाहरू",
        available: "उपलब्ध",
        adding: "थप्दै...",
        addedToCart: "कार्टमा थपियो",
        category: "श्रेणी",
        productDescription: "उत्पादन विवरण",
        reviews: {
          basedOn: "{{count}} समीक्षाहरूमा आधारित",
          writeReview: "समीक्षा लेख्नुहोस्",
          submitSuccess: "समीक्षा सफलतापूर्वक पेश गरियो!",
        },
        errors: {
          loadFailed: "उत्पादन लोड गर्न असफल भयो",
        },
      },

      // ============ NAVBAR (नेपाली) ============
      navbar: {
        brandName: "जुम्लया",
        addedToCart: "कार्टमा थपियो • {{count}} {{items}}",
        item: "वस्तु",
        items: "वस्तुहरू",
        noResults: "कुनै परिणाम फेला परेन",
        toggleTheme: "थिम टगल गर्नुहोस्",
        changeLanguage: "भाषा परिवर्तन गर्नुहोस्",
        userMenu: "प्रयोगकर्ता मेनु",
        user: "प्रयोगकर्ता",
        viewProfile: "प्रोफाइल हेर्नुहोस् र सम्पादन गर्नुहोस्",
        trackOrders: "अर्डरहरू ट्र्याक र व्यवस्थापन गर्नुहोस्",
        viewSaved: "सुरक्षित वस्तुहरू हेर्नुहोस्",
        accountPreferences: "खाता प्राथमिकताहरू",
        wishlistPreferences: "इच्छा सूची प्राथमिकताहरू",
        mobileMenu: "मोबाइल मेनु",
        light: "उज्यालो",
        dark: "अँध्यारो",
      },
      notifications: {
        title: "सूचनाहरू",
        markAllRead: "सबै पढिएको चिन्ह लगाउनुहोस्",
        markAsRead: "पढिएको चिन्ह लगाउनुहोस्",
        clearAll: "सबै खाली गर्नुहोस्",
        confirmClearAll: "के तपाईं सबै सूचनाहरू खाली गर्न निश्चित हुनुहुन्छ?",
        viewAll: "सबै सूचनाहरू हेर्नुहोस्",
        empty: {
          title: "अझै कुनै सूचना छैन",
          message: "केही महत्त्वपूर्ण हुँदा हामी तपाईंलाई सूचित गर्नेछौं",
        },
        aria: {
          label: "सूचनाहरू",
        },
      },
      orders: {
        placed: {
          title: "🎉 अर्डर सफलतापूर्वक राखियो!",
          message:
            "तपाईंको अर्डर #{{orderId}} सफलतापूर्वक राखिएको छ। कुल: रु{{total}}। यो पुष्टि भएपछि हामी तपाईंलाई सूचित गर्नेछौं।",
        },
        confirmed: {
          title: "✅ अर्डर पुष्टि भयो",
          message:
            "तपाईंको अर्डर #{{orderId}} पुष्टि भएको छ र ढुवानीको लागि तयार भइरहेको छ।",
        },
        shipped: {
          title: "📦 अर्डर पठाइयो",
          message:
            "तपाईंको अर्डर #{{orderId}} पठाइएको छ! डेलिभरी अपडेटको लागि आफ्नो प्याकेज ट्र्याक गर्नुहोस्।",
        },
        delivered: {
          title: "🎊 अर्डर डेलिभर भयो",
          message:
            "तपाईंको अर्डर #{{orderId}} डेलिभर भएको छ! हामीसँग किनमेल गर्नुभएकोमा धन्यवाद।",
        },
        cancelled: {
          title: "❌ अर्डर रद्द गरियो",
          message: "तपाईंको अर्डर #{{orderId}} रद्द गरिएको छ। {{reason}}",
        },
        returned: {
          title: "↩️ फिर्ता अनुरोध प्राप्त भयो",
          message:
            "अर्डर #{{orderId}} को लागि तपाईंको फिर्ता अनुरोध प्राप्त भएको छ। हामी यसलाई २-३ कार्य दिन भित्र प्रशोधन गर्नेछौं।",
        },
        payment: {
          title: "💳 भुक्तानी प्राप्त भयो",
          message:
            "अर्डर #{{orderId}} को लागि रु{{amount}} को भुक्तानी सफलतापूर्वक प्राप्त भएको छ।",
        },
      },
      wishlist: {
        backInStock: {
          title: "🎯 इच्छा सूची वस्तु उपलब्ध छ",
          message:
            "सुसमाचार! तपाईंको इच्छा सूचीबाट {{productName}} अब स्टकमा फर्केको छ।",
        },
      },

      // Product Notifications (उत्पादन सूचनाहरू)
      products: {
        priceDrop: {
          title: "💰 मूल्य घटाउने सूचना",
          message:
            "{{productName}} को मूल्य रु{{oldPrice}} बाट रु{{newPrice}} मा झरेको छ! {{discount}}% बचत गर्नुहोस्।",
        },
      },

      // Account Notifications (खाता सूचनाहरू)
      account: {
        welcome: {
          title: "🎉 JUMLAYA मा स्वागत छ!",
          message:
            "स्वागत छ {{userName}}! हामीसँग सामेल हुनुभएकोमा धन्यवाद। आज हाम्रा जैविक उत्पादनहरू अन्वेषण गर्न सुरु गर्नुहोस्।",
        },
      },

      // Promotional Notifications (प्रवर्धनात्मक सूचनाहरू)
      promotions: {
        special: {
          title: "🎁 तपाईंको लागि विशेष प्रस्ताव!",
          message:
            "आफ्नो अर्को खरिदमा {{discount}}% छुट पाउनुहोस्! कोड प्रयोग गर्नुहोस्: {{code}}",
        },
      },
      profilePage: {
        title: "मेरो प्रोफाइल",
        subtitle: "आफ्नो खाता सेटिङ र प्राथमिकताहरू व्यवस्थापन गर्नुहोस्",

        tabs: {
          profile: "प्रोफाइल",
          security: "सुरक्षा",
          addresses: "ठेगानाहरू",
          settings: "सेटिङहरू",
        },

        security: {
          title: "सुरक्षा सेटिङ",
          subtitle: "आफ्नो खाता सुरक्षित राख्नुहोस्",
        },

        buttons: {
          saveChanges: "परिवर्तन सुरक्षित गर्नुहोस्",
          changePassword: "पासवर्ड परिवर्तन गर्नुहोस्",
          addAddress: "नयाँ ठेगाना थप्नुहोस्",
          addFirstAddress: "ठेगाना थप्नुहोस्",
          edit: "सम्पादन",
          setDefault: "डिफल्ट बनाउनुहोस्",
          delete: "हटाउनुहोस्",
        },

        confirmations: {
          genericTitle: "पुष्टि गर्नुहोस्",
          yes: "हो, जारी राख्नुहोस्",
          cancel: "रद्द गर्नुहोस्",
          changePassword: "के तपाईं पासवर्ड परिवर्तन गर्न निश्चित हुनुहुन्छ?",
          deleteAddress: "के तपाईं यो ठेगाना हटाउन निश्चित हुनुहुन्छ?",
          changeLanguage: "के तपाईं भाषा परिवर्तन गर्न चाहनुहुन्छ?",
        },

        messages: {
          loadingProfile: "प्रोफाइल लोड हुँदैछ...",
          profileUpdated: "प्रोफाइल सफलतापूर्वक अपडेट भयो!",
          passwordChanged: "पासवर्ड सफलतापूर्वक परिवर्तन भयो!",
          addressAdded: "ठेगाना थपियो!",
          addressUpdated: "ठेगाना अपडेट भयो!",
          addressDeleted: "ठेगाना सफलतापूर्वक हटाइयो!",
          languageChanged: "भाषा परिवर्तन भयो!",
          noAddresses: "अहिलेसम्म कुनै ठेगाना छैन।",
          addFirstAddressHint: "सुरु गर्न पहिलो ठेगाना थप्नुहोस्!",
        },

        password: {
          hint: "कम्तीमा ८ अक्षर हुनुपर्छ",
          mismatch: "पासवर्ड मिलेन",
          length: "पासवर्ड कम्तीमा ८ अक्षर हुनुपर्छ",
        },

        settings: {
          language: "भाषा सेटिङ",
          theme: "थिम सेटिङ",
          light: "उज्यालो मोड",
          dark: "अँध्यारो मोड",
          toggle: "टगल",
        },

        addressModal: {
          add: "ठेगाना थप्नुहोस्",
          edit: "ठेगाना सम्पादन गर्नुहोस्",
          setDefault: "डिफल्ट बनाउनुहोस्",
        },

        readonly: "परिवर्तन गर्न मिल्दैन",
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    debug: false,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;

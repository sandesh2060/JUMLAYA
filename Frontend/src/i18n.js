// ============================================
// FILE: i18n.js
// Path: Frontend/src/i18n/i18n.js
// ============================================
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
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
      
      // Common
      search: "Search products...",
      addToCart: "Add to Cart",
      addToWishlist: "Add to Wishlist",
      buyNow: "Buy Now",
      viewDetails: "View Details",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      
      // Cart
      emptyCart: "Your cart is empty",
      cartTotal: "Cart Total",
      checkout: "Checkout",
      continueShoppingShoppingng: "Continue Shopping",
      
      // Messages
      addedToCart: "Added to cart",
      addedToWishlist: "Added to wishlist",
      removedFromCart: "Removed from cart",
      removedFromWishlist: "Removed from wishlist",
      loggedOut: "Logged out successfully",
      pleaseLogin: "Please login first",
    }
  },
  es: {
    translation: {
      home: "Inicio",
      products: "Productos",
      about: "Acerca de",
      contact: "Contacto",
      cart: "Carrito",
      wishlist: "Lista de deseos",
      profile: "Perfil",
      orders: "Pedidos",
      settings: "Configuración",
      logout: "Cerrar sesión",
      login: "Iniciar sesión",
      register: "Registrarse",
      
      search: "Buscar productos...",
      addToCart: "Añadir al carrito",
      addToWishlist: "Añadir a favoritos",
      buyNow: "Comprar ahora",
      viewDetails: "Ver detalles",
      loading: "Cargando...",
      error: "Error",
      success: "Éxito",
      
      emptyCart: "Tu carrito está vacío",
      cartTotal: "Total del carrito",
      checkout: "Finalizar compra",
      continueShopping: "Seguir comprando",
      
      addedToCart: "Añadido al carrito",
      addedToWishlist: "Añadido a favoritos",
      removedFromCart: "Eliminado del carrito",
      removedFromWishlist: "Eliminado de favoritos",
      loggedOut: "Sesión cerrada correctamente",
      pleaseLogin: "Por favor inicia sesión primero",
    }
  },
  fr: {
    translation: {
      home: "Accueil",
      products: "Produits",
      about: "À propos",
      contact: "Contact",
      cart: "Panier",
      wishlist: "Liste de souhaits",
      profile: "Profil",
      orders: "Commandes",
      settings: "Paramètres",
      logout: "Déconnexion",
      login: "Connexion",
      register: "S'inscrire",
      
      search: "Rechercher des produits...",
      addToCart: "Ajouter au panier",
      addToWishlist: "Ajouter aux favoris",
      buyNow: "Acheter maintenant",
      viewDetails: "Voir les détails",
      loading: "Chargement...",
      error: "Erreur",
      success: "Succès",
      
      emptyCart: "Votre panier est vide",
      cartTotal: "Total du panier",
      checkout: "Commander",
      continueShopping: "Continuer les achats",
      
      addedToCart: "Ajouté au panier",
      addedToWishlist: "Ajouté aux favoris",
      removedFromCart: "Retiré du panier",
      removedFromWishlist: "Retiré des favoris",
      loggedOut: "Déconnexion réussie",
      pleaseLogin: "Veuillez vous connecter d'abord",
    }
  },
  de: {
    translation: {
      home: "Startseite",
      products: "Produkte",
      about: "Über uns",
      contact: "Kontakt",
      cart: "Warenkorb",
      wishlist: "Wunschliste",
      profile: "Profil",
      orders: "Bestellungen",
      settings: "Einstellungen",
      logout: "Abmelden",
      login: "Anmelden",
      register: "Registrieren",
      
      search: "Produkte suchen...",
      addToCart: "In den Warenkorb",
      addToWishlist: "Zur Wunschliste",
      buyNow: "Jetzt kaufen",
      viewDetails: "Details anzeigen",
      loading: "Laden...",
      error: "Fehler",
      success: "Erfolg",
      
      emptyCart: "Ihr Warenkorb ist leer",
      cartTotal: "Warenkorbsumme",
      checkout: "Zur Kasse",
      continueShopping: "Weiter einkaufen",
      
      addedToCart: "Zum Warenkorb hinzugefügt",
      addedToWishlist: "Zur Wunschliste hinzugefügt",
      removedFromCart: "Aus dem Warenkorb entfernt",
      removedFromWishlist: "Von der Wunschliste entfernt",
      loggedOut: "Erfolgreich abgemeldet",
      pleaseLogin: "Bitte melden Sie sich zuerst an",
    }
  },
  hi: {
    translation: {
      home: "होम",
      products: "उत्पाद",
      about: "हमारे बारे में",
      contact: "संपर्क",
      cart: "कार्ट",
      wishlist: "विशलिस्ट",
      profile: "प्रोफ़ाइल",
      orders: "ऑर्डर",
      settings: "सेटिंग्स",
      logout: "लॉगआउट",
      login: "लॉगिन",
      register: "रजिस्टर",
      
      search: "उत्पाद खोजें...",
      addToCart: "कार्ट में जोड़ें",
      addToWishlist: "विशलिस्ट में जोड़ें",
      buyNow: "अभी खरीदें",
      viewDetails: "विवरण देखें",
      loading: "लोड हो रहा है...",
      error: "त्रुटि",
      success: "सफलता",
      
      emptyCart: "आपका कार्ट खाली है",
      cartTotal: "कार्ट कुल",
      checkout: "चेकआउट",
      continueShopping: "खरीदारी जारी रखें",
      
      addedToCart: "कार्ट में जोड़ा गया",
      addedToWishlist: "विशलिस्ट में जोड़ा गया",
      removedFromCart: "कार्ट से हटाया गया",
      removedFromWishlist: "विशलिस्ट से हटाया गया",
      loggedOut: "सफलतापूर्वक लॉगआउट",
      pleaseLogin: "कृपया पहले लॉगिन करें",
    }
  },
  ne: {
    translation: {
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
      
      search: "उत्पादनहरू खोज्नुहोस्...",
      addToCart: "कार्टमा थप्नुहोस्",
      addToWishlist: "इच्छा सूचीमा थप्नुहोस्",
      buyNow: "अहिले किन्नुहोस्",
      viewDetails: "विवरण हेर्नुहोस्",
      loading: "लोड हुँदैछ...",
      error: "त्रुटि",
      success: "सफलता",
      
      emptyCart: "तपाईंको कार्ट खाली छ",
      cartTotal: "कार्ट कुल",
      checkout: "चेकआउट",
      continueShopping: "किनमेल जारी राख्नुहोस्",
      
      addedToCart: "कार्टमा थपियो",
      addedToWishlist: "इच्छा सूचीमा थपियो",
      removedFromCart: "कार्टबाट हटाइयो",
      removedFromWishlist: "इच्छा सूचीबाट हटाइयो",
      loggedOut: "सफलतापूर्वक लगआउट भयो",
      pleaseLogin: "कृपया पहिले लगइन गर्नुहोस्",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
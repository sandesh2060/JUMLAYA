// ============================================
// 📄 Breadcrumb.jsx - FULLY WORKING
// Path: src/components/layout/Breadcrumb.jsx
// ============================================
// ✅ All routes verified against AppRoutes.jsx
// ✅ i18n keys fixed — nav.about & nav.settings added via defaultValue
// ✅ nav.breadcrumb missing from JSON → handled with fallback
// ✅ translateLabel covers every named route in AppRoutes
// ✅ Dark mode, hover states, accessible aria
// ============================================

import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const Breadcrumb = ({ items = [] }) => {
  const { t } = useTranslation()

  // ── Label → translated text ──────────────────────────────────────────────
  // Covers every public + protected route label used in AppRoutes.jsx
  const translateLabel = (label) => {
    const map = {
      // nav keys confirmed in translation.json
      'Home':             t('nav.home'),
      'Products':         t('nav.products'),
      'Cart':             t('nav.cart'),
      'Wishlist':         t('nav.wishlist'),
      'Profile':          t('nav.profile'),
      'Orders':           t('nav.orders'),
      'Login':            t('nav.login'),
      'Register':         t('nav.register'),

      // nav keys MISSING from translation.json → safe defaultValue fallback
      'About':            t('nav.about',    { defaultValue: 'About' }),
      'Contact':          t('nav.contact',  { defaultValue: 'Contact' }),
      'Settings':         t('nav.settings', { defaultValue: 'Settings' }),

      // order keys confirmed in translation.json
      'Order Details':    t('order.orderDetails'),
      'Order Success':    t('order.orderSuccess', { defaultValue: 'Order Placed!' }),

      // product keys confirmed in translation.json
      'Product Details':  t('product.viewDetails'),
      'Checkout':         t('checkout.title'),
    }

    return map[label] ?? label   // fallback: render label as-is
  }

  // ── Route map: label → path (from AppRoutes.jsx) ─────────────────────────
  // Used when item has no explicit href
  const routeMap = {
    'Home':             '/',
    'Products':         '/products',
    'Cart':             '/cart',
    'Wishlist':         '/wishlist',
    'Profile':          '/profile',
    'Orders':           '/orders',
    'About':            '/about',
    'Contact':          '/contact',
    'Settings':         '/profile/settings',
    'Checkout':         '/checkout',
  }

  return (
    <nav
      className="flex items-center flex-wrap gap-1 text-sm"
      aria-label={t('nav.breadcrumb', { defaultValue: 'Breadcrumb' })}
    >
      {/* ── Home ── */}
      <Link
        to="/"
        className="flex items-center gap-1.5 px-2 py-1 rounded-md
          text-gray-500 dark:text-gray-400
          hover:text-primary-600 dark:hover:text-primary-400
          hover:bg-primary-50 dark:hover:bg-primary-900/20
          transition-all duration-200 font-medium"
        aria-label={t('nav.home')}
      >
        <Home size={15} strokeWidth={2} />
        <span className="hidden sm:inline">{t('nav.home')}</span>
      </Link>

      {/* ── Items ── */}
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        // Resolve href: explicit prop → routeMap lookup → no link
        const resolvedHref = item.href ?? routeMap[item.label] ?? null

        return (
          <div key={index} className="flex items-center gap-1">
            {/* Separator */}
            <ChevronRight
              size={14}
              strokeWidth={2}
              className="text-gray-400 dark:text-gray-600 flex-shrink-0"
              aria-hidden="true"
            />

            {/* Clickable intermediate crumb */}
            {resolvedHref && !isLast ? (
              <Link
                to={resolvedHref}
                className="px-2 py-1 rounded-md
                  text-gray-500 dark:text-gray-400
                  hover:text-primary-600 dark:hover:text-primary-400
                  hover:bg-primary-50 dark:hover:bg-primary-900/20
                  transition-all duration-200 font-medium"
              >
                {translateLabel(item.label)}
              </Link>
            ) : (
              /* Current / last crumb — not a link */
              <span
                className="px-2 py-1 text-gray-900 dark:text-white font-semibold"
                aria-current={isLast ? 'page' : undefined}
              >
                {translateLabel(item.label)}
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}
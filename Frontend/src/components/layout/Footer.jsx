// Frontend/src/components/layout/Footer.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Youtube, Linkedin } from 'lucide-react'
import publicSettingsAPI from '@/api/publicSettings.api'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const [loading, setLoading] = useState(true)
  
  // Dynamic footer data from backend
  const [footerData, setFooterData] = useState({
    storeName: 'JUMLAYA',
    aboutText: 'Your trusted online shopping destination for quality products at great prices.',
    storeEmail: 'support@jumlaya.com',
    storePhone: '+977 123-456-7890',
    storeAddress: 'Patan, Bagmati Province, Nepal',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
      linkedin: ''
    }
  })

  useEffect(() => {
    fetchFooterData()
  }, [])

  const fetchFooterData = async () => {
    try {
      setLoading(true)
      
      // Fetch contact info and social links in parallel
      const [contactResponse, socialResponse, aboutResponse] = await Promise.all([
        publicSettingsAPI.getContactInfo(),
        publicSettingsAPI.getSocialLinks(),
        publicSettingsAPI.getAboutUs().catch(() => null) // Optional, don't fail if not available
      ])
      
      // Merge the data
      const data = {
        storeName: contactResponse.data?.storeName || aboutResponse?.data?.storeName || 'JUMLAYA',
        aboutText: aboutResponse?.data?.aboutUs?.split('\n')[0] || 'Your trusted online shopping destination for quality products at great prices.',
        storeEmail: contactResponse.data?.storeEmail || 'support@jumlaya.com',
        storePhone: contactResponse.data?.storePhone || '+977 123-456-7890',
        storeAddress: contactResponse.data?.storeAddress || 'Patan, Bagmati Province, Nepal',
        socialMedia: socialResponse.data || {}
      }
      
      setFooterData(data)
    } catch (error) {
      console.error('Error fetching footer data:', error)
      // Continue with default values
    } finally {
      setLoading(false)
    }
  }

  // Social media icons mapping
  const socialIcons = {
    facebook: { icon: Facebook, label: 'Facebook' },
    instagram: { icon: Instagram, label: 'Instagram' },
    twitter: { icon: Twitter, label: 'Twitter' },
    youtube: { icon: Youtube, label: 'YouTube' },
    linkedin: { icon: Linkedin, label: 'LinkedIn' }
  }

  // Filter out empty social links
  const activeSocialLinks = Object.entries(footerData.socialMedia)
    .filter(([key, value]) => value && value.trim() !== '')
    .map(([key, value]) => ({
      name: key,
      url: value,
      icon: socialIcons[key]?.icon || Facebook,
      label: socialIcons[key]?.label || key
    }))

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              {loading ? (
                <div className="h-6 bg-gray-700 rounded w-32 animate-pulse"></div>
              ) : (
                footerData.storeName
              )}
            </h3>
            
            {loading ? (
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-700 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse"></div>
              </div>
            ) : (
              <p className="text-sm mb-4 leading-relaxed">
                {footerData.aboutText}
              </p>
            )}
            
            {/* Social Media Links */}
            <div className="flex space-x-4">
              {loading ? (
                <>
                  <div className="h-5 w-5 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-5 w-5 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-5 w-5 bg-gray-700 rounded animate-pulse"></div>
                </>
              ) : activeSocialLinks.length > 0 ? (
                activeSocialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors hover:scale-110 transform duration-200"
                      aria-label={social.label}
                    >
                      <Icon size={20} />
                    </a>
                  )
                })
              ) : (
                // Fallback to placeholder links if no social media configured
                <>
                  <a href="" className="hover:text-white transition-colors" aria-label="Facebook">
                    <Facebook size={20} />
                  </a>
                  <a href="#" className="hover:text-white transition-colors" aria-label="Instagram">
                    <Instagram size={20} />
                  </a>
                  <a href="#" className="hover:text-white transition-colors" aria-label="Twitter">
                    <Twitter size={20} />
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/about" 
                  className="text-sm hover:text-white transition-colors hover:translate-x-1 inline-block transform duration-200"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/products" 
                  className="text-sm hover:text-white transition-colors hover:translate-x-1 inline-block transform duration-200"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-sm hover:text-white transition-colors hover:translate-x-1 inline-block transform duration-200"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  to="/orders" 
                  className="text-sm hover:text-white transition-colors hover:translate-x-1 inline-block transform duration-200"
                >
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/help" 
                  className="text-sm hover:text-white transition-colors hover:translate-x-1 inline-block transform duration-200"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link 
                  to="/returns" 
                  className="text-sm hover:text-white transition-colors hover:translate-x-1 inline-block transform duration-200"
                >
                  Returns
                </Link>
              </li>
              <li>
                <Link 
                  to="/shipping" 
                  className="text-sm hover:text-white transition-colors hover:translate-x-1 inline-block transform duration-200"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  className="text-sm hover:text-white transition-colors hover:translate-x-1 inline-block transform duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="text-sm hover:text-white transition-colors hover:translate-x-1 inline-block transform duration-200"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Contact Us</h3>
            {loading ? (
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <div className="h-4 w-4 bg-gray-700 rounded mt-1 animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-700 rounded w-2/3 animate-pulse"></div>
                  </div>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="h-4 w-4 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-700 rounded w-40 animate-pulse"></div>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="h-4 w-4 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-700 rounded w-48 animate-pulse"></div>
                </li>
              </ul>
            ) : (
              <ul className="space-y-3">
                <li className="flex items-start space-x-3 group">
                  <MapPin size={18} className="mt-1 flex-shrink-0 group-hover:text-white transition-colors" />
                  <span className="text-sm">{footerData.storeAddress}</span>
                </li>
                <li className="flex items-center space-x-3 group">
                  <Phone size={18} className="flex-shrink-0 group-hover:text-white transition-colors" />
                  <a 
                    href={`tel:${footerData.storePhone.replace(/\s/g, '')}`}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {footerData.storePhone}
                  </a>
                </li>
                <li className="flex items-center space-x-3 group">
                  <Mail size={18} className="flex-shrink-0 group-hover:text-white transition-colors" />
                  <a 
                    href={`mailto:${footerData.storeEmail}`}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {footerData.storeEmail}
                  </a>
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-center md:text-left">
              © {currentYear} {footerData.storeName}. All rights reserved.
            </p>
            
            {/* Payment Methods (Optional) */}
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              <span>We accept:</span>
              <div className="flex space-x-2">
                <span className="px-2 py-1 bg-gray-800 rounded text-xs">eSewa</span>
                <span className="px-2 py-1 bg-gray-800 rounded text-xs">Khalti</span>
                <span className="px-2 py-1 bg-gray-800 rounded text-xs">COD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
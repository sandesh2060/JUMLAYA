// ============================================
// About.jsx - WITH i18n TRANSLATION SUPPORT
// Path: Frontend/src/pages/About.jsx
// ============================================
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // ✅ ADD THIS
import { Leaf, Users, Award, TrendingUp, Heart, Shield, Truck, MessageCircle, FileText, Lock, Package } from 'lucide-react';
import api from '@/api/axios.config';
import publicSettingsAPI from '@/api/publicSettings.api';
import toast from 'react-hot-toast';

const About = () => {
  const { t } = useTranslation(); // ✅ ADD THIS
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activePolicy, setActivePolicy] = useState(null); // For modal
  
  const [stats, setStats] = useState({
    customers: 0,
    products: 0,
    awards: 25,
    growth: 0
  });
  
  // ✅ Dynamic settings data from backend
  const [settings, setSettings] = useState({
    storeName: 'JUMLAYA',
    aboutUs: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
      tiktok: ''
    }
  });

  // ✅ Policies from backend
  const [policies, setPolicies] = useState({
    returnPolicy: '',
    privacyPolicy: '',
    shippingPolicy: '',
    termsAndConditions: ''
  });

  useEffect(() => {
    setIsVisible(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // ✅ Fetch all data in parallel
      const [
        settingsResponse, 
        productsResponse,
        returnPolicyResponse,
        privacyPolicyResponse,
        shippingPolicyResponse
      ] = await Promise.all([
        publicSettingsAPI.getAboutUs(),
        api.get('/products', { params: { page: 1, limit: 1 } }),
        publicSettingsAPI.getReturnPolicy().catch(() => ({ data: { content: '' } })),
        publicSettingsAPI.getPrivacyPolicy().catch(() => ({ data: { content: '' } })),
        publicSettingsAPI.getShippingPolicy().catch(() => ({ data: { content: '' } }))
      ]);
      
      // Set settings
      if (settingsResponse.success) {
        setSettings({
          storeName: settingsResponse.data.storeName || 'JUMLAYA',
          aboutUs: settingsResponse.data.aboutUs || '',
          socialMedia: settingsResponse.data.socialMedia || {}
        });
      }
      
      // ✅ Set policies
      setPolicies({
        returnPolicy: returnPolicyResponse.data?.content || '',
        privacyPolicy: privacyPolicyResponse.data?.content || '',
        shippingPolicy: shippingPolicyResponse.data?.content || ''
      });
      
      // Calculate stats
      const totalProducts = productsResponse.data.total || 1000;
      const estimatedCustomers = Math.max(totalProducts * 50, 5000);
      const growthRate = 150;
      
      setStats({
        customers: estimatedCustomers,
        products: totalProducts,
        awards: 25,
        growth: growthRate
      });
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(t('about.errorLoading'));
      
      // Set fallback values
      setStats({
        customers: 50000,
        products: 1000,
        awards: 25,
        growth: 150
      });
    } finally {
      setLoading(false);
    }
  };

  const statsDisplay = [
    { icon: Users, label: t('about.stats.customers'), value: loading ? '...' : `${stats.customers > 1000 ? Math.floor(stats.customers / 1000) + 'K+' : stats.customers + '+'}` },
    { icon: Leaf, label: t('about.stats.products'), value: loading ? '...' : `${stats.products}+` },
    { icon: Award, label: t('about.stats.awards'), value: `${stats.awards}+` },
    { icon: TrendingUp, label: t('about.stats.growth'), value: loading ? '...' : `${stats.growth}%` }
  ];

  const values = [
    {
      icon: Heart,
      title: t('about.values.quality.title'),
      description: t('about.values.quality.description')
    },
    {
      icon: Shield,
      title: t('about.values.trust.title'),
      description: t('about.values.trust.description')
    },
    {
      icon: Truck,
      title: t('about.values.delivery.title'),
      description: t('about.values.delivery.description')
    },
    {
      icon: MessageCircle,
      title: t('about.values.support.title'),
      description: t('about.values.support.description')
    }
  ];

  // ✅ Policy cards with translations
  const policyCards = [
    {
      icon: Package,
      title: t('about.policies.return.title'),
      description: t('about.policies.return.description'),
      content: policies.returnPolicy,
      color: 'blue',
      key: 'return'
    },
    {
      icon: Lock,
      title: t('about.policies.privacy.title'),
      description: t('about.policies.privacy.description'),
      content: policies.privacyPolicy,
      color: 'green',
      key: 'privacy'
    },
    {
      icon: Truck,
      title: t('about.policies.shipping.title'),
      description: t('about.policies.shipping.description'),
      content: policies.shippingPolicy,
      color: 'purple',
      key: 'shipping'
    }
  ];

  const team = [
    { name: 'Bipesh Giri', role: t('about.team.founder'), image: '/assets/bipeshgiri.jpg' },
    { name: 'Manoj Bhandari', role: t('about.team.cofounder'), image: '/assets/manojbhandari.jpg' },
    { name: 'Sandesh Sharma', role: t('about.team.director'), image: '/assets/sandeshsharma.jpg' }
  ];

  // ✅ Policy modal with translations
  const PolicyModal = ({ policy, onClose }) => {
    if (!policy) return null;

    const colorClasses = {
      blue: 'from-blue-600 to-blue-700',
      green: 'from-green-600 to-green-700',
      purple: 'from-purple-600 to-purple-700'
    };

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slideUp">
          {/* Header */}
          <div className={`bg-gradient-to-r ${colorClasses[policy.color]} text-white p-6`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <policy.icon size={32} />
                <h2 className="text-2xl font-bold">{policy.title}</h2>
              </div>
              <button
                onClick={onClose}
                className="hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {policy.content ? (
              <div className="prose dark:prose-invert max-w-none">
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                  {policy.content}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {t('about.policies.notAvailable')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Hero Section */}
      <div className={`bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 text-white py-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">
            {t('about.hero.title', { storeName: settings.storeName })}
          </h1>
          <p className="text-xl max-w-3xl mx-auto text-green-50">
            {t('about.hero.subtitle')}
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className={`container mx-auto px-4 -mt-12 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {statsDisplay.map((stat, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center transform hover:scale-105 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <stat.icon className="w-12 h-12 mx-auto mb-4 text-green-600 dark:text-green-400" />
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Our Story Section */}
      <div className="container mx-auto px-4 py-20">
        <div className={`grid md:grid-cols-2 gap-12 items-center transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {t('about.story.title')}
            </h2>
            
            {settings.aboutUs ? (
              <div className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                {settings.aboutUs}
              </div>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  {t('about.story.defaultText', { storeName: settings.storeName })}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  {t('about.story.paragraph2')}
                </p>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t('about.story.paragraph3', { products: stats.products })}
                </p>
              </>
            )}
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop" 
              alt="Organic farming"
              className="rounded-lg shadow-xl w-full transform hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute -bottom-6 -right-6 bg-green-600 dark:bg-green-700 text-white p-6 rounded-lg shadow-xl">
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm">{t('about.story.certified')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-white dark:bg-gray-800 py-20 transition-colors">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4">
            {t('about.values.title')}
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            {t('about.values.subtitle', { storeName: settings.storeName })}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <value.icon className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Policies Section */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4">
          {t('about.policies.title')}
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          {t('about.policies.subtitle')}
        </p>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {policyCards.map((policy, index) => (
            <div 
              key={index}
              onClick={() => setActivePolicy(policy)}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
            >
              <div className={`bg-gradient-to-r ${policy.color === 'blue' ? 'from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30' : policy.color === 'green' ? 'from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30' : 'from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30'} w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <policy.icon className={`w-8 h-8 ${policy.color === 'blue' ? 'text-blue-600 dark:text-blue-400' : policy.color === 'green' ? 'text-green-600 dark:text-green-400' : 'text-purple-600 dark:text-purple-400'}`} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                {policy.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{policy.description}</p>
              <div className="flex items-center text-green-600 dark:text-green-400 font-semibold group-hover:translate-x-2 transition-transform">
                {t('about.policies.readMore')} →
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white dark:bg-gray-800 py-20 transition-colors">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4">
            {t('about.team.title')}
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            {t('about.team.subtitle', { storeName: settings.storeName })}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <div 
                key={index}
                className="group text-center transform hover:scale-105 transition-all duration-300"
              >
                <div className="relative overflow-hidden rounded-lg mb-4">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=256&background=059669&color=fff`;
                    }}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{member.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('about.cta.title')}</h2>
          <p className="text-xl text-green-50 mb-8 max-w-2xl mx-auto">
            {t('about.cta.subtitle')}
          </p>
          <button 
            onClick={() => window.location.href = '/products'}
            className="bg-white text-green-600 dark:bg-gray-800 dark:text-green-400 px-8 py-4 rounded-lg font-semibold hover:bg-green-50 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            {t('about.cta.button')}
          </button>
        </div>
      </div>

      {/* Policy Modal */}
      {activePolicy && (
        <PolicyModal 
          policy={activePolicy} 
          onClose={() => setActivePolicy(null)} 
        />
      )}

      {/* Required styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default About;
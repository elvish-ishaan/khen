'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import {
  Bike,
  Clock,
  MapPin,
  CheckCircle2,
  Smartphone,
  FileText,
  Package,
  Store,
  MapPinned,
  TruckIcon,
  Users,
  ChevronDown,
  Facebook,
  Instagram,
  MessageCircle,
  Menu,
  X,
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();
  const { personnel } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [language, setLanguage] = useState('English');

  // AuthInitializer handles redirects based on onboarding status
  // No redirect logic needed here

  const faqs = [
    {
      question: 'How do I join Daavat as a delivery partner?',
      answer:
        'Simply click "Get Started", complete phone verification, fill in your profile details, upload required documents (Aadhar, PAN, DL), and submit for review. Once approved, collect your delivery kit and start earning!',
    },
    {
      question: 'What documents do I need?',
      answer:
        'You need a valid Aadhar card, PAN card, driving license, vehicle registration, and bank account details for receiving payments.',
    },
    {
      question: 'Is there any joining fee?',
      answer:
        'There is a one-time onboarding fee of ₹1,500 (varies by city) which will be deducted from your initial earnings. This covers your branded delivery kit.',
    },
    {
      question: "What if I don't have a vehicle?",
      answer:
        'No problem! Daavat supports cycle and e-bike rentals in select cities. Contact our support team to learn about vehicle rental options in your area.',
    },
    {
      question: 'How and when will I get paid?',
      answer:
        'Daavat transfers earnings weekly directly to your registered bank account. You can track your earnings in real-time through the delivery partner app.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Bike className="w-8 h-8 text-primary" strokeWidth={2.5} />
              <span className="text-2xl font-bold text-gray-900">Daavat</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#faqs"
                className="text-gray-700 hover:text-primary transition-colors font-medium"
              >
                FAQs
              </a>
              <a
                href="#footer"
                className="text-gray-700 hover:text-primary transition-colors font-medium"
              >
                Support
              </a>
              <div className="relative group">
                <button className="flex items-center space-x-1 text-gray-700 hover:text-primary transition-colors font-medium">
                  <span>{language}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <button
                    onClick={() => setLanguage('English')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-50 rounded-t-lg"
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage('हिंदी')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-50 rounded-b-lg"
                  >
                    हिंदी
                  </button>
                </div>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-4">
                <a
                  href="#faqs"
                  className="text-gray-700 hover:text-primary transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  FAQs
                </a>
                <a
                  href="#footer"
                  className="text-gray-700 hover:text-primary transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Support
                </a>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setLanguage('English')}
                    className={`px-3 py-1 rounded ${
                      language === 'English'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage('हिंदी')}
                    className={`px-3 py-1 rounded ${
                      language === 'हिंदी'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    हिंदी
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-100/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Become a Daavat
              <br />
              <span className="text-primary">Delivery Partner Today</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 font-medium">
              Earn Up to ₹30,000/month | Work when you want
            </p>
            <Link
              href="/login"
              className="inline-flex items-center px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
            >
              Get Started
              <CheckCircle2 className="ml-2 w-5 h-5" />
            </Link>

            {/* Trust Badges */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg">No fixed hours</h3>
                <p className="text-gray-600 text-sm mt-2">Work on your schedule</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg">Work in your area</h3>
                <p className="text-gray-600 text-sm mt-2">Deliver locally</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg">
                  Onboard within 24 hrs
                </h3>
                <p className="text-gray-600 text-sm mt-2">Quick approval process</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Onboarding Steps */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
            Join in <span className="text-primary">3 Easy Steps</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-blue-100">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                1
              </div>
              <Smartphone className="w-16 h-16 text-primary mb-4 mt-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Access from any device</h3>
              <p className="text-gray-600">
                No app download needed! Access the Daavat delivery platform from any device,
                anywhere.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-blue-100">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                2
              </div>
              <FileText className="w-16 h-16 text-primary mb-4 mt-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Fill in profile & documents
              </h3>
              <p className="text-gray-600">
                Upload your Aadhar, PAN, and driving license. Simple verification process.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-blue-100">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                3
              </div>
              <Package className="w-16 h-16 text-primary mb-4 mt-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Collect your kit</h3>
              <p className="text-gray-600">
                Get your Daavat branded bag and t-shirt. Start delivering and earning!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Stats */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-primary/5 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
              <Store className="w-12 h-12 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900">3 Lakh+</div>
              <div className="text-gray-600 mt-2">Restaurant Partners</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
              <MapPinned className="w-12 h-12 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900">500+</div>
              <div className="text-gray-600 mt-2">Cities</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
              <TruckIcon className="w-12 h-12 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900">10 Cr+</div>
              <div className="text-gray-600 mt-2">Happy Deliveries</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
              <Users className="w-12 h-12 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900">2 Lakh+</div>
              <div className="text-gray-600 mt-2">Delivery Partners</div>
            </div>
          </div>

          {/* Testimonials */}
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
            What Our Partners Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg border-t-4 border-primary">
              <div className="flex items-center mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  AA
                </div>
                <div className="ml-4">
                  <div className="font-bold text-gray-900 text-lg">Amir Ali</div>
                  <div className="text-gray-600 text-sm">Mumbai, Maharashtra</div>
                </div>
              </div>
              <p className="text-gray-700 italic leading-relaxed">
                "Daavat has been an assured source of income for my family. The flexible hours
                let me balance work with personal time, and the earnings are consistent."
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border-t-4 border-primary">
              <div className="flex items-center mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  DA
                </div>
                <div className="ml-4">
                  <div className="font-bold text-gray-900 text-lg">Danish Ahmad</div>
                  <div className="text-gray-600 text-sm">Delhi NCR</div>
                </div>
              </div>
              <p className="text-gray-700 italic leading-relaxed">
                "The documentation process was simple and I joined instantly. Within a week, I
                was delivering orders and earning well. Great support from the team!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faqs" className="py-16 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex justify-between items-center p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-lg pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-200 ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Company */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-primary">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Team
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Daavat Blog
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-primary">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#faqs" className="text-gray-400 hover:text-white transition-colors">
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-primary">Connect With Us</h3>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <Bike className="w-6 h-6 text-primary mr-2" />
              <span className="text-xl font-bold">Daavat</span>
            </div>
            <p className="text-gray-400">© 2026 Daavat Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

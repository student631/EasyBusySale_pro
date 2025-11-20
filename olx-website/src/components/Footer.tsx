import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="easysale-footer">
      <div className="container mx-auto px-3 py-6 sm:px-4 sm:py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Brand Section - Compact */}
          <div className="space-y-3 lg:col-span-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#008299] rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#008299]">EasyBuySale</h3>
                <p className="text-xs text-gray-600">Smart Marketplace</p>
              </div>
            </div>
            <p className="text-gray-600 max-w-md leading-snug text-xs">
              Buy & Sell Anything, Anytime, Anywhere. Your trusted marketplace for buying and selling.
              Connect with millions of users to find great deals or sell your items quickly and safely.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="text-gray-400 hover:text-[#008299] transition-colors">
                <Facebook className="h-4 w-4" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-[#008299] transition-colors">
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-[#008299] transition-colors">
                <Instagram className="h-4 w-4" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>

          {/* Quick Links - Compact */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-800 border-b border-[#008299] pb-1">Quick Links</h4>
            <ul className="space-y-1.5 text-xs text-gray-600">
              <li>
                <Link href="/" className="hover:text-[#008299] transition-colors block">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-[#008299] transition-colors block">
                  Search
                </Link>
              </li>
              <li>
                <Link href="/post-ad" className="hover:text-[#008299] transition-colors block">
                  Post Ad
                </Link>
              </li>
              <li>
                <Link href="/my-ads" className="hover:text-[#008299] transition-colors block">
                  My Ads
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#008299] transition-colors block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#008299] transition-colors block">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Contact - Compact */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-800 border-b border-[#008299] pb-1">Support</h4>
            <ul className="space-y-1.5 text-xs text-gray-600">
              <li className="flex items-center space-x-2">
                <Mail className="h-3 w-3 text-[#008299]" />
                <a href="mailto:support@easybuysale.com" className="hover:text-[#008299] transition-colors">
                  support@easybuysale.com
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-3 w-3 text-[#008299]" />
                <a href="tel:+911234567890" className="hover:text-[#008299] transition-colors">
                  +91 1234 567 890
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-3 w-3 text-[#008299]" />
                <span>Mumbai, India</span>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#008299] transition-colors block">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#008299] transition-colors block">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section - Compact */}
        <div className="mt-6 pt-4 border-t border-gray-300">
          <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
            <p className="text-xs text-gray-600">
              © 2024 EasyBuySale. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
              <Link href="/privacy" className="hover:text-[#008299] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-[#008299] transition-colors">
                Terms of Service
              </Link>
              <Link href="/about" className="hover:text-[#008299] transition-colors">
                About Us
              </Link>
              <Link href="/contact" className="hover:text-[#008299] transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
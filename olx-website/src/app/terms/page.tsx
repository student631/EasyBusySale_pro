import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo';
import Link from 'next/link';
import { FileText, AlertCircle, CheckCircle, XCircle, Scale } from 'lucide-react';

export const metadata: Metadata = generateMetadata({
  title: 'Terms of Service',
  description: 'EasyBuySale Terms of Service - Read our terms and conditions for using our marketplace platform. Learn about user responsibilities, prohibited activities, and platform guidelines.',
  keywords: ['terms of service', 'terms and conditions', 'user agreement', 'platform rules', 'EasyBuySale terms'],
  url: '/terms',
});

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <Scale className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using EasyBuySale, you accept and agree to be bound by the terms and provisions
              of this agreement. If you do not agree to these Terms of Service, please do not use our platform.
            </p>
          </section>

          {/* User Account */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. User Accounts</h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                To use certain features of our platform, you must register for an account. When you register:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining the security of your account</li>
                <li>You must be at least 13 years old to create an account</li>
                <li>You are responsible for all activities that occur under your account</li>
                <li>You must notify us immediately of any unauthorized use</li>
              </ul>
            </div>
          </section>

          {/* Acceptable Use */}
          <section>
            <div className="flex items-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">3. Acceptable Use</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree to use EasyBuySale only for lawful purposes and in accordance with these Terms. You agree NOT to:
            </p>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <ul className="list-disc list-inside text-red-800 space-y-2">
                <li>Post false, inaccurate, misleading, or fraudulent content</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon intellectual property rights</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Spam or engage in unauthorized advertising</li>
                <li>Interfere with or disrupt the platform's functionality</li>
                <li>Attempt to gain unauthorized access to our systems</li>
              </ul>
            </div>
          </section>

          {/* Prohibited Items */}
          <section>
            <div className="flex items-center mb-4">
              <XCircle className="h-6 w-6 text-red-500 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">4. Prohibited Items</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              The following items are strictly prohibited from being listed on EasyBuySale:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Illegal drugs and substances</li>
                <li>Weapons and ammunition</li>
                <li>Counterfeit or pirated goods</li>
                <li>Stolen items</li>
                <li>Adult content and services</li>
              </ul>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Human body parts</li>
                <li>Live animals (restrictions apply)</li>
                <li>Hazardous materials</li>
                <li>Lottery tickets and gambling</li>
                <li>Prescription drugs</li>
              </ul>
            </div>
          </section>

          {/* Listings and Transactions */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Listings and Transactions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Seller Responsibilities</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Provide accurate descriptions and images of items</li>
                  <li>Honor the advertised price and terms</li>
                  <li>Respond promptly to buyer inquiries</li>
                  <li>Complete transactions in good faith</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Buyer Responsibilities</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Read item descriptions carefully before purchasing</li>
                  <li>Communicate respectfully with sellers</li>
                  <li>Complete agreed-upon transactions</li>
                  <li>Report any issues or disputes promptly</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Content Ownership */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Content and Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You retain ownership of content you post on EasyBuySale. However, by posting content, you grant
              us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display your
              content for the purpose of operating and promoting our platform.
            </p>
            <p className="text-gray-700 leading-relaxed">
              All EasyBuySale trademarks, logos, and service marks are the property of EasyBuySale. You may
              not use our trademarks without our prior written permission.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-yellow-500 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">7. Limitation of Liability</h2>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Important:</strong> EasyBuySale is a platform that connects buyers and sellers. We are
                not a party to any transactions between users.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>We do not guarantee the quality, safety, or legality of items listed</li>
                <li>We are not responsible for the actions or content of users</li>
                <li>We do not guarantee that transactions will be completed</li>
                <li>We are not liable for any damages arising from platform use</li>
              </ul>
            </div>
          </section>

          {/* Dispute Resolution */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Dispute Resolution</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have a dispute with another user, we encourage you to contact them directly to resolve
              the issue. If you cannot resolve a dispute, you may contact our support team for assistance.
              However, we are not obligated to mediate disputes between users.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Account Termination</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We reserve the right to suspend or terminate your account at any time for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Violation of these Terms of Service</li>
              <li>Fraudulent or illegal activity</li>
              <li>Multiple user complaints</li>
              <li>Prolonged inactivity</li>
              <li>Any other reason at our sole discretion</li>
            </ul>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of any material
              changes by posting a notice on our platform or sending an email. Your continued use of EasyBuySale
              after changes indicates your acceptance of the new terms.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction
              in which EasyBuySale operates, without regard to its conflict of law provisions.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <ul className="text-gray-700 space-y-2">
              <li>Email: <a href="mailto:support@easybuysale.com" className="text-blue-600 hover:underline">support@easybuysale.com</a></li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: 123 Market Street, City, State 12345</li>
            </ul>
          </section>

          {/* Acceptance */}
          <section className="border-t pt-6">
            <p className="text-gray-700 leading-relaxed italic">
              By using EasyBuySale, you acknowledge that you have read, understood, and agree to be bound
              by these Terms of Service and our Privacy Policy.
            </p>
          </section>
        </div>

        {/* Navigation Links */}
        <div className="flex justify-between mt-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Home
          </Link>
          <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
            Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  );
}

import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo';
import Link from 'next/link';
import { Shield, Lock, Eye, UserCheck, FileText } from 'lucide-react';

export const metadata: Metadata = generateMetadata({
  title: 'Privacy Policy',
  description: 'EasyBuySale Privacy Policy - Learn how we collect, use, and protect your personal information. Your privacy and data security are our top priorities.',
  keywords: ['privacy policy', 'data protection', 'user privacy', 'personal information', 'EasyBuySale privacy'],
  url: '/privacy',
});

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to EasyBuySale. We respect your privacy and are committed to protecting your personal data.
              This privacy policy will inform you about how we look after your personal data when you visit our
              platform and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <div className="flex items-center mb-4">
              <FileText className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Personal Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Name and contact information (email, phone number)</li>
                  <li>Account credentials (username, password)</li>
                  <li>Location information</li>
                  <li>Profile information you provide</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Usage Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Browsing history on our platform</li>
                  <li>Search queries and preferences</li>
                  <li>Device and browser information</li>
                  <li>IP address and location data</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <div className="flex items-center mb-4">
              <Eye className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
            </div>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>To provide and maintain our services</li>
              <li>To manage your account and profile</li>
              <li>To process your transactions and listings</li>
              <li>To communicate with you about your account or transactions</li>
              <li>To improve our platform and user experience</li>
              <li>To detect and prevent fraud and abuse</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <div className="flex items-center mb-4">
              <Lock className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              We have implemented appropriate security measures to prevent your personal data from being
              accidentally lost, used, or accessed in an unauthorized way. We limit access to your personal
              data to those employees, agents, contractors, and other third parties who have a business need to know.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <p className="text-blue-800">
                <strong>Security Measures:</strong> We use SSL encryption, secure password hashing,
                regular security audits, and follow industry best practices to protect your data.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <div className="flex items-center mb-4">
              <UserCheck className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Your Rights</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Under data protection laws, you have rights including:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Right to access</strong> - You can request copies of your personal data</li>
              <li><strong>Right to rectification</strong> - You can request correction of inaccurate data</li>
              <li><strong>Right to erasure</strong> - You can request deletion of your personal data</li>
              <li><strong>Right to restrict processing</strong> - You can request limitation on data use</li>
              <li><strong>Right to data portability</strong> - You can request transfer of your data</li>
              <li><strong>Right to object</strong> - You can object to processing of your personal data</li>
            </ul>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to track activity on our platform and store
              certain information. You can instruct your browser to refuse all cookies or to indicate when
              a cookie is being sent.
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed">
              We may employ third-party companies and individuals to facilitate our service, provide service
              on our behalf, or assist us in analyzing how our service is used. These third parties have
              access to your personal data only to perform these tasks on our behalf and are obligated not
              to disclose or use it for any other purpose.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our service is not intended for children under the age of 13. We do not knowingly collect
              personal information from children under 13. If you are a parent or guardian and you are
              aware that your child has provided us with personal data, please contact us.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes by
              posting the new Privacy Policy on this page and updating the "Last updated" date at the top
              of this Privacy Policy.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul className="text-gray-700 space-y-2">
              <li>Email: <a href="mailto:privacy@easybuysale.com" className="text-blue-600 hover:underline">privacy@easybuysale.com</a></li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: 123 Market Street, City, State 12345</li>
            </ul>
          </section>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

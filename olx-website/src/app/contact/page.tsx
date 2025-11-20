import { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo';
import Link from 'next/link';
import { Mail, Phone, MapPin, MessageSquare, Clock, Send } from 'lucide-react';

export const metadata: Metadata = generateMetadata({
  title: 'Contact Us',
  description: 'Get in touch with EasyBuySale support team. We\'re here to help with any questions, concerns, or feedback about our marketplace platform.',
  keywords: ['contact us', 'customer support', 'help center', 'get in touch', 'EasyBuySale support'],
  url: '/contact',
});

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have a question or need help? We're here for you! Reach out to our friendly support team.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Information Cards */}
          <div className="lg:col-span-1 space-y-6">
            {/* Email Card */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Email Us</h3>
              </div>
              <p className="text-gray-600 mb-3">
                Send us an email and we'll respond within 24 hours.
              </p>
              <a
                href="mailto:support@easybuysale.com"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                support@easybuysale.com
              </a>
            </div>

            {/* Phone Card */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <Phone className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Call Us</h3>
              </div>
              <p className="text-gray-600 mb-3">
                Speak with a support representative directly.
              </p>
              <a
                href="tel:+15551234567"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                +1 (555) 123-4567
              </a>
              <div className="flex items-center mt-3 text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-2" />
                <span>Mon-Fri: 9AM - 6PM EST</span>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Visit Us</h3>
              </div>
              <p className="text-gray-600">
                123 Market Street<br />
                City, State 12345<br />
                United States
              </p>
            </div>

            {/* Live Chat Card */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Live Chat</h3>
              </div>
              <p className="mb-4">
                Get instant help from our support team through live chat.
              </p>
              <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors w-full">
                Start Chat
              </button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
            <form className="space-y-6">
              {/* Name Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
              </div>

              {/* Email and Phone */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="john.doe@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a topic</option>
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Support</option>
                  <option value="account">Account Issues</option>
                  <option value="payment">Payment & Billing</option>
                  <option value="report">Report a Problem</option>
                  <option value="feedback">Feedback & Suggestions</option>
                  <option value="partnership">Partnership Inquiry</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Send Message
                </button>
              </div>

              <p className="text-sm text-gray-500 text-center">
                By submitting this form, you agree to our{' '}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How do I create an account?
              </h3>
              <p className="text-gray-700">
                Click on the "Sign Up" button in the top right corner and fill out the registration form. It only takes a minute!
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is posting ads really free?
              </h3>
              <p className="text-gray-700">
                Yes! EasyBuySale is 100% free. You can post unlimited ads without any hidden charges or commission fees.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How do I contact a seller?
              </h3>
              <p className="text-gray-700">
                Simply click on any ad and use the "Message Seller" button to start a conversation directly through our platform.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What should I do if I encounter a problem?
              </h3>
              <p className="text-gray-700">
                Contact our support team using any of the methods above. We're here to help resolve any issues quickly.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How can I report suspicious activity?
              </h3>
              <p className="text-gray-700">
                If you encounter any suspicious listings or users, please email us immediately at{' '}
                <a href="mailto:report@easybuysale.com" className="text-blue-600 hover:underline">
                  report@easybuysale.com
                </a>
                {' '}with details. User safety is our top priority.
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link href="/faq" className="text-blue-600 hover:text-blue-700 font-medium">
              View All FAQs →
            </Link>
          </div>
        </section>

        {/* Business Hours */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow-md p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Our Support Hours</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div>
              <h3 className="font-semibold mb-2">Phone & Live Chat</h3>
              <p className="text-gray-300">Monday - Friday: 9:00 AM - 6:00 PM EST</p>
              <p className="text-gray-300">Saturday: 10:00 AM - 4:00 PM EST</p>
              <p className="text-gray-300">Sunday: Closed</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p className="text-gray-300">24/7 - We respond within 24 hours</p>
              <p className="text-gray-300 text-sm mt-2">
                For urgent issues, please call us during business hours.
              </p>
            </div>
          </div>
        </section>

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

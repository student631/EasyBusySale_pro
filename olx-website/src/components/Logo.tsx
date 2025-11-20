import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

/**
 * EasyBuySale Logo Component
 * Tagline: "Buy & Sell Anything, Anytime, Anywhere"
 */
export default function Logo({ size = 'medium', showText = true, className = '' }: LogoProps) {
  const sizes = {
    small: {
      icon: 32,
      text: 'text-xl',
      tagline: 'text-xs'
    },
    medium: {
      icon: 48,
      text: 'text-3xl',
      tagline: 'text-sm'
    },
    large: {
      icon: 64,
      text: 'text-4xl',
      tagline: 'text-base'
    }
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon - Using paid-search.png */}
      <div className="relative" style={{ width: currentSize.icon, height: currentSize.icon }}>
        <Image
          src="/logo.png"
          alt="EasyBuySale Logo"
          width={currentSize.icon}
          height={currentSize.icon}
          className="object-contain"
          priority
        />
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`${currentSize.text} font-bold text-[#008299] leading-tight`}>
            EasyBuySale
          </span>
          <span className={`${currentSize.tagline} text-gray-600 font-medium leading-tight`}>
            Buy & Sell Anything
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Simplified Icon-Only Logo (for favicons, etc.)
 */
export function LogoIcon({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="EasyBuySale Logo"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      priority
    />
  );
}

/**
 * Full Logo with Tagline (for landing pages, headers)
 */
export function LogoFull({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <Logo size="large" showText={true} />
      <p className="mt-2 text-sm text-gray-500 font-medium max-w-xs">
        Buy & Sell Anything, Anytime, Anywhere
      </p>
    </div>
  );
}

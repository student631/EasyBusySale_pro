# EasyBuySale Logo Usage Guide

## Logo Components

The EasyBuySale logo is available in three variants:

### 1. `<Logo>` - Main Logo Component
Full logo with icon and optional text.

```tsx
import Logo from '@/components/Logo';

// Default usage (medium size with text)
<Logo />

// Small size without text (icon only)
<Logo size="small" showText={false} />

// Large size with text
<Logo size="large" showText={true} />
```

**Props:**
- `size?: 'small' | 'medium' | 'large'` (default: 'medium')
- `showText?: boolean` (default: true)
- `className?: string` (optional)

**Sizes:**
- Small: 32px icon, text-xl text
- Medium: 48px icon, text-3xl text
- Large: 64px icon, text-4xl text

---

### 2. `<LogoIcon>` - Icon Only
Simplified icon-only version for favicons, app icons, or small spaces.

```tsx
import { LogoIcon } from '@/components/Logo';

<LogoIcon size={48} />
<LogoIcon size={32} className="rounded-full" />
```

**Props:**
- `size?: number` (default: 48)
- `className?: string` (optional)

---

### 3. `<LogoFull>` - Full Logo with Tagline
Complete branding package with logo and tagline for landing pages.

```tsx
import { LogoFull } from '@/components/Logo';

<LogoFull />
<LogoFull className="my-8" />
```

**Output:**
```
[Logo Icon] EasyBuySale
             Buy & Sell Anything
     "Buy & Sell Anything, Anytime, Anywhere"
```

---

## Usage Examples

### Header Component

```tsx
import Logo from '@/components/Logo';

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3">
        <Link href="/">
          <Logo size="small" showText={true} />
        </Link>
      </div>
    </header>
  );
}
```

### Footer Component

```tsx
import Logo from '@/components/Logo';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <Logo size="medium" showText={true} className="mb-4" />
        <p className="text-gray-400">
          © 2024 EasyBuySale. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
```

### Landing Page Hero

```tsx
import { LogoFull } from '@/components/Logo';

export default function HeroSection() {
  return (
    <section className="text-center py-20 bg-gradient-to-r from-blue-50 to-purple-50">
      <LogoFull className="mb-8" />
      <h2 className="text-3xl font-bold mb-4">
        The Easiest Way to Buy and Sell Online
      </h2>
      <button className="bg-[#008299] text-white px-8 py-3 rounded-lg">
        Get Started
      </button>
    </section>
  );
}
```

### Favicon / App Icon

For generating favicons and app icons, use the `<LogoIcon>` component and export as PNG:

```tsx
import { LogoIcon } from '@/components/Logo';

// For favicon.ico (16x16, 32x32, 48x48)
<LogoIcon size={16} />
<LogoIcon size={32} />
<LogoIcon size={48} />

// For apple-touch-icon.png (180x180)
<LogoIcon size={180} />

// For manifest icons (192x192, 512x512)
<LogoIcon size={192} />
<LogoIcon size={512} />
```

---

## Brand Colors

```css
/* Primary Teal */
--primary-color: #008299;
--primary-dark: #006580;

/* Accent Gold */
--accent-color: #FFD700;

/* Usage */
.logo-primary {
  color: #008299;
}

.logo-accent {
  color: #FFD700;
}
```

---

## Tagline

**Official Tagline:**
> "Buy & Sell Anything, Anytime, Anywhere"

**Usage:**
- Hero sections
- Email signatures
- Marketing materials
- App store descriptions

**Variations:**
- Short: "Buy & Sell Anything"
- Medium: "Buy & Sell Anything, Anytime"
- Full: "Buy & Sell Anything, Anytime, Anywhere"

---

## Do's and Don'ts

### ✅ DO:
- Use the logo on white or light backgrounds
- Maintain aspect ratio when scaling
- Use official brand colors
- Provide adequate spacing around the logo
- Use PNG or SVG formats for best quality

### ❌ DON'T:
- Stretch or distort the logo
- Change the colors (except for monochrome versions)
- Add effects (shadows, gradients, etc.)
- Place on busy backgrounds that reduce readability
- Rotate or flip the logo

---

## Minimum Sizes

For optimal readability:
- **Web:** Minimum 32px height
- **Print:** Minimum 0.5 inches height
- **Social Media:** Minimum 100px x 100px

---

## File Formats

### SVG (Scalable Vector Graphics)
- Best for web and print
- Infinitely scalable without quality loss
- Used in the React component

### PNG (Portable Network Graphics)
- For raster images
- Use transparent background
- Export at 2x resolution for retina displays

### ICO (Icon File)
- For favicon.ico
- Include multiple sizes (16x16, 32x32, 48x48)

---

## Quick Reference

| Component | Usage | Size | Show Text |
|-----------|-------|------|-----------|
| `<Logo>` | General use | 48px | Yes |
| `<Logo size="small">` | Headers, nav | 32px | Yes |
| `<Logo size="large">` | Banners | 64px | Yes |
| `<LogoIcon>` | Favicons, icons | 48px | No |
| `<LogoFull>` | Landing pages | 64px | Yes + Tagline |

---

## Integration Checklist

- [ ] Replace placeholder logo in Header component
- [ ] Add logo to Footer component
- [ ] Update favicon.ico with new logo
- [ ] Create apple-touch-icon.png
- [ ] Update manifest.json with icon paths
- [ ] Add logo to email templates
- [ ] Use logo in social media profiles
- [ ] Create Open Graph image with logo

---

## Support

For custom logo variations or questions, contact:
- **Email:** design@easybuysale.com
- **Component:** `olx-website/src/components/Logo.tsx`

---

**Brand Identity Version:** 1.0
**Last Updated:** October 31, 2025

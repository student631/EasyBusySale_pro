# OLX Website - Buy and Sell Everything

A modern, responsive marketplace website built with Next.js 15, TypeScript, and Tailwind CSS. This project replicates the core functionality of OLX, allowing users to buy, sell, and search for items online.

## 🚀 Features

### Core Functionality
- **Homepage** - Featured categories, recent ads, and hero search
- **User Authentication** - Login and signup pages with social login options
- **Post Ad** - Multi-step form for creating advertisements with image uploads
- **Search & Filter** - Advanced search with category, price, location, and condition filters
- **Responsive Design** - Mobile-first approach with Tailwind CSS

### Pages
- `/` - Homepage with categories and featured ads
- `/login` - User login page
- `/signup` - User registration page
- `/post-ad` - Multi-step ad creation form
- `/search` - Search results with advanced filtering

### Components
- `Header` - Navigation with search, logo, and user actions
- `Footer` - Company information and links
- Responsive navigation with mobile menu
- Search functionality with filters

## 🛠️ Tech Stack

- **Frontend Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Development**: ESLint, Turbopack

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd olx-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
olx-website/
├── src/
│   ├── app/
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   ├── signup/
│   │   │   └── page.tsx          # Signup page
│   │   ├── post-ad/
│   │   │   └── page.tsx          # Post ad form
│   │   ├── search/
│   │   │   └── page.tsx          # Search results
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Homepage
│   │   └── globals.css           # Global styles
│   └── components/
│       ├── Header.tsx            # Navigation header
│       └── Footer.tsx            # Site footer
├── public/                        # Static assets
├── package.json                   # Dependencies
└── README.md                     # This file
```

## 🎨 Design Features

- **Modern UI/UX** - Clean, intuitive interface following modern design principles
- **Responsive Layout** - Mobile-first design that works on all devices
- **Color Scheme** - Orange (#f97316) primary color with gray accents
- **Typography** - Geist font family for excellent readability
- **Interactive Elements** - Hover effects, transitions, and smooth animations

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- Tailwind CSS for styling
- Component-based architecture
- Responsive design patterns
- Accessibility considerations

## 🚧 Future Enhancements

### Backend Integration
- User authentication API
- Database for ads and users
- Image upload and storage
- Search and filtering API
- Real-time messaging

### Additional Features
- User profiles and dashboards
- Ad management
- Favorites and watchlist
- Reviews and ratings
- Payment integration
- Push notifications

### Performance
- Image optimization
- Lazy loading
- Caching strategies
- SEO optimization

## 📱 Responsive Design

The website is fully responsive and optimized for:
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

This project is for educational purposes. OLX is a registered trademark of its respective owners.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For questions or support, please open an issue in the repository.

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**

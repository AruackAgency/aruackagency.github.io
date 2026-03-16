export const APP_NAME = "Aruack Agency";
export const BRAND_SUBTITLE = "Agency";
export const LOGO_PATH = "https://i.ibb.co/4nTMRsbn/aruack.png";

export const CONTACT_EMAIL = "support@aruack.online";
export const CONTACT_PHONE = "+1 (800) ARUACK-1";
export const WHATSAPP_NUMBER = "1234567890";

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/aruack_official",
  youtube: "https://youtube.com/@aruack",
  github: "https://github.com/Aruack",
  facebook: "#",
  twitter: "#",
  linkedin: "#"
};

export const PRODUCT_CATEGORIES = [
  'All',
  'CRM',
  'ERP',
  'Accounting',
  'Project Management',
  'E-commerce',
  'Help Desk',
  'Inventory',
  'Marketing Automation'
];

export const PRODUCTS = [
  {
    id: 'p1',
    category: 'CRM',
    title: 'Aruack CRM Elite',
    price: '$199/mo',
    description: 'A professional customer relationship management platform with advanced lead scoring and sales pipeline analytics.',
    icon: 'fa-users-cog',
    featured: true,
    status: 'active',
    rating: 4.9,
    features: ['Lead Management', 'Email Automation', 'Sales Analytics', 'Custom Reports'],
    pricingTiers: [
      { name: 'Starter', price: '$49/mo', features: ['Up to 3 Users', 'Core CRM', 'Email Sync'] },
      { name: 'Pro', price: '$199/mo', features: ['Unlimited Users', 'Advanced Analytics', 'API Access'] },
      { name: 'Enterprise', price: 'Custom', features: ['Dedicated Support', 'SLA Agreement', 'Custom Integration'] }
    ]
  },
  {
    id: 'p2',
    category: 'ERP',
    title: 'Aruack Agency ERP',
    price: '$499/mo',
    description: 'An integrated business management suite designed for global operations, including finance, supply chain, and HR.',
    icon: 'fa-building',
    featured: true,
    status: 'active',
    rating: 5.0,
    features: ['Financial Management', 'Inventory Control', 'Human Resources', 'Business Intelligence']
  },
  {
    id: 'p3',
    category: 'Accounting',
    title: 'FiscalFlow Pro',
    price: '$129/mo',
    description: 'Modern accounting software featuring automated tax compliance, multi-currency support, and professional auditing.',
    icon: 'fa-file-invoice-dollar',
    status: 'active',
    rating: 4.8,
    features: ['Tax Automation', 'Multi-currency Support', 'Bank Reconciliation', 'Professional Invoicing']
  },
  {
    id: 'p4',
    category: 'Project Management',
    title: 'Orbit Task Manager',
    price: '$29/user',
    description: 'A visual project management tool designed to help professional teams maintain productivity and hit deadlines.',
    icon: 'fa-tasks',
    status: 'active',
    rating: 4.7,
    features: ['Agile Boards', 'Time Tracking', 'Resource Planning', 'Team Collaboration']
  },
  {
    id: 'p5',
    category: 'E-commerce',
    title: 'OmniStore Platform',
    price: '$249/mo',
    description: 'A powerful e-commerce engine for businesses seeking custom online shopping experiences and global reach.',
    icon: 'fa-shopping-bag',
    featured: true,
    status: 'active',
    rating: 4.9,
    features: ['Flexible API', 'Inventory Management', 'Checkout Optimization', 'Mobile Commerce']
  }
];

export const SERVICES = [
  { 
    id: 'web-app-dev', 
    title: 'Web & App Development', 
    description: 'Development of websites, e-commerce platforms, WordPress, and Custom Apps.', 
    icon: 'fa-laptop-code',
    category: 'Agency Services',
    price: 'Custom Quote',
    rating: 5.0,
    features: ['Custom UI/UX Design', 'Scalable Architecture', 'Web & Mobile Platforms', 'SEO Optimization'],
    featured: true,
    customLink: '/web-app-dev/'
  },
  { 
    id: 'design', 
    title: 'Design Services', 
    description: 'Complete design suite: Web, UX/UI, Product, Logo, Graphic, Packaging, Print, Animation & Multimedia.', 
    icon: 'fa-pen-nib',
    category: 'Agency Services',
    price: 'Custom Quote',
    rating: 4.9,
    features: ['Brand Identity Creation', 'High-Fidelity Prototyping', 'Multimedia Animation', 'Print & Digital Assets'],
    featured: false,
    customLink: '/design-services/'
  },
  { 
    id: 'custom-software', 
    title: 'Custom Software Development', 
    description: 'Tailored software solutions built with technologies like Java, PHP, Python, .NET, React, Angular, Node.js and more.', 
    icon: 'fa-cogs',
    category: 'Agency Services',
    price: 'Custom Quote',
    rating: 5.0,
    features: ['Full-Stack Engineering', 'API Development & Integration', 'Legacy System Upgrades', 'Cloud Deployment'],
    featured: false,
    customLink: '/custom-software/'
  },
  { 
    id: 'android-services', 
    title: 'Android Rooting & Custom ROMs', 
    description: 'Unlock the full potential of your Android device. Remove bloatware, install Custom ROMs (LineageOS, Pixel Experience), and Xposed Framework modules.', 
    icon: 'fa-android',
    category: 'Agency Services',
    price: 'Custom Quote',
    rating: 4.8,
    features: ['Safe Bootloader Unlocking', 'Custom ROM Installation', 'Xposed Framework Mods', 'Performance & Battery Tweaks'],
    featured: true,
    customLink: '/android/'
  },
  { 
    id: 'tech-insights', 
    title: 'Latest Tech Insights', 
    description: 'Cutting-edge tech consulting and solutions: AI/ML, IoT, Chatbots, DevOps, Blockchain.', 
    icon: 'fa-network-wired',
    category: 'Agency Services',
    price: 'Custom Quote',
    rating: 5.0,
    features: ['AI Model Integration', 'Blockchain Smart Contracts', 'Automated DevOps Pipelines', 'IoT Device Management'],
    featured: false,
    customLink: '/tech-insights/'
  }
];

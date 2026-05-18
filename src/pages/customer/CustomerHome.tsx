import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { 
  Sprout, Leaf, ArrowRight, Sparkles, Activity, ShieldCheck, 
  CloudSun, DollarSign, Users, Cpu, Layers, ShoppingBag, 
  Plus, Check, Droplets, MapPin, Zap, CheckCircle2,
  ShoppingCart, Truck, Package, Heart, Star, ChevronLeft, ChevronRight
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../utils/translations';
import { cn } from '../../lib/utils';

// Unsplash high-resolution futuristic/premium farm images
const CROP_SCANNER_IMG = "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?q=80&w=800&auto=format&fit=crop";

interface FirebaseProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit?: string;
  imageUrl?: string;
  description?: string;
  visible?: boolean;
  rating?: number;
  isOrganic?: boolean;
  isBestSeller?: boolean;
}

export function CustomerHome() {
  const { setCurrentCustomerPage, language, addToCart, cart } = useStore();
  const t = useTranslation(language);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollLeft = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const scrollRight = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 292, behavior: 'smooth' });
    }
  };


  // Live Firebase Products
  const [products, setProducts] = useState<FirebaseProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Autoplay slider scrolling one-by-one
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let autoplayActive = true;

    const handleMouseEnter = () => { autoplayActive = false; };
    const handleMouseLeave = () => { autoplayActive = true; };

    slider.addEventListener('mouseenter', handleMouseEnter);
    slider.addEventListener('mouseleave', handleMouseLeave);

    const interval = setInterval(() => {
      if (!autoplayActive) return;
      
      const maxScroll = slider.scrollWidth - slider.clientWidth;
      if (slider.scrollLeft >= maxScroll - 10) {
        slider.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Scroll by one compact card width + gap (260px card + 32px gap = 292px)
        slider.scrollBy({ left: 292, behavior: 'smooth' });
      }
    }, 3500);

    return () => {
      clearInterval(interval);
      slider.removeEventListener('mouseenter', handleMouseEnter);
      slider.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [products]);

  // Wishlist state for premium ecommerce experience
  const [favorites, setFavorites] = useState<string[]>([]);
  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  // Fullscreen Cinematic Background Images Array
  const bgImages = useMemo(() => [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1530906358829-e84b2769270f?q=80&w=1600&auto=format&fit=crop"
  ], []);

  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg(prev => (prev + 1) % bgImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [bgImages.length]);

  // Local translations for advanced futuristic copy
  const localCopy = {
    ta: {
      welcome: "வரவேற்கிறோம்",
      logeshVivasayi: "லோகேஷ் விவசாயி",
      subheadingText: "ஸ்மார்ட் விவசாயம் • புதிய தயாரிப்புகள் • எதிர்கால வேளாண்மை",
      orderNow: "இப்போது ஆர்டர் செய்ய",
      exploreMore: "மேலும் அறிய",
      workflowTag: "ஸ்மார்ட் பணிப்பாய்வு",
      workflowHeading: "அடுத்த தலைமுறை நுண்ணறிவு அம்சங்கள்",
      workflowSubheading: "நவீன விவசாய வர்த்தகத்திற்கான எளிய, வேகமான மற்றும் ஸ்மார்ட் செயல்முறை.",
      step1Title: "தயாரிப்புகளைத் தேர்ந்தெடுக்கவும்",
      step1Desc: "நம்பகமான விவசாயிகளிடமிருந்து புதிய காய்கறிகள், பழங்கள், விதைகள் மற்றும் விவசாயத் தேவைகளைத் தேடுங்கள்.",
      step2Title: "ஆர்டர் செய்யுங்கள்",
      step2Desc: "தயாரிப்புகளை எளிதாகத் தேர்ந்தெடுத்து பாதுகாப்பான டிஜிட்டல் செக்அவுட் மூலம் ஆர்டர் செய்யுங்கள்.",
      step3Title: "டெலிவரியைக் கண்காணிக்கவும்",
      step3Desc: "உங்கள் ஆர்டரின் நிலை மற்றும் விநியோகப் புதுப்பிப்புகளை நிகழ்நேரத்தில் கண்காணிக்கலாம்.",
      step4Title: "தயாரிப்புகளைப் பெறுங்கள்",
      step4Desc: "புதிய மற்றும் தரமான விவசாயத் தயாரிப்புகளை நேரடியாக உங்கள் இருப்பிடத்திற்குப் பெறுங்கள்.",
      heroBadge: "பண்ணை தொழில்நுட்ப தளம் v2.0",
      heroTitle: "டிஜிட்டல் விவசாயத்தின் புதிய புரட்சி",
      heroSubtitle: "செயற்கை நுண்ணறிவு (AI) பகுப்பாய்வு, நேரடி சந்தை இணைப்பு, வானிலை நுண்ணறிவு மற்றும் அதிநவீன ஸ்மார்ட் பயிர் மேலாண்மை மூலம் விவசாயிகளை மேம்படுத்துகிறோம்.",
      exploreMarketplace: "சந்தையை ஆராய்க",
      getStarted: "தொடங்கவும்",
      dashboardPreview: "ஸ்மார்ட் டெலிமெட்ரி டேஷ்போர்டு",
      activeStatus: "செயலில் உள்ள AI கண்காணிப்பு",
      soilMoisture: "மண் ஈரப்பதம்",
      cropHealth: "பயிர் ஆரோக்கியம்",
      growthIndex: "பயிர் வளர்ச்சி விகிதம்",
      harvestEst: "அறுவடை கணிப்பு",
      featuresTitle: "அதிநவீன தொழில்நுட்ப அம்சங்கள்",
      featuresSubtitle: "லோகேஷ் விவசாயி அடுத்த தலைமுறை டிஜிட்டல் தீர்வுகளை ஒருங்கிணைத்து பண்ணை உற்பத்தித்திறனை மேம்படுத்துகிறது.",
      marketplaceTitle: "ஸ்மார்ட் சந்தை முன்னோட்டம்",
      marketplaceSubtitle: "எங்கள் தொழில்நுட்ப ரீதியான பண்ணைகளிலிருந்து நேரடியாக 100% தூய்மையான தயாரிப்புகள்.",
      allCategories: "அனைத்து வகைகள்",
      analyticsTitle: "நிகழ்நேர பண்ணை பகுப்பாய்வு",
      analyticsSubtitle: "மேம்பட்ட சென்சார்கள் மற்றும் IoT சாதனங்களின் நேரடித் தரவுகள் மூலம் பயிர் வளர்ச்சியைத் துல்லியமாகக் கணக்கிடுங்கள்.",
      futureVisionTitle: "எதிர்கால விவசாய பார்வை",
      futureVisionSubtitle: "IoT நீர்ப்பாசனம் மற்றும் முழுமையாக தானியங்கி முறைகளை நோக்கிய எங்களின் தொழில்நுட்பப் பயணம்.",
      joinCTA: "விவசாயத்தின் எதிர்காலத்துடன் இணையுங்கள்",
      joinCTASub: "லோகேஷ் விவசாயி தளத்துடன் இணைந்து உங்கள் விவசாய உத்திகளை அதிநவீனமாக மேம்படுத்துங்கள்.",
      quickView: "விரைவு பார்வை",
      added: "சேர்க்கப்பட்டது",
      aiCropAnalytics: "AI பயிர் பகுப்பாய்வு",
      aiCropAnalyticsDesc: "இலை ஸ்கேனர் மற்றும் ஆட்டோ-விஷன் மூலம் பயிர் நோய்களை உடனுக்குடன் கண்டறியுங்கள்.",
      smartWeather: "ஸ்மார்ட் வானிலை கண்காணிப்பு",
      smartWeatherDesc: "பண்ணையின் நுண்-வானிலை மற்றும் மண்ணின் ஈரப்பதத்தை நிகழ்நேரத்தில் கண்காணிக்கலாம்.",
      onlineMarket: "டிஜிட்டல் சந்தை",
      onlineMarketDesc: "இடைத்தரகர்கள் இன்றி, நியாயமான விலையில் நுகர்வோருக்கு நேரடியாக விற்பனை செய்யுங்கள்.",
      securePay: "பாதுகாப்பான பரிவர்த்தனைகள்",
      securePayDesc: "Firebase பாதுகாப்பில் செய்யப்பட்ட வேகமான மற்றும் நம்பகமான டிஜிட்டல் கட்டண முறை.",
      inventoryManage: "இருப்பு மேலாண்மை",
      inventoryManageDesc: "உங்கள் விதைகள், உரங்கள் மற்றும் விளைச்சல் இருப்பை ஆட்டோ-அலர்ட் மூலம் நிர்வகியுங்கள்.",
      farmerComm: "விவசாயி சமூகம்",
      farmerCommDesc: "அனுபவம் வாய்ந்த விவசாயிகளுடன் உரையாடி, நவீன முறைகளைப் பகிர்ந்து கொள்ளுங்கள்."
    },
    en: {
      welcome: "Welcome to",
      logeshVivasayi: "Logesh Vivasayi",
      subheadingText: "Smart Farming • Fresh Products • Future Agriculture",
      orderNow: "Order Now",
      exploreMore: "Explore More",
      workflowTag: "Smart Workflow",
      workflowHeading: "Next-Gen Intelligent Features",
      workflowSubheading: "Simple, fast, and smart process for modern agriculture commerce.",
      step1Title: "SELECT PRODUCTS",
      step1Desc: "Browse fresh vegetables, fruits, seeds, and farming essentials from trusted farmers.",
      step2Title: "PLACE ORDER",
      step2Desc: "Choose products easily and place orders with secure digital checkout.",
      step3Title: "TRACK DELIVERY",
      step3Desc: "Monitor your order status and delivery updates in real time.",
      step4Title: "RECEIVE PRODUCTS",
      step4Desc: "Get fresh and quality agricultural products delivered directly to your location.",
      heroBadge: "AGRI-TECH PLATFORM v2.0",
      heroTitle: "Revolutionizing Agriculture with Smart Digital Farming",
      heroSubtitle: "Empowering farmers with AI-powered analytics, marketplace connectivity, weather intelligence, and smart crop management.",
      exploreMarketplace: "Explore Marketplace",
      getStarted: "Get Started",
      dashboardPreview: "Smart Telemetry Dashboard",
      activeStatus: "Active AI Monitoring",
      soilMoisture: "Soil Moisture",
      cropHealth: "Crop Health",
      growthIndex: "Crop Growth Index",
      harvestEst: "Harvest Est.",
      featuresTitle: "Next-Gen Intelligent Features",
      featuresSubtitle: "Logesh Vivasayi integrates advanced digital capabilities to optimize farm-to-table productivity.",
      marketplaceTitle: "Next-Gen Marketplace Preview",
      marketplaceSubtitle: "100% natural, high-yield organic crops directly from our tech-enabled farms.",
      allCategories: "All Categories",
      analyticsTitle: "Real-Time SaaS Telemetry",
      analyticsSubtitle: "Leverage live IoT soil sensors, automated crop index feeds, and localized growth telemetry.",
      futureVisionTitle: "The Future of Farming",
      futureVisionSubtitle: "Empowering agricultural ecosystems with smart irrigation, AI robotics, and global marketplaces.",
      joinCTA: "Join the Future of Farming",
      joinCTASub: "Register today and experience a billion-dollar futuristic agricultural ecosystem at your fingertips.",
      quickView: "Quick View",
      added: "Added",
      aiCropAnalytics: "AI Crop Analytics",
      aiCropAnalyticsDesc: "Real-time crop diagnostics and foliage health analysis using smart computer vision.",
      smartWeather: "Smart Weather Tracking",
      smartWeatherDesc: "Micro-climate intelligence and soil diagnostics localized to your farm coordinates.",
      onlineMarket: "Online Marketplace",
      onlineMarketDesc: "Direct farm-to-consumer pipelines bypassing intermediaries to maximize farmer revenue.",
      securePay: "Secure Payments",
      securePayDesc: "End-to-end encrypted financial transactions backed by advanced Firebase security rules.",
      inventoryManage: "Inventory Management",
      inventoryManageDesc: "Predictive inventory forecasting and automated crop storage level warnings.",
      farmerComm: "Farmer Community",
      farmerCommDesc: "A collaborative hub of progressive growers exchanging insights and organic methodologies."
    }
  };

  const copy = localCopy[language] || localCopy.en;

  // Mock Products fallback in case Firebase is empty or loading
  const mockProducts: FirebaseProduct[] = [
    {
      id: "mock-1",
      name: language === "ta" ? "புதிய தக்காளி" : "Fresh Tomatoes",
      category: language === "ta" ? "காய்கறிகள்" : "Vegetables",
      price: 45,
      stock: 50,
      unit: "1kg",
      rating: 4.8,
      isOrganic: true,
      isBestSeller: true,
      imageUrl: "https://images.unsplash.com/photo-1595855759920-86582396756a?q=80&w=600&auto=format&fit=crop",
      description: "Directly harvested fresh red tomatoes, rich in vitamin C."
    },
    {
      id: "mock-2",
      name: language === "ta" ? "இயற்கை கேரட்" : "Organic Carrots",
      category: language === "ta" ? "காய்கறிகள்" : "Vegetables",
      price: 60,
      stock: 35,
      unit: "1kg",
      rating: 4.7,
      isOrganic: true,
      isBestSeller: false,
      imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=600&auto=format&fit=crop",
      description: "Crunchy orange organic carrots, farm-fresh and high-purity."
    },
    {
      id: "mock-3",
      name: language === "ta" ? "பச்சை மிளகாய்" : "Green Chilli",
      category: language === "ta" ? "காய்கறிகள்" : "Vegetables",
      price: 35,
      stock: 40,
      unit: "1kg",
      rating: 4.9,
      isOrganic: true,
      isBestSeller: true,
      imageUrl: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?q=80&w=600&auto=format&fit=crop",
      description: "Spicy and vibrant green chillies picked at peak harvest."
    },
    {
      id: "mock-4",
      name: language === "ta" ? "இயற்கை அரிசி" : "Natural Rice",
      category: language === "ta" ? "தானியங்கள்" : "Grains",
      price: 95,
      stock: 80,
      unit: "1kg",
      rating: 4.9,
      isOrganic: true,
      isBestSeller: true,
      imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop",
      description: "Premium stone-ground natural traditional white rice."
    },
    {
      id: "mock-5",
      name: language === "ta" ? "புதிய மாம்பழம்" : "Fresh Mangoes",
      category: language === "ta" ? "பழங்கள்" : "Fruits",
      price: 180,
      stock: 15,
      unit: "1kg",
      rating: 4.8,
      isOrganic: true,
      isBestSeller: true,
      imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=600&auto=format&fit=crop",
      description: "Vibrant sweet organic Alphonso mangoes, honeyed taste."
    },
    {
      id: "mock-6",
      name: language === "ta" ? "இயற்கை விதைகள்" : "Organic Seeds",
      category: language === "ta" ? "விதைகள்" : "Seeds",
      price: 120,
      stock: 100,
      unit: "1kg",
      rating: 4.6,
      isOrganic: true,
      isBestSeller: false,
      imageUrl: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?q=80&w=600&auto=format&fit=crop",
      description: "Tested high-germination premium organic seeds for garden and farm."
    }
  ];

  // Fetch products from Firebase Firestore
  useEffect(() => {
    try {
      const q = query(collection(db, 'products'), orderBy('name', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          setProducts(snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as FirebaseProduct)));
        } else {
          setProducts(mockProducts);
        }
        setLoadingProducts(false);
      }, (error) => {
        console.error("Firestore loading error, falling back to mocks:", error);
        setProducts(mockProducts);
        setLoadingProducts(false);
      });
      return unsubscribe;
    } catch (e) {
      console.warn("Failed to load Firebase, displaying premium fallback products:", e);
      setProducts(mockProducts);
      setLoadingProducts(false);
    }
  }, [language]);

  // Marketplace Category Filtering
  const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category || 'Uncategorized')));
    return ["All", ...cats.filter(c => c !== "")];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      const isVisible = p.visible !== false;
      return matchesCategory && isVisible;
    }).slice(0, 8); // Display first 8 products as a preview
  }, [products, selectedCategory]);

  // Workflow Steps Config Array
  const workflowSteps = useMemo(() => [
    {
      icon: ShoppingBag,
      title: copy.step1Title,
      desc: copy.step1Desc,
      accentColor: "emerald",
      bgClass: "from-emerald-500/20 via-transparent to-emerald-500/10",
      cardBg: "bg-emerald-100/80 dark:bg-emerald-950/45 border-emerald-500/35 dark:border-emerald-500/25 shadow-lg shadow-emerald-500/[0.04]",
      iconBg: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      iconActiveBg: "group-hover:bg-emerald-600 group-hover:text-white group-hover:border-transparent group-hover:shadow-emerald-500/35",
      badgeBg: "bg-emerald-100 dark:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
      cardBorder: "hover:border-emerald-500/50 dark:hover:border-emerald-500/40 hover:shadow-emerald-500/10",
      textClass: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
    },
    {
      icon: ShoppingCart,
      title: copy.step2Title,
      desc: copy.step2Desc,
      accentColor: "amber",
      bgClass: "from-amber-500/20 via-transparent to-amber-500/10",
      cardBg: "bg-amber-100/80 dark:bg-amber-950/45 border-amber-500/35 dark:border-amber-500/25 shadow-lg shadow-amber-500/[0.04]",
      iconBg: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
      iconActiveBg: "group-hover:bg-amber-600 group-hover:text-white group-hover:border-transparent group-hover:shadow-amber-500/35",
      badgeBg: "bg-amber-100 dark:bg-amber-500/30 text-amber-700 dark:text-amber-300 border-amber-500/30",
      cardBorder: "hover:border-amber-500/50 dark:hover:border-amber-500/40 hover:shadow-amber-500/10",
      textClass: "group-hover:text-amber-600 dark:group-hover:text-amber-400"
    },
    {
      icon: Truck,
      title: copy.step3Title,
      desc: copy.step3Desc,
      accentColor: "teal",
      bgClass: "from-teal-500/20 via-transparent to-teal-500/10",
      cardBg: "bg-teal-100/80 dark:bg-teal-950/45 border-teal-500/35 dark:border-teal-500/25 shadow-lg shadow-teal-500/[0.04]",
      iconBg: "bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 border-teal-500/30",
      iconActiveBg: "group-hover:bg-teal-600 group-hover:text-white group-hover:border-transparent group-hover:shadow-teal-500/35",
      badgeBg: "bg-teal-100 dark:bg-teal-500/30 text-teal-700 dark:text-teal-300 border-teal-500/30",
      cardBorder: "hover:border-teal-500/50 dark:hover:border-teal-500/40 hover:shadow-teal-500/10",
      textClass: "group-hover:text-teal-600 dark:group-hover:text-teal-400"
    },
    {
      icon: Package,
      title: copy.step4Title,
      desc: copy.step4Desc,
      accentColor: "lime",
      bgClass: "from-lime-500/20 via-transparent to-lime-500/10",
      cardBg: "bg-lime-100/80 dark:bg-lime-950/45 border-lime-500/35 dark:border-lime-500/25 shadow-lg shadow-lime-500/[0.04]",
      iconBg: "bg-lime-100 dark:bg-lime-500/20 text-lime-600 dark:text-lime-400 border-lime-500/30",
      iconActiveBg: "group-hover:bg-lime-600 group-hover:text-white group-hover:border-transparent group-hover:shadow-lime-500/35",
      badgeBg: "bg-lime-100 dark:bg-lime-500/30 text-lime-700 dark:text-lime-300 border-lime-500/30",
      cardBorder: "hover:border-lime-500/50 dark:hover:border-lime-500/40 hover:shadow-lime-500/10",
      textClass: "group-hover:text-lime-600 dark:group-hover:text-lime-400"
    }
  ], [copy]);

  // Cart animation states
  const [addedItemIds, setAddedItemIds] = useState<string[]>([]);
  const handleAddToCart = (product: FirebaseProduct) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      unit: product.unit || '1kg',
      imageUrl: product.imageUrl || '',
      description: product.description || '',
      category: product.category || 'General'
    });
    setAddedItemIds(prev => [...prev, product.id]);
    setTimeout(() => {
      setAddedItemIds(prev => prev.filter(id => id !== product.id));
    }, 2000);
  };

  // Scroll logic for "Get Started" smooth anchor scroll
  const handleGetStartedScroll = () => {
    const featureSection = document.getElementById('bento-features');
    if (featureSection) {
      featureSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Simulated Telemetry Live Moisture & Crop Health Value Tick
  const [telemetry, setTelemetry] = useState({
    moisture: 68,
    temp: 28.5,
    cropHealth: 94.2
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        moisture: Math.round(65 + Math.random() * 5),
        temp: parseFloat((27 + Math.random() * 3).toFixed(1)),
        cropHealth: parseFloat((93.5 + Math.random() * 2.5).toFixed(1))
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden relative">
      
      {/* Background Decorative Blur Orbs */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 blur-[120px] animate-float-slow" />
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full bg-lime-400/10 dark:bg-lime-400/15 blur-[150px] animate-float-fast" />
        <div className="absolute bottom-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-emerald-400/5 dark:bg-emerald-500/10 blur-[130px] animate-float-slow" />
        <div className="absolute inset-0 bg-cyber-grid opacity-60 dark:opacity-40" />
      </div>

      {/* 2️⃣ DYNAMIC CINEMATIC HERO SECTION */}
      <section className="relative w-full h-[100vh] flex items-center justify-center overflow-hidden bg-emerald-950">
        
        {/* Background Image Slider (Fade + Scale Transition) */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentBg}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1.03 }}
              exit={{ opacity: 0, scale: 1.0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${bgImages[currentBg]})` }}
            />
          </AnimatePresence>
          
          {/* Multi-layered cinematic gradient overlays for pristine readability - replaced black/slate with rich deep green */}
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/85 via-emerald-950/45 to-emerald-950 z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(2,44,34,0.65)_100%)] z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-transparent z-10" />
        </div>

        {/* Ambient Floating Particle Clouds */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 md:w-1.5 md:h-1.5 bg-emerald-400/40 rounded-full"
              initial={{ 
                x: Math.random() * 100 + "%", 
                y: Math.random() * 100 + "%", 
                scale: Math.random() * 0.5 + 0.5,
                opacity: Math.random() * 0.3 + 0.15 
              }}
              animate={{ 
                y: ["105vh", "-10vh"],
                x: ["0%", (Math.random() * 20 - 10) + "%"]
              }}
              transition={{ 
                duration: Math.random() * 20 + 20, 
                repeat: Infinity, 
                ease: "linear",
                delay: Math.random() * -20
              }}
            />
          ))}
        </div>

        {/* Ambient Blur Glow Orbs */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full bg-emerald-500/20 blur-[110px] animate-float-slow" />
          <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] rounded-full bg-lime-500/10 blur-[90px] animate-float-fast" />
        </div>

        {/* Center Aligned Text Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20 text-center space-y-6 md:space-y-8 select-none">
          
          {/* Welcome Text */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <span className="text-[11px] sm:text-xs md:text-sm font-black uppercase tracking-[0.35em] text-emerald-400 font-poppins">
              {copy.welcome}
            </span>
            <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent mt-3" />
          </motion.div>

          {/* Main Title Heading */}
          <div className="overflow-hidden py-2">
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl sm:text-8xl md:text-9xl font-black text-white tracking-tighter leading-none font-poppins relative"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-200">
                Logesh
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-lime-300 drop-shadow-[0_4px_12px_rgba(16,185,129,0.15)]">
                Vivasayi
              </span>
            </motion.h1>
          </div>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="text-slate-300 font-extrabold text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] max-w-2xl mx-auto leading-relaxed block"
          >
            {copy.subheadingText}
          </motion.p>

          {/* Glowing Minimal Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6"
          >
            <button
              onClick={() => {
                setCurrentCustomerPage('shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-10 py-4.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-2xl shadow-emerald-600/30 active:scale-95 flex items-center justify-center space-x-2 border border-emerald-500 hover:shadow-emerald-500/50 cursor-pointer"
            >
              <span>{copy.orderNow}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleGetStartedScroll}
              className="w-full sm:w-auto px-10 py-4.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 border border-white/20 backdrop-blur-md active:scale-95 flex items-center justify-center space-x-2 hover:border-white/40 cursor-pointer"
            >
              <span>{copy.exploreMore}</span>
            </button>
          </motion.div>

        </div>

        {/* Cinematic Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center space-y-2 pointer-events-none opacity-60">
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut" }}
            className="w-5 h-8 rounded-full border border-white/30 flex items-start justify-center p-1"
          >
            <div className="w-1 h-2 bg-emerald-400 rounded-full" />
          </motion.div>
        </div>

      </section>

      {/* 3️⃣ NEXT-GEN INTELLIGENT FEATURES (Smart Workflow Section) */}
      <section id="bento-features" className="py-24 md:py-32 border-y border-slate-200/50 dark:border-white/5 relative bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
        
        {/* Soft floating blur gradients orbs */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[20%] left-[-10%] w-[450px] h-[450px] rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-[130px] animate-float-slow" />
          <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-lime-500/5 dark:bg-lime-500/10 blur-[120px] animate-float-fast" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-20 md:mb-28">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex px-3 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4 font-poppins"
            >
              {copy.workflowTag}
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight font-poppins"
            >
              {language === "ta" ? (
                <>
                  <span className="bg-gradient-to-r from-emerald-600 via-lime-500 to-emerald-500 bg-clip-text text-transparent">லோகேஷ் விவசாயி</span> எவ்வாறு செயல்படுகிறது
                </>
              ) : (
                <>
                  How <span className="bg-gradient-to-r from-emerald-600 via-lime-500 to-emerald-500 bg-clip-text text-transparent">Logesh Vivasayi</span> Works
                </>
              )}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-semibold mt-3 max-w-xl mx-auto"
            >
              {copy.workflowSubheading}
            </motion.p>
          </div>

          {/* Workflow Cards Grid */}
          <div className="relative">
            
            {/* Desktop Connecting Line between cards */}
            <div className="absolute top-[40%] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-emerald-500/20 via-lime-500/40 to-emerald-500/20 -translate-y-1/2 hidden lg:block z-0 overflow-hidden">
              {/* Laser scanning dot walking the line */}
              <motion.div 
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
                className="w-1/3 h-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative z-10">
              {workflowSteps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.15 }}
                  className="relative group"
                >
                  {/* Step Card Container */}
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`w-full h-full rounded-[2rem] ${step.cardBg} backdrop-blur-xl border p-6 md:p-7.5 flex flex-col justify-start items-start text-left shadow-lg shadow-slate-100/10 dark:shadow-black/15 relative overflow-hidden transition-all duration-300 min-h-[220px] lg:min-h-[250px] ${step.cardBorder}`}
                  >
                    
                    {/* Glowing card base hover background leak */}
                    <div className={`absolute -inset-px bg-gradient-to-br opacity-0 group-hover:opacity-100 rounded-[2rem] transition-opacity duration-500 pointer-events-none -z-10 ${step.bgClass}`} />

                    {/* Step badge bubble */}
                    <div className={`absolute top-6 right-6 flex items-center justify-center w-8 h-8 rounded-full text-xs font-black font-poppins border ${step.badgeBg}`}>
                      {idx + 1}
                    </div>

                    {/* Glowing Accent Border Border Top */}
                    <div className={`absolute top-0 left-12 right-12 h-[2px] bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                      step.accentColor === 'emerald' ? 'from-transparent via-emerald-400 to-transparent' :
                      step.accentColor === 'amber' ? 'from-transparent via-amber-400 to-transparent' :
                      step.accentColor === 'teal' ? 'from-transparent via-teal-400 to-transparent' :
                      'from-transparent via-lime-400 to-transparent'
                    }`} />

                    {/* Icon container */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 shadow-md group-hover:scale-110 mb-5 ${step.iconBg} ${step.iconActiveBg}`}>
                      <step.icon className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <div className="space-y-2 mt-2">
                      <h3 className={`text-lg font-black text-slate-950 dark:text-white tracking-tight font-poppins transition-colors ${step.textClass}`}>
                        {step.title}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-semibold leading-relaxed">
                        {step.desc}
                      </p>
                    </div>

                  </motion.div>

                  {/* Glowing connector arrows for Desktop (idx < 3) */}
                  {idx < 3 && (
                    <div className="absolute top-[40%] -right-4 -translate-y-1/2 z-30 hidden lg:flex items-center justify-center pointer-events-none">
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/10 flex items-center justify-center shadow-lg text-emerald-500 dark:text-emerald-400"
                      >
                        <ArrowRight className="w-4 h-4 font-black" />
                      </motion.div>
                    </div>
                  )}

                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 3.5️⃣ PREMIUM PARALLAX SHOWCASE SECTION */}
      <section className="relative min-h-[480px] lg:min-h-[550px] flex items-center justify-center overflow-hidden py-24 md:py-28 bg-emerald-950 text-white">
        
        {/* Parallax Fixed Background - Extremely visible green farmland */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 pointer-events-none opacity-70 md:opacity-85"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1920&auto=format&fit=crop')",
            backgroundAttachment: "fixed",
          }}
        />

        {/* Cinematic horizontal fade overlay - replaced black/slate with rich green/emerald blend */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/98 via-emerald-950/85 to-emerald-950/30 md:to-transparent z-1" />

        {/* Ambient Blur Lighting Effects */}
        <div className="absolute inset-0 pointer-events-none z-2 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-emerald-500/20 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-lime-500/15 blur-[100px] pointer-events-none" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT SIDE: Heading and Subheading (8 columns) */}
            <div className="lg:col-span-8 text-left space-y-4">
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="space-y-4"
              >
                <div className="inline-flex px-3 py-1 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                  {language === "ta" ? "பண்ணையிலிருந்து நேரடியாக" : "Fresh From Farm"}
                </div>
                
                <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tighter leading-tight font-poppins max-w-3xl">
                  {language === "ta" ? (
                    <>
                      நேரடியாக எமது <span className="bg-gradient-to-r from-emerald-400 via-lime-400 to-emerald-300 bg-clip-text text-transparent">நம்பிக்கையான விவசாயிகளிடமிருந்து</span> புதிய சுகாதாரமான பொருட்கள்
                    </>
                  ) : (
                    <>
                      Healthy Products Directly From <span className="bg-gradient-to-r from-emerald-400 via-lime-400 to-emerald-300 bg-clip-text text-transparent">Trusted Farmers</span>
                    </>
                  )}
                </h2>

                <p className="text-slate-200 text-sm sm:text-base font-semibold leading-relaxed max-w-2xl">
                  {language === "ta" ? (
                    "எங்கள் அதிநவீன டிஜிட்டல் ஆர்டர் அமைப்புகள் மற்றும் அதிவேக விநியோக தீர்வுகள் மூலம் விவசாயிகளின் புதிய அறுவடையை உங்களின் இல்லங்களுக்கு நேரடியாகப் பெற்றிடுங்கள்."
                  ) : (
                    "Experience fresh agriculture products with modern digital ordering and fast delivery solutions."
                  )}
                </p>
              </motion.div>

            </div>

            {/* RIGHT SIDE: Action Buttons (4 columns) */}
            <div className="lg:col-span-4 flex items-center justify-start lg:justify-end">
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="flex flex-col sm:flex-row lg:flex-col gap-4 w-full sm:w-auto lg:w-full max-w-xs"
              >
                <button 
                  onClick={() => {
                    const el = document.getElementById('marketplace-preview');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group w-full sm:w-52 lg:w-full px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-lime-500 text-slate-950 hover:text-slate-950 dark:text-slate-950 font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center space-x-2.5"
                >
                  <span>{language === "ta" ? "இப்போதே வாங்குங்கள்" : "Buy Now"}</span>
                  <ShoppingBag className="w-4 h-4 group-hover:scale-115 transition-transform duration-300" />
                </button>
                <button 
                  onClick={() => {
                    const el = document.getElementById('marketplace-preview');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group w-full sm:w-52 lg:w-full px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest transition-all duration-300 border border-white/10 hover:border-white/25 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center space-x-2.5"
                >
                  <span>{language === "ta" ? "தயாரிப்புகளைக் காண்க" : "Explore Products"}</span>
                  <Leaf className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                </button>
              </motion.div>

            </div>

          </div>
        </div>

      </section>

      {/* 4️⃣ TOP PRODUCTS MARKETPLACE SECTION */}
      <section id="marketplace-preview" className="py-12 md:py-16 relative bg-white transition-colors duration-500 overflow-hidden border-y border-slate-100">
        
        {/* Soft green gradient blur orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/[0.03] rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-lime-500/[0.02] rounded-full blur-[130px] animate-pulse" style={{ animationDuration: '6s' }} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Centered Header */}
          <div className="text-center max-w-3xl mx-auto mb-10 px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex px-3 py-1 rounded bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-[0.35em] mb-3 font-poppins mx-auto"
            >
              {language === "ta" ? "சிறந்த தயாரிப்புகள்" : "FEATURED SHOWCASE"}
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-5xl font-black text-slate-900 tracking-[0.1em] uppercase leading-tight font-poppins"
            >
              {language === "ta" ? (
                <>
                  சிறப்பு <span className="bg-gradient-to-r from-emerald-600 via-lime-500 to-emerald-500 bg-clip-text text-transparent">தயாரிப்புகள்</span>
                </>
              ) : (
                <>
                  FEATURED <span className="bg-gradient-to-r from-emerald-600 via-lime-500 to-emerald-500 bg-clip-text text-transparent">PRODUCTS</span>
                </>
              )}
            </motion.h2>
            <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent mx-auto mt-4" />
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 text-[10px] sm:text-xs font-semibold tracking-wider leading-relaxed mt-3 max-w-2xl mx-auto uppercase"
            >
              {language === "ta" ? "லோகேஷ் விவசாயி தளத்தின் புதிய தூய்மையான தயாரிப்புகள்" : "Curated high-yield organic crops harvested at peak freshness"}
            </motion.p>
          </div>

          {/* Dynamic Interactive Products Horizontal Slider */}
          {loadingProducts ? (
            <div className="h-52 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            </div>
          ) : (
            <div className="relative w-full px-4 md:px-12 z-10">
              
              {/* Left Arrow Button */}
              <button 
                onClick={scrollLeft}
                className="absolute left-1 top-1/2 -translate-y-1/2 z-30 w-9 h-9 md:w-11 md:h-11 rounded-full bg-white hover:bg-emerald-600 text-slate-950 hover:text-white flex items-center justify-center border border-slate-200 shadow-2xl transition-all duration-300 active:scale-90 hover:scale-110 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 stroke-[2.5]" />
              </button>

              {/* Slider Container */}
              <div 
                ref={sliderRef}
                className="flex overflow-x-auto gap-8 py-4 px-4 scroll-smooth snap-x snap-mandatory scrollbar-none"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((p, index) => {
                    const isFav = favorites.includes(p.id);
                    const isAdded = cart.some(item => item.id === p.id);
                    
                    const cardThemes = [
                      {
                        bg: "bg-gradient-to-br from-emerald-100 via-emerald-100/90 to-emerald-200/70",
                        border: "border-emerald-300/80 hover:border-emerald-500/50",
                        hoverShadow: "hover:shadow-[0_20px_40px_rgba(16,185,129,0.09)]",
                        glow: "from-emerald-500/0 to-emerald-500/10"
                      },
                      {
                        bg: "bg-gradient-to-br from-amber-100 via-amber-100/90 to-amber-200/70",
                        border: "border-amber-300/80 hover:border-amber-500/50",
                        hoverShadow: "hover:shadow-[0_20px_40px_rgba(245,158,11,0.09)]",
                        glow: "from-amber-500/0 to-amber-500/10"
                      },
                      {
                        bg: "bg-gradient-to-br from-lime-100 via-lime-100/90 to-lime-200/70",
                        border: "border-lime-300/80 hover:border-lime-500/50",
                        hoverShadow: "hover:shadow-[0_20px_40px_rgba(132,204,22,0.09)]",
                        glow: "from-lime-500/0 to-lime-500/10"
                      },
                      {
                        bg: "bg-gradient-to-br from-sky-100 via-sky-100/90 to-sky-200/70",
                        border: "border-sky-300/80 hover:border-sky-500/50",
                        hoverShadow: "hover:shadow-[0_20px_40px_rgba(14,165,233,0.09)]",
                        glow: "from-sky-500/0 to-sky-500/10"
                      },
                      {
                        bg: "bg-gradient-to-br from-rose-100 via-rose-100/90 to-rose-200/70",
                        border: "border-rose-300/80 hover:border-rose-500/50",
                        hoverShadow: "hover:shadow-[0_20px_40px_rgba(244,63,94,0.09)]",
                        glow: "from-rose-500/0 to-rose-500/10"
                      }
                    ];
                    const theme = cardThemes[index % cardThemes.length];

                    return (
                      <motion.div
                        key={p.id}
                        layout
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                        whileHover={{ y: -6 }}
                        onClick={() => handleAddToCart(p)}
                        className={cn(
                          "relative cursor-pointer flex flex-col items-center p-5 rounded-2xl text-slate-900 border shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-all duration-500 overflow-hidden w-[240px] md:w-[260px] h-[340px] shrink-0 group select-none snap-start text-center",
                          theme.bg,
                          theme.border,
                          theme.hoverShadow
                        )}
                      >
                        {/* Ambient Card Glow */}
                        <div className={cn("absolute -inset-px bg-gradient-to-tr opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500 pointer-events-none -z-10", theme.glow)} />

                        {/* Top corner Favorite Icon */}
                        <div className="absolute top-4 right-4 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(p.id);
                            }}
                            className="w-7 h-7 rounded-full bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-colors cursor-pointer border border-slate-200/60 shadow-sm"
                          >
                            <Heart className={cn("w-3 h-3 transition-all duration-300", isFav ? "fill-rose-500 text-rose-500 scale-110" : "")} />
                          </button>
                        </div>

                        {/* Compact image container with smooth hover zoom and transparent background */}
                        <div className="w-full h-36 flex items-center justify-center relative overflow-hidden mb-2 bg-transparent">
                          <img 
                            src={p.imageUrl || "https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=800&auto=format&fit=crop"} 
                            alt={p.name} 
                            className="h-32 w-32 object-contain group-hover:scale-110 transition-transform duration-700 ease-out mix-blend-multiply" 
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Center Aligned Product Content */}
                        <div className="flex flex-col items-center text-center space-y-1.5 w-full mt-auto">
                          
                          {/* Name */}
                          <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-tight uppercase font-poppins line-clamp-1">
                            {p.name}
                          </h3>
                          
                          {/* Description */}
                          <p className="text-[10px] text-slate-500 font-semibold line-clamp-2 leading-relaxed h-7">
                            {p.description || (language === "ta" ? "உயர்தர புதிய இயற்கை தயாரிப்பு." : "Fresh and premium quality, tested for organic standards.")}
                          </p>
                          
                          {/* Price */}
                          <div className="pt-2 flex items-baseline justify-center space-x-1 border-t border-slate-100 w-full mt-1">
                            <span className="text-base font-black text-emerald-600">₹{p.price}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">/ {p.unit || '1kg'}</span>
                          </div>

                          {/* Added micro-notification bubble inside card to give perfect visual feedback */}
                          {isAdded && (
                            <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-0.5 rounded-full flex items-center space-x-1 mt-1 animate-fade-in uppercase tracking-wider">
                              <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                              <span>ADDED TO CART</span>
                            </span>
                          )}

                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Right Arrow Button */}
              <button 
                onClick={scrollRight}
                className="absolute right-1 top-1/2 -translate-y-1/2 z-30 w-9 h-9 md:w-11 md:h-11 rounded-full bg-white hover:bg-emerald-600 text-slate-950 hover:text-white flex items-center justify-center border border-slate-200 shadow-2xl transition-all duration-300 active:scale-90 hover:scale-110 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 stroke-[2.5]" />
              </button>

            </div>
          )}

          {/* Centered GO TO SHOP button below products */}
          <div className="flex justify-center mt-10 relative z-10">
            <button
              onClick={() => {
                setCurrentCustomerPage('shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-8 py-3 bg-slate-950 hover:bg-emerald-600 text-white rounded-full font-black text-xs uppercase tracking-[0.25em] transition-all duration-300 border border-transparent active:scale-95 cursor-pointer shadow-lg shadow-slate-950/15 flex items-center space-x-2 group"
            >
              <span>{language === "ta" ? "கடைக்குச் செல்லவும்" : "GO TO SHOP"}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </section>

      {/* 5️⃣ PREMIUM LIFESTYLE & BRAND STORY SHOWCASE SECTION */}
      <section id="brand-story" className="py-24 md:py-32 bg-emerald-100/45 dark:bg-emerald-900/20 border-y border-emerald-500/20 dark:border-emerald-500/10 relative overflow-hidden transition-all duration-500">
        
        {/* Soft Ambient Sparkle */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] right-[-5%] w-[550px] h-[550px] bg-emerald-500/18 dark:bg-emerald-500/22 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] left-[-5%] w-[550px] h-[550px] bg-lime-500/14 dark:bg-lime-500/16 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header Description */}
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex px-3 py-1 rounded bg-emerald-500/20 dark:bg-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase tracking-widest mb-4 font-poppins border border-emerald-500/30"
            >
              {language === "ta" ? "நமது பாரம்பரியம்" : "OUR HERITAGE"}
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight font-poppins"
            >
              {language === "ta" ? (
                <>
                  பசுமை <span className="bg-gradient-to-r from-emerald-600 via-lime-500 to-emerald-500 bg-clip-text text-transparent">வாழ்வியல்</span> கதை
                </>
              ) : (
                <>
                  THE STORY OF <span className="bg-gradient-to-r from-emerald-600 via-lime-500 to-emerald-500 bg-clip-text text-transparent">VIVASAYI</span>
                </>
              )}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-emerald-800/80 dark:text-emerald-400/80 text-xs sm:text-sm font-semibold tracking-wide mt-3 max-w-xl mx-auto uppercase"
            >
              {language === "ta" ? "விவசாயிகளின் உன்னத உழைப்பை நவீன உலகிற்கு அறிமுகப்படுத்துகிறோம்" : "Bringing the soul of pure agriculture to the next generation"}
            </motion.p>
          </div>

          {/* Asymmetrical 2-Column Story Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT SIDE: One Large Vertical Image Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5"
            >
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 200, damping: 22 }}
                onClick={() => {
                  setCurrentCustomerPage('shop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group relative w-full h-[500px] lg:h-[680px] rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/60 cursor-pointer select-none border border-slate-200/50 flex flex-col justify-end p-8 md:p-12 transition-all duration-500"
              >
                {/* Image Background */}
                <img 
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop" 
                  alt="Fresh Organic Products" 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out -z-20"
                />

                {/* Dark Cinematic Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10 group-hover:via-black/55 transition-colors duration-700 pointer-events-none -z-10" />

                {/* Left Aligned Content */}
                <div className="space-y-2 md:space-y-3 transform group-hover:translate-y-[-4px] transition-transform duration-500">
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight font-poppins">
                    {language === "ta" ? "புதிய இயற்கை தயாரிப்புகள்" : "Fresh Organic Products"}
                  </h3>
                  <p className="text-slate-200 text-xs sm:text-sm font-semibold max-w-sm leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                    {language === "ta" ? "நம்பகமான விவசாயிகளிடமிருந்து நேரடியாகப் பெறப்பட்டது." : "Directly sourced from trusted farmers."}
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* RIGHT SIDE: Two Stacked Horizontal Image Cards */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              
              {/* TOP RIGHT CARD */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 200, damping: 22 }}
                  onClick={() => {
                    setCurrentCustomerPage('contact');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group relative w-full h-[240px] lg:h-[324px] rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/60 cursor-pointer select-none border border-slate-200/50 flex flex-col justify-end p-8 md:p-12 transition-all duration-500"
                >
                  {/* Image Background */}
                  <img 
                    src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1000&auto=format&fit=crop" 
                    alt="Join Our Farming Community" 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out -z-20"
                  />

                  {/* Dark Cinematic Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10 group-hover:via-black/55 transition-colors duration-700 pointer-events-none -z-10" />

                  {/* Left Aligned Content */}
                  <div className="space-y-1.5 transform group-hover:translate-y-[-4px] transition-transform duration-500">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight font-poppins">
                      {language === "ta" ? "விவசாய சமூகத்தில் இணையுங்கள்" : "Join Our Farming Community"}
                    </h3>
                    <p className="text-slate-200 text-xs sm:text-sm font-semibold max-w-md leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                      {language === "ta" ? "நவீன விவசாய தீர்வுகளுடன் இணையுங்கள்." : "Connect with modern agriculture solutions."}
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              {/* BOTTOM RIGHT CARD */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 200, damping: 22 }}
                  onClick={() => {
                    setCurrentCustomerPage('shop');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group relative w-full h-[240px] lg:h-[324px] rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/60 cursor-pointer select-none border border-slate-200/50 flex flex-col justify-end p-8 md:p-12 transition-all duration-500"
                >
                  {/* Image Background */}
                  <img 
                    src="https://images.unsplash.com/photo-1500937386664-56d159437b7f?q=80&w=1000&auto=format&fit=crop" 
                    alt="Sustainable Agriculture" 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out -z-20"
                  />

                  {/* Dark Cinematic Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10 group-hover:via-black/55 transition-colors duration-700 pointer-events-none -z-10" />

                  {/* Left Aligned Content */}
                  <div className="space-y-1.5 transform group-hover:translate-y-[-4px] transition-transform duration-500">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight font-poppins">
                      {language === "ta" ? "நிலையான விவசாயம்" : "Sustainable Agriculture"}
                    </h3>
                    <p className="text-slate-200 text-xs sm:text-sm font-semibold max-w-md leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                      {language === "ta" ? "பசுமையான மற்றும் ஆரோக்கியமான எதிர்காலத்தை உருவாக்குவோம்." : "Building a greener and healthier future."}
                    </p>
                  </div>
                </motion.div>
              </motion.div>

            </div>

          </div>

        </div>
      </section>

    </div>
  );
}

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { collection, onSnapshot, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../utils/translations';
import { HeroSection } from '../../components/customer/home/HeroSection';

const WorkflowSection = React.lazy(() => import('../../components/customer/home/WorkflowSection').then(m => ({ default: m.WorkflowSection })));
const ParallaxShowcase = React.lazy(() => import('../../components/customer/home/ParallaxShowcase').then(m => ({ default: m.ParallaxShowcase })));
const FeaturedProducts = React.lazy(() => import('../../components/customer/home/FeaturedProducts').then(m => ({ default: m.FeaturedProducts })));
const HeritageSection = React.lazy(() => import('../../components/customer/home/HeritageSection').then(m => ({ default: m.HeritageSection })));
import { FirebaseProduct } from '../../components/customer/home/ProductCard';

export function CustomerHome() {
  const { setCurrentCustomerPage, language, addToCart, cart } = useStore();
  const t = useTranslation(language);
  const containerRef = useRef<HTMLDivElement>(null);

  // Live Firebase Products
  const [products, setProducts] = useState<FirebaseProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Wishlist state
  const [favorites, setFavorites] = useState<string[]>([]);
  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  // Site Images from Firebase
  const [siteImages, setSiteImages] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const fetchSiteImages = async () => {
      try {
        const docRef = doc(db, 'siteSettings', 'frontendImages');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSiteImages(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching site images:", error);
      }
    };
    fetchSiteImages();
  }, []);

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
    let timeoutId: NodeJS.Timeout;
    let isResolved = false;

    try {
      const q = query(collection(db, 'products'), orderBy('name', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        isResolved = true;
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
        isResolved = true;
        console.error("Firestore loading error, falling back to mocks:", error);
        setProducts(mockProducts);
        setLoadingProducts(false);
      });

      // Timeout fallback for when Firebase silently hangs (e.g. offline or pending auth)
      timeoutId = setTimeout(() => {
        if (!isResolved) {
          console.warn("Firestore taking too long, falling back to mock products.");
          setProducts(mockProducts);
          setLoadingProducts(false);
        }
      }, 4000);

      return () => {
        unsubscribe();
        clearTimeout(timeoutId);
      };
    } catch (e) {
      console.warn("Failed to load Firebase, displaying premium fallback products:", e);
      setProducts(mockProducts);
      setLoadingProducts(false);
    }
  }, [language]);

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
  };

  // Scroll logic for "Get Started" smooth anchor scroll
  const handleGetStartedScroll = () => {
    const featureSection = document.getElementById('bento-features');
    if (featureSection) {
      featureSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden relative">
      
      {/* Background Decorative Blur Orbs */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 blur-[120px] animate-float-slow" />
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full bg-lime-400/10 dark:bg-lime-400/15 blur-[150px] animate-float-fast" />
        <div className="absolute bottom-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-emerald-400/5 dark:bg-emerald-500/10 blur-[130px] animate-float-slow" />
        <div className="absolute inset-0 bg-cyber-grid opacity-60 dark:opacity-40" />
      </div>

      {/* Hero Slide Section */}
      <HeroSection 
        copy={copy} 
        setCurrentCustomerPage={setCurrentCustomerPage} 
        handleGetStartedScroll={handleGetStartedScroll} 
        siteImages={siteImages}
      />

      {/* Below The Fold Sections with Lazy Loading */}
      {/* Farm-to-Table Workflow Section */}
      <React.Suspense fallback={<div className="h-[200px] flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>}>
        <WorkflowSection language={language} copy={copy} />
      </React.Suspense>

      {/* Featured Premium Products Carousel */}
      <React.Suspense fallback={<div className="h-[400px] flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>}>
        <FeaturedProducts 
          products={products}
          loadingProducts={loadingProducts}
          language={language}
          favorites={favorites}
          cart={cart}
          toggleFavorite={toggleFavorite}
          handleAddToCart={handleAddToCart}
          setCurrentCustomerPage={setCurrentCustomerPage}
        />
      </React.Suspense>
      
      <React.Suspense fallback={<div className="h-[300px] flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>}>
        <ParallaxShowcase 
          language={language}
          copy={copy}
          siteImages={siteImages}
        />
      </React.Suspense>
      
      {/* Brand Heritage & Core Values */}
      <React.Suspense fallback={<div className="h-[400px] flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>}>
        <HeritageSection 
          language={language} 
          copy={copy}
          siteImages={siteImages}
          setCurrentCustomerPage={setCurrentCustomerPage} 
        />
      </React.Suspense>

    </div>
  );
}

export type Lang = "ne" | "en";

export const dictionary = {
  appName: { ne: "कृषिSearch", en: "Krisearch" },
  tagline: {
    ne: "किसानले किसानका लागि बनाएको खेती समुदाय",
    en: "The farming community built by farmers, for farmers",
  },

  // nav
  navHome: { ne: "गृहपृष्ठ", en: "Home" },
  navFeed: { ne: "फिड", en: "Feed" },
  navCrops: { ne: "बाली", en: "Crops" },
  navTools: { ne: "औजार", en: "Tools" },
  navSchemes: { ne: "योजना", en: "Schemes" },
  navPrices: { ne: "मूल्य", en: "Prices" },
  navVendors: { ne: "विक्रेता", en: "Vendors" },
  navProfile: { ne: "प्रोफाइल", en: "Profile" },
  navLogin: { ne: "लगइन", en: "Log in" },
  navAdmin: { ne: "एडमिन", en: "Admin" },

  // landing
  heroTitle: { ne: "तपाईंको खेतीको जानकारी, समुदायबाट", en: "Real farming knowledge, from your community" },
  heroBody: {
    ne: "बाली रोग, मल, स्थानीय मूल्य र आधुनिक औजारबारे साँच्चै काम गर्ने कुरा साथी किसानहरूबाट सिक्नुहोस्।",
    en: "Learn what actually works — crop issues, fertilizer tips, local prices, and modern tools — from fellow farmers across Nepal.",
  },
  ctaJoin: { ne: "समुदायमा सामेल हुनुहोस्", en: "Join the community" },
  ctaBrowse: { ne: "फिड हेर्नुहोस्", en: "Browse the feed" },
  recentActivity: { ne: "भर्खरका पोस्टहरू", en: "Recent community activity" },
  howItWorks: { ne: "यो कसरी काम गर्छ", en: "How it works" },
  factsLayerExplain: {
    ne: "स्थिर जानकारी (क्षेत्र, बाली, सरकारी योजना) माथि — प्रमाणित र मिति सहित।",
    en: "Stable reference facts (zones, crops, government schemes) on top — verified and dated.",
  },
  communityLayerExplain: {
    ne: "साँचो अनुभव तल — किसानहरूले वास्तवमा के काम गर्छ भनेर साझा गर्छन्।",
    en: "Real experience below — farmers share what actually works for them.",
  },

  // feed / posts
  filterCrop: { ne: "बाली छान्नुहोस्", en: "Filter by crop" },
  filterDistrict: { ne: "जिल्ला छान्नुहोस्", en: "Filter by district" },
  filterType: { ne: "प्रकार छान्नुहोस्", en: "Filter by type" },
  sortNew: { ne: "नयाँ", en: "New" },
  sortTop: { ne: "उत्कृष्ट", en: "Top" },
  newPost: { ne: "नयाँ पोस्ट", en: "New post" },
  noPostsYet: { ne: "अहिलेसम्म कुनै पोस्ट छैन। पहिलो हुनुहोस्!", en: "No posts yet. Be the first!" },
  comments: { ne: "टिप्पणी", en: "comments" },
  postTypeQuestion: { ne: "प्रश्न", en: "Question" },
  postTypeDisease: { ne: "रोग/किरा", en: "Pest/Disease" },
  postTypeFertilizer: { ne: "मल सुझाव", en: "Fertilizer tip" },
  postTypeMarket: { ne: "बजार मूल्य", en: "Market price" },
  postTypeSuccess: { ne: "सफलता कथा", en: "Success story" },
  postTypeGeneral: { ne: "सामान्य छलफल", en: "General discussion" },
  postTypeEquipment: { ne: "औजार समीक्षा", en: "Equipment review" },

  // crops
  generalGuidance: { ne: "सामान्य जानकारी (सन्दर्भ मात्र)", en: "General guidance (reference only)" },
  communityFeedFor: { ne: "समुदाय फिड", en: "Community feed" },

  // schemes
  lastVerified: { ne: "अन्तिम पुष्टि", en: "Last verified" },
  howToApply: { ne: "कसरी आवेदन दिने", en: "How to apply" },
  eligibility: { ne: "योग्यता", en: "Eligibility" },

  // tools
  purchasePrice: { ne: "खरिद मूल्य", en: "Purchase price" },
  rentalPrice: { ne: "भाडा/सेवा मूल्य", en: "Rental / service price" },
  availability: { ne: "उपलब्धता", en: "Availability" },
  availableInNepal: { ne: "नेपालमा उपलब्ध", en: "Available in Nepal" },
  importOnly: { ne: "आयात मात्र", en: "Import only" },
  pilotStage: { ne: "प्रयोगात्मक चरण", en: "Pilot stage" },
  serviceOnly: { ne: "सेवा मात्र (भाडामा)", en: "Service only (rental)" },
  relatedScheme: { ne: "सम्बन्धित सरकारी योजना", en: "Related government scheme" },
  vendorsForThis: { ne: "यो औजार दिने विक्रेता", en: "Vendors for this tool" },

  // prices
  pricesTitle: { ne: "बजार मूल्य", en: "Market prices" },

  // vendors
  vendorsTitle: { ne: "विक्रेता निर्देशिका", en: "Vendor directory" },
  contactInfo: { ne: "सम्पर्क", en: "Contact" },
  rating: { ne: "मूल्याङ्कन", en: "Rating" },

  // auth
  phoneNumber: { ne: "फोन नम्बर", en: "Phone number" },
  emailAddress: { ne: "इमेल ठेगाना", en: "Email address" },
  sendCode: { ne: "कोड पठाउनुहोस्", en: "Send code" },
  verifyCode: { ne: "कोड प्रमाणित गर्नुहोस्", en: "Verify code" },
  enterCode: { ne: "प्राप्त ६ अंकको कोड लेख्नुहोस्", en: "Enter the 6-digit code you received" },

  // misc
  loading: { ne: "लोड हुँदैछ...", en: "Loading..." },
  notConfiguredTitle: { ne: "Supabase जडान भएको छैन", en: "Supabase isn't connected yet" },
  notConfiguredBody: {
    ne: ".env.local मा साँचो Supabase प्रोजेक्टको जानकारी हाल्नुहोस्।",
    en: "Add your real Supabase project credentials to .env.local to see live data.",
  },
  report: { ne: "रिपोर्ट गर्नुहोस्", en: "Report" },
} as const;

export type DictionaryKey = keyof typeof dictionary;

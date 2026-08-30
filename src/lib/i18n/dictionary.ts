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
  generalGuidanceLong: {
    ne: "सामान्य जानकारी — सन्दर्भका लागि मात्र, तलको समुदायको अनुभवको विकल्प होइन",
    en: "General guidance — reference only, not a substitute for the community below",
  },
  communityFeedFor: { ne: "समुदाय फिड", en: "Community feed" },
  plantLabel: { ne: "रोप्ने समय", en: "plant" },
  noCropPostsYet: { ne: "यो बालीका लागि अहिलेसम्म कुनै पोस्ट छैन", en: "No community posts for this crop yet" },
  shareAboutPrefix: { ne: "बारे लेख्नुहोस्:", en: "Share about" },

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

  // stats strip
  statPosts: { ne: "पोस्टहरू", en: "Posts" },
  statFarmers: { ne: "सदस्यहरू", en: "Members" },
  statDistricts: { ne: "जिल्लाहरू", en: "Districts active" },
  statCrops: { ne: "बालीहरू ट्र्याक", en: "Crops tracked" },

  // homepage extras
  whyTitle: { ne: "किन कृषिSearch?", en: "Why Krisearch?" },
  whyPoint1Title: { ne: "साथी किसानको अनुभव", en: "Real farmer experience" },
  whyPoint1Body: {
    ne: "पाठ्यपुस्तकको सल्लाह होइन — तपाईं जस्तै किसानले वास्तवमा के गरे भन्ने कुरा।",
    en: "Not textbook advice — what farmers like you actually did, and what happened.",
  },
  whyPoint2Title: { ne: "इमानदार जानकारी", en: "Honest information" },
  whyPoint2Body: {
    ne: "हरेक मूल्य, योजना, र औजारमा मिति र स्रोत देखिन्छ — लुकाइएको छैन।",
    en: "Every price, scheme, and tool shows its date and source — nothing dressed up as more certain than it is.",
  },
  whyPoint3Title: { ne: "जोसुकैलाई पहुँचयोग्य", en: "Open to everyone" },
  whyPoint3Body: {
    ne: "हेर्न लगइन चाहिँदैन। लेख्न पनि पूरा फारम भर्नु पर्दैन।",
    en: "No login to browse. No long form to post — a name is optional, even that.",
  },
  exploreTitle: { ne: "अन्वेषण गर्नुहोस्", en: "Explore" },

  // tools page
  toolsTitle: { ne: "आधुनिक औजार र प्रविधि", en: "Modern tools & technology" },
  toolsSubtitle: {
    ne: "साना, छरिएका डाँडा र तराईका जग्गाका लागि उपयुक्त प्रविधि — किन्ने र भाडामा लिने दुवै मूल्य देखाइन्छ, किनकि धेरैको जग्गा पूरै किन्नु व्यावहारिक हुँदैन।",
    en: "Scale-appropriate mechanization for small, fragmented hill and Terai plots — purchase and rental/service prices shown side by side, since ownership rarely pencils out at Nepal's average landholding size.",
  },
  scopeNepal: { ne: "🇳🇵 नेपालमा", en: "🇳🇵 In Nepal" },
  scopeGlobal: { ne: "🌍 विश्वव्यापी / उदीयमान", en: "🌍 Global / Emerging" },
  globalToolsNotice: {
    ne: "🌍 यी विश्वका अन्य ठाउँमा प्रयोग हुने प्रविधिहरू हुन्, जानकारीका लागि मात्र — धेरैजसो नेपालमा अझै पुष्टि भएका छैनन्। किन्नु अघि उपलब्धता ब्याज र स्रोत जाँच्नुहोस्।",
    en: "These are technologies used elsewhere in the world, shown for awareness — most are not yet confirmed available in Nepal. Check each item's availability badge and source before assuming it's purchasable here.",
  },
  noToolsYet: { ne: "अहिलेसम्म कुनै औजार सूचीकृत छैन", en: "No tools listed yet" },
  watchVideo: { ne: "भिडियो हेर्नुहोस्", en: "Watch video" },
  source: { ne: "स्रोत", en: "Source" },
  unverifiedEstimate: { ne: "अपुष्ट अनुमान — भर पर्नु अघि जाँच्नुहोस्", en: "Unverified estimate — check before relying on this price" },
  lastChecked: { ne: "अन्तिम जाँच", en: "Last checked" },
  shareReview: { ne: "+ अनुभव लेख्नुहोस्", en: "+ Share a review" },
  communityReviews: { ne: "समुदायको समीक्षा र अनुभव", en: "Community reviews & experiences" },
  noReviewsYet: { ne: "अहिलेसम्म कुनै समीक्षा छैन", en: "No reviews yet" },
  noVendorsYet: { ne: "यो औजारका लागि अहिलेसम्म कुनै विक्रेता छैन", en: "No vendors listed yet for this tool" },

  // schemes page
  schemesTitle: { ne: "सरकारी योजना निर्देशिका", en: "Government scheme directory" },
  schemesSubtitle: {
    ne: "बजेट चक्रसँगै अनुदान नियम फेरिन्छन् — सधैं \"अन्तिम पुष्टि\" मिति हेर्नुहोस्।",
    en: "Subsidy and program rules change with budget cycles — always check the \"last verified\" date.",
  },
  mayBeOutdated: { ne: "पुरानो हुन सक्छ", en: "may be outdated" },
  noSchemesYet: { ne: "अहिलेसम्म कुनै योजना सूचीकृत छैन", en: "No schemes listed yet" },

  // prices page
  pricesSubtitle: {
    ne: "समुदायले पेश गरेको र हातैले अद्यावधिक गरिएको मूल्य — प्रत्येक अङ्कमा स्रोत र मिति देखिन्छ।",
    en: "Community-submitted and manually refreshed prices — every figure shows its source and date.",
  },
  allCrops: { ne: "सबै बाली", en: "All crops" },
  noPricesYet: { ne: "अहिलेसम्म मूल्य जानकारी छैन", en: "No price data yet" },
  updated: { ne: "अद्यावधिक", en: "Updated" },
  vsPrevious: { ne: "अघिल्लो भन्दा", en: "vs previous" },

  // vendors page
  allVendorTypes: { ne: "सबै प्रकारका विक्रेता", en: "All vendor types" },
  noVendorsListed: { ne: "अहिलेसम्म कुनै विक्रेता सूचीकृत छैन", en: "No vendors listed yet" },

  // post form
  createPostTitle: { ne: "समुदायसँग साझा गर्नुहोस्", en: "Share with the community" },
  postTypeLabel: { ne: "पोस्टको प्रकार", en: "Post type" },
  cropLabel: { ne: "बाली", en: "Crop" },
  districtLabel: { ne: "जिल्ला", en: "District" },
  noneOption: { ne: "— कुनै छैन —", en: "— none —" },
  titleLabel: { ne: "शीर्षक", en: "Title" },
  descriptionLabel: { ne: "विवरण", en: "Description" },
  photosLabel: { ne: "फोटो (रोग/किरा रिपोर्टका लागि सहयोगी)", en: "Photos (helpful for pest/disease reports)" },
  tagsLabel: { ne: "ट्याग (अल्पविरामले छुट्याउनुहोस्)", en: "Tags (comma-separated)" },
  guestFieldsLabel: { ne: "लगइन गर्नुभएको छैन? समस्या छैन", en: "Not signed in? No problem" },
  submitPost: { ne: "समुदायमा पोस्ट गर्नुहोस्", en: "Post to community" },
  postingBusy: { ne: "पोस्ट गर्दै...", en: "Posting..." },

  // comments
  addComment: { ne: "टिप्पणी वा उत्तर लेख्नुहोस्...", en: "Add a comment or answer..." },
  send: { ne: "पठाउनुहोस्", en: "Send" },
  noCommentsYet: { ne: "अहिलेसम्म कुनै टिप्पणी छैन। पहिलो उत्तर दिनुहोस्।", en: "No comments yet. Be the first to answer." },
  bestAnswer: { ne: "उत्तम उत्तर", en: "Best answer" },
  markBestAnswer: { ne: "उत्तम उत्तरको रूपमा चिन्ह लगाउनुहोस्", en: "Mark as best answer" },
  addNameOptional: { ne: "आफ्नो नाम थप्नुहोस् (वैकल्पिक)", en: "Add your name (optional)" },
  yourNamePlaceholder: { ne: "तपाईंको नाम (वैकल्पिक)", en: "Your name (optional)" },
  phoneOrEmailPlaceholder: { ne: "फोन वा इमेल (वैकल्पिक, उत्तरका लागि)", en: "Phone or email (optional, for replies)" },

  // login
  joinTitle: { ne: "कृषिSearch मा सामेल हुनुहोस्", en: "Join Krisearch" },
  joinSubtitle: { ne: "फोन नम्बरले लगइन गर्नुहोस् — इमेल, गुगल र फेसबुक पनि प्रयोग गर्न सकिन्छ।", en: "Sign in with your phone number — email and Google/Facebook work too." },
  continueGoogle: { ne: "गुगलबाट जारी राख्नुहोस्", en: "Continue with Google" },
  continueFacebook: { ne: "फेसबुकबाट जारी राख्नुहोस्", en: "Continue with Facebook" },
  or: { ne: "वा", en: "or" },

  // feedback widget
  feedbackButton: { ne: "प्रतिक्रिया", en: "Feedback" },
  feedbackTitle: { ne: "प्रश्न, समस्या, वा सुझाव?", en: "Question, problem, or idea?" },
  feedbackSubtitle: { ne: "खाता चाहिँदैन — बस भन्नुहोस्।", en: "No account needed — just tell us." },
  feedbackPlaceholder: { ne: "मनमा के छ?", en: "What's on your mind?" },
  feedbackNamePlaceholder: { ne: "नाम (वैकल्पिक)", en: "Name (optional)" },
  feedbackContactPlaceholder: { ne: "फोन/इमेल (वैकल्पिक)", en: "Phone/email (optional)" },
  feedbackSend: { ne: "पठाउनुहोस्", en: "Send" },
  feedbackSending: { ne: "पठाउँदै...", en: "Sending..." },
  feedbackCancel: { ne: "रद्द गर्नुहोस्", en: "Cancel" },
  feedbackThanks: { ne: "धन्यवाद! हामी हरेक सन्देश पढ्छौं।", en: "Thank you! We read every message." },
  feedbackClose: { ne: "बन्द गर्नुहोस्", en: "Close" },

  // AI verdict
  aiSafe: { ne: "AI: सुरक्षित देखिन्छ", en: "AI: looks safe" },
  aiCaution: { ne: "AI: सावधानी अपनाउनुहोस्", en: "AI: use caution" },
  aiDanger: { ne: "AI: हानिकारक हुन सक्छ", en: "AI: possibly harmful" },
  aiUnverified: { ne: "AI: अपुष्ट", en: "AI: unverified" },
} as const;

export type DictionaryKey = keyof typeof dictionary;

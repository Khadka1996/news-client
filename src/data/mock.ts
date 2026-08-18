import { Article, Category } from "@/lib/types";

export const mockCategories: Category[] = [
  { id: "cat_share", slug: "sheyar-bajar", name: "सेयर बजार", color: "#0ea5e9", order: 1 },
  { id: "cat_bank", slug: "banking-bima", name: "बैंक/बीमा", color: "#2563eb", order: 2 },
  { id: "cat_udyam", slug: "udyamsheelta", name: "उद्यमशीलता", color: "#16a34a", order: 3 },
  { id: "cat_realestate", slug: "real-estate", name: "रियल स्टेट", color: "#9333ea", order: 4 },
  { id: "cat_gold", slug: "sun-chandi-forex", name: "सुनचाँदी/फरेक्स", color: "#d97706", order: 5 },
  { id: "cat_arthatantra", slug: "arthatantra", name: "अर्थतन्त्र", color: "#dc2626", order: 6 },
];

const byId = (id: string) => mockCategories.find((c) => c.id === id) || null;

export const mockNews: Article[] = [
  {
    id: "news_1",
    slug: "budget-bhasan-pratyaksha-udyog-startup-chhut",
    title:
      "बजेट भाषण प्रत्यक्ष: उद्योग र स्टार्टअपलाई करमा विशेष छुट, सेयर बजारमा उत्साहजनक प्रतिक्रिया",
    excerpt:
      "आगामी आर्थिक वर्षको बजेटमा साना तथा मझौला उद्योग र स्टार्टअपहरूका लागि आयकरमा विशेष सहुलियत दिने प्रस्ताव सार्वजनिक भएपछि सेयर बजारमा सकारात्मक प्रतिक्रिया देखिएको छ।",
    content:
      "आगामी आर्थिक वर्ष २०८३/८४ को बजेट वक्तव्यमा सरकारले उद्योग र स्टार्टअपलाई प्रवर्द्धन गर्न विशेष कर छुटको प्रस्ताव गरेको छ। अर्थमन्त्रीले संसदमा प्रस्तुत गरेको बजेटमा नयाँ स्टार्टअपहरूलाई पहिलो पाँच वर्षसम्म आयकरमा ५० प्रतिशतसम्म छुट दिने व्यवस्था गरिएको छ।",
    categoryId: "cat_arthatantra",
    category: byId("cat_arthatantra"),
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1200&auto=format&fit=crop",
    author: "आर्थिक ब्युरो",
    status: "published",
    breaking: true,
    featured: true,
    publishedAt: "2026-08-18T05:30:00.000Z",
    views: 4210,
  },
  {
    id: "news_2",
    slug: "nepse-50-ank-badhyo",
    title: "आज नेप्से परिसूचक ५० अंकले बढ्दै गौरवमय स्थानमा, कारोबार रकम ४ अर्ब नाघ्यो",
    excerpt: "काठमाडौं स्टक एक्सचेन्जमा आज सूचकांक ५० अंकले बढेको छ। कारोबार रकम ४ अर्ब रुपैयाँ नाघेको छ।",
    content:
      "नेपाल स्टक एक्सचेन्ज (नेप्से) परिसूचक आज ५० अंकले बढेर बन्द भएको छ। बैंकिङ र जलविद्युत समूहका शेयरहरूमा उल्लेख्य कारोबार भएको थियो।",
    categoryId: "cat_share",
    category: byId("cat_share"),
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop",
    author: "सेयर बजार डेस्क",
    status: "published",
    breaking: false,
    featured: false,
    publishedAt: "2026-08-18T04:50:00.000Z",
    views: 1830,
  },
  {
    id: "news_3",
    slug: "nifra-labhansh-antim-din",
    title: "नेपाल इन्फ्रास्ट्रक्चर बैंक (NIFRA) को लाभांश सुरक्षित गर्ने आज अन्तिम दिन",
    excerpt: "एनआईएफआरएको वार्षिक साधारण सभाले पारित गरेको लाभांश प्राप्त गर्न सेयरधनीहरूले आज कारोबार गर्नुपर्ने भएको छ।",
    content:
      "नेपाल इन्फ्रास्ट्रक्चर बैंक लिमिटेडले घोषणा गरेको बोनस तथा नगद लाभांश हक प्राप्त गर्ने अन्तिम दिन आज तोकिएको छ। कम्पनीले यस वर्ष कुल १५ प्रतिशत लाभांश घोषणा गरेको थियो।",
    categoryId: "cat_share",
    category: byId("cat_share"),
    image: "https://images.unsplash.com/photo-1591696205602-2f950c417cb9?q=80&w=800&auto=format&fit=crop",
    author: "सेयर बजार डेस्क",
    status: "published",
    breaking: false,
    featured: false,
    publishedAt: "2026-08-18T03:10:00.000Z",
    views: 960,
  },
  {
    id: "news_4",
    slug: "banking-naya-byajdar-jestha",
    title: "वाणिज्य बैंकहरूले सार्वजनिक गरे जेठ महिनाको नयाँ ब्याजदर; निक्षेपको ब्याजदर घट्यो",
    excerpt: "नेपाल राष्ट्र बैंकको निर्देशनपछि वाणिज्य बैंकहरूले जेठ महिनाका लागि निक्षेप तथा कर्जाको ब्याजदर सार्वजनिक गरेका छन्।",
    content:
      "देशका प्रमुख वाणिज्य बैंकहरूले जेठ महिनाको ब्याजदर सार्वजनिक गरेका छन्। औसत आधारदर घटेसँगै निक्षेपको ब्याजदर पनि घटेको छ।",
    categoryId: "cat_bank",
    category: byId("cat_bank"),
    image: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?q=80&w=800&auto=format&fit=crop",
    author: "बैंकिङ डेस्क",
    status: "published",
    breaking: false,
    featured: false,
    publishedAt: "2026-08-18T02:40:00.000Z",
    views: 1520,
  },
  {
    id: "news_5",
    slug: "digital-banking-qr-cashback",
    title: "डिजिटल बैंकिङ प्रवर्द्धन गर्न क्युआर कोड भुक्तानीमा राष्ट्र बैंकको नयाँ क्यासब्याक नीति",
    excerpt: "राष्ट्र बैंकले डिजिटल भुक्तानी प्रणालीलाई प्रवर्द्धन गर्न क्युआर भुक्तानीमा क्यासब्याक सुविधा थप गरेको छ।",
    content:
      "नेपाल राष्ट्र बैंकले डिजिटल भुक्तानी बढाउने उद्देश्यले क्युआर कोड मार्फत हुने साना कारोबारमा क्यासब्याक सुविधा दिने नीति ल्याएको छ।",
    categoryId: "cat_bank",
    category: byId("cat_bank"),
    image: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?q=80&w=800&auto=format&fit=crop",
    author: "बैंकिङ डेस्क",
    status: "published",
    breaking: false,
    featured: false,
    publishedAt: "2026-08-17T11:20:00.000Z",
    views: 870,
  },
  {
    id: "news_6",
    slug: "gundruk-startup-export",
    title: "गुन्द्रुक उत्पादनबाट सुरु भएको एउटा रैथाने स्टार्टअप: वार्षिक करोडौँको निर्यात",
    excerpt: "पहाडी क्षेत्रको परम्परागत गुन्द्रुकलाई आधुनिक प्रविधिसँग जोडेर सुरु भएको स्टार्टअपले अहिले विदेशसम्म निर्यात गर्न थालेको छ।",
    content:
      "पोखराबाट सुरु भएको एउटा साना स्टार्टअपले परम्परागत गुन्द्रुकलाई आधुनिक प्याकेजिङ र गुणस्तर मापदण्डसँग जोडेर अन्तर्राष्ट्रिय बजारसम्म पुर्‍याएको छ।",
    categoryId: "cat_udyam",
    category: byId("cat_udyam"),
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop",
    author: "उद्यमशीलता डेस्क",
    status: "published",
    breaking: false,
    featured: false,
    publishedAt: "2026-08-17T09:15:00.000Z",
    views: 1290,
  },
  {
    id: "news_7",
    slug: "kathmandu-apartment-price-trend",
    title: "काठमाडौं उपत्यकामा अपार्टमेन्टको माग बढ्दो, मूल्यमा स्थिरता",
    excerpt: "सहरी क्षेत्रमा जग्गाको सीमितताका कारण अपार्टमेन्ट संस्कृतिप्रति आकर्षण बढेको रियल स्टेट कारोबारीहरूले बताएका छन्।",
    content:
      "काठमाडौं उपत्यकाका प्रमुख सहरी क्षेत्रहरूमा जग्गाको मूल्य बढ्दै गएपछि अपार्टमेन्टप्रतिको आकर्षण बढेको छ। रियल स्टेट कारोबारीहरूका अनुसार अपार्टमेन्ट खरिदमा वृद्धि भएको छ।",
    categoryId: "cat_realestate",
    category: byId("cat_realestate"),
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800&auto=format&fit=crop",
    author: "रियल स्टेट डेस्क",
    status: "published",
    breaking: false,
    featured: false,
    publishedAt: "2026-08-17T07:00:00.000Z",
    views: 640,
  },
  {
    id: "news_8",
    slug: "gold-price-drop-tola",
    title: "अन्तर्राष्ट्रिय बजारको मन्दीका कारण नेपाली बजारमा सुन तोलामा ३०० रुपैयाँले गिरावट",
    excerpt: "विश्व बजारमा सुनको मूल्यमा आएको मन्दीको प्रभाव नेपाली बजारमा पनि देखिएको छ।",
    content:
      "अन्तर्राष्ट्रिय बजारमा सुनको मूल्य घटेसँगै नेपाली सुन बजारमा पनि प्रतितोला ३०० रुपैयाँले मूल्य घटेको छ।",
    categoryId: "cat_gold",
    category: byId("cat_gold"),
    image: "https://images.unsplash.com/photo-1610375461369-d613b564f4c4?q=80&w=800&auto=format&fit=crop",
    author: "सुनचाँदी डेस्क",
    status: "published",
    breaking: false,
    featured: false,
    publishedAt: "2026-08-17T06:00:00.000Z",
    views: 2210,
  },
];

export const ticker = [
  { label: "नेप्से (NEPSE)", value: "२,१५०.४५", change: "+१.२%", positive: true },
  { label: "सुन", value: "रू १,४२,०००", change: "-३००", positive: false },
  { label: "डलर", value: "रू १३४.२०", change: "+०.०५", positive: true },
  { label: "कारोबार रकम", value: "अर्ब ४.३२" },
];

export const quickSummaries = [
  { tag: "नेप्से", text: "आज नेप्से परिसूचक ५० अंकले बढ्दै गौरवमय स्थानमा, कारोबार रकम ४ अर्ब नाघ्यो।", tone: "positive" as const },
  { tag: "बैंकिङ", text: "वाणिज्य बैंकहरूले सार्वजनिक गरे जेठ महिनाको नयाँ ब्याजदर; निक्षेपको ब्याजदर घट्यो।", tone: "neutral" as const },
  { tag: "सुनचाँदी", text: "अन्तर्राष्ट्रिय बजारको मन्दीका कारण नेपाली बजारमा सुन तोलामा ३०० रुपैयाँले गिरावट।", tone: "negative" as const },
];

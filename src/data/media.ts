export type MockVideo = {
  id: string;
  title: string;
  category: string;
  duration: string;
  views: number;
  status: "published" | "draft";
  thumbnail: string;
};

export const mockVideos: MockVideo[] = [
  {
    id: "v1",
    title: "बजेट भाषण लाइभ कभरेज",
    category: "अर्थतन्त्र",
    duration: "12:04",
    views: 8420,
    status: "published",
    thumbnail: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "v2",
    title: "नेप्से आज: बजार विश्लेषण",
    category: "सेयर बजार",
    duration: "06:41",
    views: 3190,
    status: "published",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "v3",
    title: "बैंकिङ ब्याजदर व्याख्या",
    category: "बैंक/बीमा",
    duration: "09:15",
    views: 1120,
    status: "draft",
    thumbnail: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?q=80&w=400&auto=format&fit=crop",
  },
];

export type MockAd = {
  id: string;
  name: string;
  placement: string;
  advertiser: string;
  impressions: number;
  ctr: string;
  active: boolean;
};

export const mockAds: MockAd[] = [
  { id: "ad1", name: "होमपेज ब्यानर", placement: "Homepage — Top", advertiser: "NIC Asia Bank", impressions: 128400, ctr: "1.8%", active: true },
  { id: "ad2", name: "साइडबार स्क्वायर", placement: "Article — Sidebar", advertiser: "Himalayan Bank", impressions: 64200, ctr: "1.2%", active: true },
  { id: "ad3", name: "इन-आर्टिकल नेटिभ", placement: "Article — Inline", advertiser: "Ncell", impressions: 41850, ctr: "2.4%", active: false },
];

export type ComplaintStatus = "Submitted" | "Verified" | "Assigned" | "In Progress" | "Resolved" | "Rejected";
export type ComplaintPriority = "Low" | "Medium" | "High" | "Critical";

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  ward: string;
  address: string;
  lat: number;
  lng: number;
  upvotes: number;
  imageUrl: string;
  citizen: string;
  createdAt: string;
  aiSummary?: string;
  aiConfidence?: number;
}

export const BHATKAL_WARDS = [
  "Ward 1 — Tenginagundi", "Ward 2 — Murudeshwar Road", "Ward 3 — Shamsuddin Circle",
  "Ward 4 — Jali", "Ward 5 — Mavinkurva", "Ward 6 — Bandar Road",
  "Ward 7 — Khalifa Town", "Ward 8 — Maqdoom Colony", "Ward 9 — Nawayath Mohalla",
  "Ward 10 — Madina Colony", "Ward 11 — Bengre", "Ward 12 — Sonar Keri",
];

export const CATEGORIES: Category[] = [
  { id: "garbage", name: "Garbage", icon: "Trash2", color: "from-emerald-500 to-teal-500" },
  { id: "pothole", name: "Pothole", icon: "AlertTriangle", color: "from-orange-500 to-red-500" },
  { id: "water", name: "Water Leakage", icon: "Droplets", color: "from-sky-500 to-blue-500" },
  { id: "light", name: "Street Light", icon: "Lightbulb", color: "from-amber-400 to-yellow-500" },
  { id: "drain", name: "Drainage", icon: "Waves", color: "from-cyan-500 to-blue-600" },
  { id: "construction", name: "Illegal Construction", icon: "Home", color: "from-stone-500 to-zinc-600" },
  { id: "tree", name: "Fallen Tree", icon: "Leaf", color: "from-green-600 to-emerald-700" },
  { id: "traffic", name: "Traffic Signal", icon: "AlertCircle", color: "from-rose-500 to-pink-500" },
  { id: "stray", name: "Stray Animals", icon: "PawPrint", color: "from-amber-600 to-orange-600" },
  { id: "noise", name: "Noise Pollution", icon: "Volume2", color: "from-violet-500 to-purple-500" },
];

export const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: "NV-1042", title: "Massive pothole on Bandar Road near Jamia Masjid",
    description: "A large pothole has developed near the masjid causing accidents to bikers especially during rains. Needs urgent attention before someone gets seriously hurt.",
    category: "pothole", status: "In Progress", priority: "Critical",
    ward: "Ward 6 — Bandar Road", address: "Bandar Road, near Jamia Masjid, Bhatkal",
    lat: 13.9726, lng: 74.5669, upvotes: 87,
    imageUrl: "https://images.unsplash.com/photo-1597807513872-15ed27e9f60b?w=800",
    citizen: "Imran Khan", createdAt: "2026-05-12",
    aiSummary: "High-risk road damage on a major thoroughfare. Recommend immediate dispatch to PWD.",
    aiConfidence: 0.94,
  },
  {
    id: "NV-1041", title: "Overflowing garbage bin behind fish market",
    description: "Garbage hasn't been collected for 5 days. Strong smell and stray dogs gathering. Health hazard for nearby shops.",
    category: "garbage", status: "Assigned", priority: "High",
    ward: "Ward 11 — Bengre", address: "Fish Market lane, Bengre, Bhatkal",
    lat: 13.985, lng: 74.555, upvotes: 64,
    imageUrl: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=800",
    citizen: "Anonymous", createdAt: "2026-05-13",
    aiSummary: "Sanitation issue near commercial zone. Auto-assigned to Sanitation Dept.",
    aiConfidence: 0.91,
  },
  {
    id: "NV-1040", title: "Street lights not working in Nawayath Mohalla",
    description: "Entire stretch of 8 lamps non-functional for over a week. Women and elderly avoid walking after sunset.",
    category: "light", status: "Verified", priority: "High",
    ward: "Ward 9 — Nawayath Mohalla", address: "Nawayath Mohalla main road",
    lat: 13.9698, lng: 74.5701, upvotes: 142,
    imageUrl: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800",
    citizen: "Fatima Begum", createdAt: "2026-05-10",
    aiSummary: "Public safety concern. KEB coordination required.",
    aiConfidence: 0.88,
  },
  {
    id: "NV-1039", title: "Sewage water flooding road after rains",
    description: "Every monsoon the drain near Madina Colony chowk overflows. Two-wheelers cannot pass.",
    category: "drain", status: "Resolved", priority: "High",
    ward: "Ward 10 — Madina Colony", address: "Madina Colony chowk",
    lat: 13.967, lng: 74.572, upvotes: 53,
    imageUrl: "https://images.unsplash.com/photo-1583425423320-9119efa53866?w=800",
    citizen: "Yusuf Ali", createdAt: "2026-05-08",
    aiSummary: "Recurring drainage issue resolved by Public Works.",
    aiConfidence: 0.86,
  },
  {
    id: "NV-1038", title: "Water pipe burst near Murudeshwar Road",
    description: "Thousands of litres being wasted daily. Pressure drop affecting entire ward.",
    category: "water", status: "In Progress", priority: "Critical",
    ward: "Ward 2 — Murudeshwar Road", address: "Near KSRTC bus stand",
    lat: 13.965, lng: 74.563, upvotes: 98,
    imageUrl: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800",
    citizen: "Ramesh Naik", createdAt: "2026-05-14",
    aiSummary: "Critical water loss. Dispatch within 2 hours recommended.",
    aiConfidence: 0.96,
  },
  {
    id: "NV-1037", title: "Illegal construction blocking public footpath",
    description: "A shop extension is encroaching 4 feet onto the public footpath forcing pedestrians onto the road.",
    category: "construction", status: "Submitted", priority: "Medium",
    ward: "Ward 3 — Shamsuddin Circle", address: "Shamsuddin Circle",
    lat: 13.9712, lng: 74.5689, upvotes: 31,
    imageUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800",
    citizen: "Anonymous", createdAt: "2026-05-15",
  },
  {
    id: "NV-1036", title: "Stray dog menace near school gate",
    description: "Pack of stray dogs near primary school. Children scared to enter.",
    category: "stray", status: "Assigned", priority: "Medium",
    ward: "Ward 4 — Jali", address: "Jali Primary School",
    lat: 13.978, lng: 74.578, upvotes: 47,
    imageUrl: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800",
    citizen: "Suma Hegde", createdAt: "2026-05-11",
  },
  {
    id: "NV-1035", title: "Old peepal tree fallen blocking lane",
    description: "Tree fell after last night's storm. Completely blocks access for residents.",
    category: "tree", status: "Resolved", priority: "High",
    ward: "Ward 7 — Khalifa Town", address: "Khalifa Town inner lane",
    lat: 13.974, lng: 74.566, upvotes: 22,
    imageUrl: "https://images.unsplash.com/photo-1604608672516-f1b9b1d1fa00?w=800",
    citizen: "Anwar Sheikh", createdAt: "2026-05-09",
  },
];

export const MOCK_STATS = {
  total: 1247, resolved: 1109, avgDays: 3.2, wards: 12,
};

export const MOCK_TESTIMONIALS = [
  { name: "Zubeda Bibi", ward: "Ward 9", avatar: "https://i.pravatar.cc/120?img=47",
    quote: "Reported a broken street light at 9 pm — fixed by next afternoon. NagarVaani actually works." },
  { name: "Vinod Shetty", ward: "Ward 6", avatar: "https://i.pravatar.cc/120?img=12",
    quote: "First time I feel my complaint reaches someone. The AI summary tells officers exactly what's wrong." },
  { name: "Aisha Khan", ward: "Ward 10", avatar: "https://i.pravatar.cc/120?img=45",
    quote: "Kannada and Urdu support means my mother can finally report issues herself." },
];

export const STATUS_COLORS: Record<ComplaintStatus, string> = {
  "Submitted": "bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-500/30",
  "Verified": "bg-violet-500/15 text-violet-600 dark:text-violet-300 border-violet-500/30",
  "Assigned": "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30",
  "In Progress": "bg-orange-500/15 text-orange-600 dark:text-orange-300 border-orange-500/30",
  "Resolved": "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
  "Rejected": "bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30",
};

export const PRIORITY_COLORS: Record<ComplaintPriority, string> = {
  "Low": "text-emerald-500",
  "Medium": "text-amber-500",
  "High": "text-orange-500",
  "Critical": "text-rose-500",
};
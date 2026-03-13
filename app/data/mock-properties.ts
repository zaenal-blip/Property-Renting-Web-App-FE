import type { Property } from "~/types/property";

const hotelCat = { id: "cat1", name: "hotel" };
const villaCat = { id: "cat2", name: "villa" };
const resortCat = { id: "cat3", name: "resort" };
const apartmentCat = { id: "cat4", name: "apartment" };
const guesthouseCat = { id: "cat5", name: "guesthouse" };

export const mockProperties: Property[] = [
  {
    id: "1",
    tenantId: "t1",
    categoryId: "cat1",
    name: "Grand Hyatt Jakarta",
    slug: "grand-hyatt-jakarta",
    city: "Jakarta",
    address: "Jl. M.H. Thamrin No.28-30",
    description:
      "Luxury five star hotel located in Jakarta's main business district with premium city views.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: hotelCat,
    rating: 4.8,
    reviewCount: 1243,
    images: [
      {
        id: "pi1",
        propertyId: "1",
        imageUrl:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945",
      },
      {
        id: "pi2",
        propertyId: "1",
        imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa",
      },
    ],
    lowestPrice: 1850000,
    isAvailable: true,
    amenities: ["Pool", "Spa", "Gym", "Restaurant", "WiFi", "Parking"],
    rooms: [
      {
        id: "r1",
        propertyId: "1",
        name: "Deluxe King Room",
        description: "Spacious luxury room with skyline view.",
        capacity: 2,
        basePrice: 1850000,
        createdAt: new Date().toISOString(),
        images: [
          {
            id: "ri1",
            roomId: "r1",
            imageUrl:
              "https://images.unsplash.com/photo-1590490360182-c33d57733427",
          },
        ],
        availability: [],
        peakSeasonRates: [],
      },
    ],
  },

  {
    id: "2",
    tenantId: "t2",
    categoryId: "cat2",
    name: "The Layar Seminyak Villa",
    slug: "the-layar-seminyak-villa",
    city: "Bali",
    address: "Jl. Kayu Aya, Seminyak",
    description: "Modern tropical villa with private pool near Seminyak beach.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: villaCat,
    rating: 4.9,
    reviewCount: 876,
    images: [
      {
        id: "pi3",
        propertyId: "2",
        imageUrl:
          "https://images.unsplash.com/photo-1582719508461-905c673771fd",
      },
      {
        id: "pi4",
        propertyId: "2",
        imageUrl:
          "https://images.unsplash.com/photo-1613490493576-7fde63acd811",
      },
    ],
    lowestPrice: 2400000,
    isAvailable: true,
    amenities: ["Private Pool", "Garden", "Kitchen", "WiFi"],
    rooms: [
      {
        id: "r2",
        propertyId: "2",
        name: "Private Pool Villa",
        description: "Romantic villa with tropical garden and private pool.",
        capacity: 2,
        basePrice: 2400000,
        createdAt: new Date().toISOString(),
        images: [
          {
            id: "ri2",
            roomId: "r2",
            imageUrl:
              "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
          },
        ],
        availability: [],
        peakSeasonRates: [],
      },
    ],
  },

  {
    id: "3",
    tenantId: "t3",
    categoryId: "cat3",
    name: "Nihi Sumba Resort",
    slug: "nihi-sumba-resort",
    city: "Sumba",
    address: "Wanokaka, West Sumba",
    description:
      "World famous luxury resort offering ocean view villas and unique cultural experiences.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: resortCat,
    rating: 4.9,
    reviewCount: 520,
    images: [
      {
        id: "pi5",
        propertyId: "3",
        imageUrl:
          "https://images.unsplash.com/photo-1501117716987-c8e1ecb210c1",
      },
      {
        id: "pi6",
        propertyId: "3",
        imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb",
      },
    ],
    lowestPrice: 5200000,
    isAvailable: true,
    amenities: ["Beach Access", "Spa", "Infinity Pool", "Restaurant", "WiFi"],
    rooms: [
      {
        id: "r3",
        propertyId: "3",
        name: "Ocean View Villa",
        description: "Luxury villa overlooking the Indian Ocean.",
        capacity: 2,
        basePrice: 5200000,
        createdAt: new Date().toISOString(),
        images: [
          {
            id: "ri3",
            roomId: "r3",
            imageUrl:
              "https://images.unsplash.com/photo-1584132967334-10e028bd69f7",
          },
        ],
        availability: [],
        peakSeasonRates: [],
      },
    ],
  },

  {
    id: "4",
    tenantId: "t4",
    categoryId: "cat1",
    name: "Padma Hotel Bandung",
    slug: "padma-hotel-bandung",
    city: "Bandung",
    address: "Jl. Ranca Bentang",
    description: "Luxury mountain hotel surrounded by lush forest.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: hotelCat,
    rating: 4.7,
    reviewCount: 640,
    images: [
      {
        id: "pi7",
        propertyId: "4",
        imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa",
      },
    ],
    lowestPrice: 1650000,
    isAvailable: true,
    amenities: ["Pool", "Spa", "Restaurant", "Gym", "WiFi"],
    rooms: [
      {
        id: "r4",
        propertyId: "4",
        name: "Premier Room",
        description: "Elegant room with mountain view.",
        capacity: 2,
        basePrice: 1650000,
        createdAt: new Date().toISOString(),
        images: [
          {
            id: "ri4",
            roomId: "r4",
            imageUrl:
              "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
          },
        ],
        availability: [],
        peakSeasonRates: [],
      },
    ],
  },

  {
    id: "5",
    tenantId: "t5",
    categoryId: "cat4",
    name: "Oakwood Premier Apartment",
    slug: "oakwood-premier-apartment",
    city: "Jakarta",
    address: "Mega Kuningan",
    description: "Modern serviced apartment in Jakarta business district.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: apartmentCat,
    rating: 4.6,
    reviewCount: 410,
    images: [
      {
        id: "pi8",
        propertyId: "5",
        imageUrl:
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
      },
    ],
    lowestPrice: 1450000,
    isAvailable: true,
    amenities: ["Kitchen", "Gym", "Pool", "WiFi", "Parking"],
    rooms: [
      {
        id: "r5",
        propertyId: "5",
        name: "Studio Apartment",
        description: "Modern apartment with city skyline view.",
        capacity: 2,
        basePrice: 1450000,
        createdAt: new Date().toISOString(),
        images: [
          {
            id: "ri5",
            roomId: "r5",
            imageUrl:
              "https://images.unsplash.com/photo-1560448204-603b3fc33ddc",
          },
        ],
        availability: [],
        peakSeasonRates: [],
      },
    ],
  },

  {
    id: "6",
    tenantId: "t6",
    categoryId: "cat5",
    name: "Jogja Heritage Guesthouse",
    slug: "jogja-heritage-guesthouse",
    city: "Yogyakarta",
    address: "Jl. Malioboro",
    description: "Traditional Javanese guesthouse near Malioboro street.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: guesthouseCat,
    rating: 4.5,
    reviewCount: 210,
    images: [
      {
        id: "pi9",
        propertyId: "6",
        imageUrl:
          "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
      },
    ],
    lowestPrice: 450000,
    isAvailable: true,
    amenities: ["Breakfast", "WiFi", "Parking"],
    rooms: [
      {
        id: "r6",
        propertyId: "6",
        name: "Standard Room",
        description: "Simple cozy room for travelers.",
        capacity: 2,
        basePrice: 450000,
        createdAt: new Date().toISOString(),
        images: [
          {
            id: "ri6",
            roomId: "r6",
            imageUrl:
              "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf",
          },
        ],
        availability: [],
        peakSeasonRates: [],
      },
    ],
  },

  {
    id: "7",
    tenantId: "t7",
    categoryId: "cat3",
    name: "Ayana Resort Bali",
    slug: "ayana-resort-bali",
    city: "Bali",
    address: "Jimbaran",
    description: "Luxury cliffside resort with iconic ocean sunset views.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: resortCat,
    rating: 4.9,
    reviewCount: 980,
    images: [
      {
        id: "pi10",
        propertyId: "7",
        imageUrl:
          "https://images.unsplash.com/photo-1540541338287-41700207dee6",
      },
    ],
    lowestPrice: 4800000,
    isAvailable: true,
    amenities: ["Beach", "Spa", "Infinity Pool", "Restaurant", "Bar"],
    rooms: [
      {
        id: "r7",
        propertyId: "7",
        name: "Ocean View Room",
        description: "Elegant room overlooking the ocean.",
        capacity: 2,
        basePrice: 4800000,
        createdAt: new Date().toISOString(),
        images: [
          {
            id: "ri7",
            roomId: "r7",
            imageUrl:
              "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
          },
        ],
        availability: [],
        peakSeasonRates: [],
      },
    ],
  },

  {
    id: "8",
    tenantId: "t8",
    categoryId: "cat4",
    name: "Skyline Apartment Surabaya",
    slug: "skyline-apartment-surabaya",
    city: "Surabaya",
    address: "Jl. Tunjungan",
    description:
      "Modern apartment in central Surabaya close to shopping centers.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: apartmentCat,
    rating: 4.4,
    reviewCount: 150,
    images: [
      {
        id: "pi11",
        propertyId: "8",
        imageUrl:
          "https://images.unsplash.com/photo-1507089947368-19c1da9775ae",
      },
    ],
    lowestPrice: 900000,
    isAvailable: true,
    amenities: ["Kitchen", "WiFi", "Parking"],
    rooms: [
      {
        id: "r8",
        propertyId: "8",
        name: "City Studio",
        description: "Comfortable studio apartment.",
        capacity: 2,
        basePrice: 900000,
        createdAt: new Date().toISOString(),
        images: [
          {
            id: "ri8",
            roomId: "r8",
            imageUrl:
              "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d",
          },
        ],
        availability: [],
        peakSeasonRates: [],
      },
    ],
  },

  {
    id: "9",
    tenantId: "t9",
    categoryId: "cat2",
    name: "Ubud Jungle Villa",
    slug: "ubud-jungle-villa",
    city: "Bali",
    address: "Ubud",
    description:
      "Private jungle villa with infinity pool and rice terrace view.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: villaCat,
    rating: 4.8,
    reviewCount: 320,
    images: [
      {
        id: "pi12",
        propertyId: "9",
        imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb",
      },
    ],
    lowestPrice: 2600000,
    isAvailable: true,
    amenities: ["Private Pool", "Garden", "Spa", "WiFi"],
    rooms: [
      {
        id: "r9",
        propertyId: "9",
        name: "Jungle Villa",
        description: "Private villa surrounded by tropical forest.",
        capacity: 2,
        basePrice: 2600000,
        createdAt: new Date().toISOString(),
        images: [
          {
            id: "ri9",
            roomId: "r9",
            imageUrl:
              "https://images.unsplash.com/photo-1590490360182-c33d57733427",
          },
        ],
        availability: [],
        peakSeasonRates: [],
      },
    ],
  },

  {
    id: "10",
    tenantId: "t10",
    categoryId: "cat5",
    name: "Bandung Cozy Guesthouse",
    slug: "bandung-cozy-guesthouse",
    city: "Bandung",
    address: "Dago",
    description: "Affordable guesthouse perfect for weekend travelers.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: guesthouseCat,
    rating: 4.3,
    reviewCount: 90,
    images: [
      {
        id: "pi13",
        propertyId: "10",
        imageUrl:
          "https://images.unsplash.com/photo-1521783988139-893cebb7a6b5",
      },
    ],
    lowestPrice: 350000,
    isAvailable: true,
    amenities: ["WiFi", "Parking", "Breakfast"],
    rooms: [
      {
        id: "r10",
        propertyId: "10",
        name: "Budget Room",
        description: "Simple clean room for short stay.",
        capacity: 2,
        basePrice: 350000,
        createdAt: new Date().toISOString(),
        images: [
          {
            id: "ri10",
            roomId: "r10",
            imageUrl:
              "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
          },
        ],
        availability: [],
        peakSeasonRates: [],
      },
    ],
  },
];

export const destinations = [
  "Jakarta",
  "Bali",
  "Yogyakarta",
  "Surabaya",
  "Bandung",
];

export interface MockReview {
  id: string;
  propertyId: string;
  userName: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

export const mockReviews: MockReview[] = [
  {
    id: "rev1",
    propertyId: "1",
    userName: "Andi Pratama",
    avatar: "https://i.pravatar.cc/150?img=1",
    rating: 5,
    date: "2026-02-15",
    comment: "Amazing hotel! The service and location were perfect.",
  },
  {
    id: "rev2",
    propertyId: "1",
    userName: "Sarah Johnson",
    avatar: "https://i.pravatar.cc/150?img=5",
    rating: 4,
    date: "2026-02-10",
    comment: "Great location in central Jakarta and very comfortable rooms.",
  },

  {
    id: "rev3",
    propertyId: "2",
    userName: "Michael Tan",
    avatar: "https://i.pravatar.cc/150?img=8",
    rating: 5,
    date: "2026-01-22",
    comment:
      "Beautiful private villa! The pool and atmosphere were incredible.",
  },
  {
    id: "rev4",
    propertyId: "2",
    userName: "Lisa Chen",
    avatar: "https://i.pravatar.cc/150?img=12",
    rating: 5,
    date: "2026-01-18",
    comment: "Perfect place for honeymoon. Very peaceful and romantic.",
  },

  {
    id: "rev5",
    propertyId: "3",
    userName: "Daniel Hartono",
    avatar: "https://i.pravatar.cc/150?img=15",
    rating: 5,
    date: "2026-02-05",
    comment: "One of the most beautiful resorts I've ever visited.",
  },

  {
    id: "rev6",
    propertyId: "4",
    userName: "Rina Wulandari",
    avatar: "https://i.pravatar.cc/150?img=21",
    rating: 4,
    date: "2026-02-02",
    comment: "Great mountain view and relaxing atmosphere.",
  },

  {
    id: "rev7",
    propertyId: "5",
    userName: "Kevin Lee",
    avatar: "https://i.pravatar.cc/150?img=30",
    rating: 4,
    date: "2026-01-30",
    comment: "Very comfortable apartment and good facilities.",
  },

  {
    id: "rev8",
    propertyId: "6",
    userName: "Siti Rahma",
    avatar: "https://i.pravatar.cc/150?img=25",
    rating: 5,
    date: "2026-02-12",
    comment: "Very friendly host and great location near Malioboro.",
  },

  {
    id: "rev9",
    propertyId: "7",
    userName: "James Wilson",
    avatar: "https://i.pravatar.cc/150?img=18",
    rating: 5,
    date: "2026-02-01",
    comment: "Sunset views from this resort are absolutely stunning.",
  },

  {
    id: "rev10",
    propertyId: "8",
    userName: "Fajar Nugroho",
    avatar: "https://i.pravatar.cc/150?img=33",
    rating: 4,
    date: "2026-02-08",
    comment: "Good apartment in central Surabaya, very convenient.",
  },

  {
    id: "rev11",
    propertyId: "9",
    userName: "Emily Carter",
    avatar: "https://i.pravatar.cc/150?img=9",
    rating: 5,
    date: "2026-02-04",
    comment: "Amazing jungle villa experience in Ubud.",
  },

  {
    id: "rev12",
    propertyId: "10",
    userName: "Dimas Saputra",
    avatar: "https://i.pravatar.cc/150?img=40",
    rating: 4,
    date: "2026-02-03",
    comment: "Affordable place and very clean rooms.",
  },
];

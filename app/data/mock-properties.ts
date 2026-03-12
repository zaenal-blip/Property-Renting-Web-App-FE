import type { Property } from "~/types/property";
import property1 from "~/assets/property-1.jpg";
import property2 from "~/assets/property-2.jpg";
import property3 from "~/assets/property-3.jpg";
import property4 from "~/assets/property-4.jpg";
import property5 from "~/assets/property-5.jpg";
import property6 from "~/assets/property-6.jpg";

export const mockProperties: Property[] = [
  {
    id: "1",
    name: "Grand Hyatt Jakarta",
    city: "Jakarta",
    address: "Jl. M.H. Thamrin No.28-30",
    description:
      "Experience luxury in the heart of Jakarta with stunning city views and world-class amenities. Featuring elegant rooms, multiple dining options, and a rooftop infinity pool overlooking the metropolitan skyline.",
    category: "hotel",
    rating: 4.8,
    reviewCount: 1243,
    images: [property1, property2, property3],
    lowestPrice: 1850000,
    isAvailable: true,
    amenities: ["Pool", "Spa", "Gym", "Restaurant", "Bar", "WiFi", "Parking"],
    rooms: [
      {
        id: "r1",
        propertyId: "1",
        name: "Deluxe King Room",
        description:
          "Spacious room with king bed, city view, and marble bathroom.",
        price: 1850000,
        capacity: 2,
        images: [property1],
        isAvailable: true,
      },
      {
        id: "r2",
        propertyId: "1",
        name: "Grand Suite",
        description:
          "Luxurious suite with separate living area and panoramic views.",
        price: 3500000,
        capacity: 3,
        images: [property2],
        isAvailable: true,
      },
      {
        id: "r3",
        propertyId: "1",
        name: "Presidential Suite",
        description:
          "Ultimate luxury with private butler, jacuzzi, and dining room.",
        price: 8500000,
        capacity: 4,
        images: [property3],
        isAvailable: false,
      },
    ],
  },
  {
    id: "2",
    name: "The Layar Seminyak",
    city: "Bali",
    address: "Jl. Pantai Berawa, Seminyak",
    description:
      "A beachfront paradise with private villas and breathtaking sunset views. Each villa features its own pool, outdoor shower, and direct beach access.",
    category: "villa",
    rating: 4.9,
    reviewCount: 876,
    images: [property2, property4, property5],
    lowestPrice: 2400000,
    isAvailable: true,
    amenities: ["Private Pool", "Beach Access", "Spa", "Restaurant", "WiFi"],
    rooms: [
      {
        id: "r4",
        propertyId: "2",
        name: "One Bedroom Villa",
        description: "Private villa with plunge pool and garden.",
        price: 2400000,
        capacity: 2,
        images: [property2],
        isAvailable: true,
      },
      {
        id: "r5",
        propertyId: "2",
        name: "Two Bedroom Pool Villa",
        description:
          "Spacious villa with private infinity pool and ocean views.",
        price: 4200000,
        capacity: 4,
        images: [property4],
        isAvailable: true,
      },
    ],
  },
  {
    id: "3",
    name: "Phoenix Heritage Yogyakarta",
    city: "Yogyakarta",
    address: "Jl. Jenderal Sudirman No.9",
    description:
      "A heritage hotel blending Javanese tradition with modern comfort. Located steps from Malioboro street and major cultural landmarks.",
    category: "hotel",
    rating: 4.6,
    reviewCount: 654,
    images: [property3, property1, property6],
    lowestPrice: 980000,
    isAvailable: true,
    amenities: ["Pool", "Garden", "Restaurant", "WiFi", "Parking"],
    rooms: [
      {
        id: "r6",
        propertyId: "3",
        name: "Heritage Double",
        description: "Classic room with Javanese decor and garden view.",
        price: 980000,
        capacity: 2,
        images: [property3],
        isAvailable: true,
      },
      {
        id: "r7",
        propertyId: "3",
        name: "Heritage Suite",
        description:
          "Premium suite with antique furnishings and private terrace.",
        price: 1800000,
        capacity: 2,
        images: [property1],
        isAvailable: true,
      },
    ],
  },
  {
    id: "4",
    name: "Bumi Surabaya City Resort",
    city: "Surabaya",
    address: "Jl. Basuki Rahmat No.106-128",
    description:
      "Modern city resort with rooftop views across Surabaya's skyline. Features award-winning restaurants and a stunning infinity pool.",
    category: "resort",
    rating: 4.5,
    reviewCount: 432,
    images: [property4, property5, property2],
    lowestPrice: 1200000,
    isAvailable: true,
    amenities: ["Rooftop Bar", "Pool", "Gym", "Restaurant", "WiFi"],
    rooms: [
      {
        id: "r8",
        propertyId: "4",
        name: "Superior Room",
        description: "Comfortable room with modern amenities and city view.",
        price: 1200000,
        capacity: 2,
        images: [property4],
        isAvailable: true,
      },
      {
        id: "r9",
        propertyId: "4",
        name: "Executive Suite",
        description: "Corner suite with lounge access and panoramic views.",
        price: 2800000,
        capacity: 3,
        images: [property5],
        isAvailable: true,
      },
    ],
  },
  {
    id: "5",
    name: "Padma Resort Bandung",
    city: "Bandung",
    address: "Jl. Rancabentang No.56-58",
    description:
      "A mountain retreat nestled in lush highlands with panoramic valley views. Perfect escape from the city with fresh mountain air.",
    category: "resort",
    rating: 4.7,
    reviewCount: 789,
    images: [property5, property6, property3],
    lowestPrice: 1550000,
    isAvailable: true,
    amenities: ["Infinity Pool", "Spa", "Kids Club", "Restaurant", "WiFi"],
    rooms: [
      {
        id: "r10",
        propertyId: "5",
        name: "Deluxe Valley View",
        description: "Room with balcony overlooking the lush valley.",
        price: 1550000,
        capacity: 2,
        images: [property5],
        isAvailable: true,
      },
      {
        id: "r11",
        propertyId: "5",
        name: "Premier Suite",
        description: "Large suite with private terrace and mountain views.",
        price: 3200000,
        capacity: 3,
        images: [property6],
        isAvailable: true,
      },
    ],
  },
  {
    id: "6",
    name: "Novotel Lombok Resort",
    city: "Lombok",
    address: "Mandalika Resort, Pantai Putri Nyale",
    description:
      "Beachfront cottages on pristine white sand beaches of Lombok. Ideal for diving enthusiasts and beach lovers.",
    category: "resort",
    rating: 4.4,
    reviewCount: 321,
    images: [property6, property1, property4],
    lowestPrice: 1100000,
    isAvailable: false,
    amenities: ["Beach Access", "Pool", "Diving", "Restaurant", "WiFi"],
    rooms: [
      {
        id: "r12",
        propertyId: "6",
        name: "Beach Cottage",
        description: "Charming cottage steps from the beach.",
        price: 1100000,
        capacity: 2,
        images: [property6],
        isAvailable: false,
      },
      {
        id: "r13",
        propertyId: "6",
        name: "Ocean View Suite",
        description: "Elevated suite with stunning ocean panoramas.",
        price: 2100000,
        capacity: 3,
        images: [property1],
        isAvailable: false,
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
  "Lombok",
  "Malang",
  "Semarang",
  "Medan",
  "Makassar",
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
    avatar: "",
    rating: 5,
    date: "2026-02-15",
    comment:
      "Amazing hotel! The service was impeccable and the room was very clean. Will definitely come back.",
  },
  {
    id: "rev2",
    propertyId: "1",
    userName: "Sarah Wijaya",
    avatar: "",
    rating: 4,
    date: "2026-01-20",
    comment:
      "Great location and comfortable rooms. Breakfast buffet could use more variety.",
  },
  {
    id: "rev3",
    propertyId: "1",
    userName: "Budi Santoso",
    avatar: "",
    rating: 5,
    date: "2025-12-10",
    comment: "Best hotel in Jakarta hands down. The pool area is stunning.",
  },
  {
    id: "rev4",
    propertyId: "2",
    userName: "Lisa Anggraini",
    avatar: "",
    rating: 5,
    date: "2026-02-28",
    comment:
      "The private villa was absolutely magical. Perfect for our honeymoon.",
  },
  {
    id: "rev5",
    propertyId: "2",
    userName: "Rudi Hartono",
    avatar: "",
    rating: 5,
    date: "2026-01-05",
    comment:
      "Sunset views from the villa are breathtaking. Staff went above and beyond.",
  },
  {
    id: "rev6",
    propertyId: "3",
    userName: "Dewi Kusuma",
    avatar: "",
    rating: 4,
    date: "2026-02-01",
    comment:
      "Beautiful heritage architecture. Walking distance to Malioboro. Loved it!",
  },
  {
    id: "rev7",
    propertyId: "4",
    userName: "Agus Setiawan",
    avatar: "",
    rating: 4,
    date: "2026-01-15",
    comment:
      "Good value for money. The rooftop bar has amazing views of the city.",
  },
  {
    id: "rev8",
    propertyId: "5",
    userName: "Maya Putri",
    avatar: "",
    rating: 5,
    date: "2026-02-20",
    comment:
      "The mountain views are incredible. Kids loved the pool area. Perfect family getaway.",
  },
  {
    id: "rev9",
    propertyId: "5",
    userName: "Hendra Gunawan",
    avatar: "",
    rating: 4,
    date: "2026-01-28",
    comment: "Very peaceful and relaxing resort. Great spa treatments.",
  },
  {
    id: "rev10",
    propertyId: "6",
    userName: "Nina Sari",
    avatar: "",
    rating: 4,
    date: "2025-11-20",
    comment: "Beautiful beach location but some facilities need updating.",
  },
];

import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDb, disconnectDb } from "./config/db.js";
import { User } from "./models/User.js";
import { Listing } from "./models/Listing.js";
import { Brand } from "./models/Brand.js";
import { PackageOrder } from "./models/PackageOrder.js";

const DEFAULT_BRANDS = [
  "Giant", "Trek", "Specialized", "Cannondale", "Scott", "Bianchi",
  "Canyon", "Santa Cruz", "Merida", "Cervelo", "Pinarello", "Colnago",
  "Cube", "Focus", "Wilier", "Other",
];

/** Gọi từ server.js khi dùng in-memory DB (DB luôn rỗng khi restart) */
export async function runSeed() {
  await User.deleteMany({});
  await Listing.deleteMany({});
  await Brand.deleteMany({});
  await PackageOrder.deleteMany({});

  await Brand.insertMany(
    DEFAULT_BRANDS.map((name) => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      active: true,
    })),
  );

  const pwd = await bcrypt.hash("Password!1", 10);

  const buyer = await User.create({
    email: "buyer@demo.com",
    passwordHash: pwd,
    role: "BUYER",
    displayName: "buyer_demo",
  });
  const subExp = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const seller = await User.create({
    email: "seller@demo.com",
    passwordHash: pwd,
    role: "SELLER",
    displayName: "seller_demo",
    subscriptionPlan: "BASIC",
    subscriptionExpiresAt: subExp,
  });
  await User.create({
    email: "inspector@demo.com",
    passwordHash: pwd,
    role: "INSPECTOR",
    displayName: "inspector_demo",
  });
  await User.create({
    email: "admin@demo.com",
    passwordHash: pwd,
    role: "ADMIN",
    displayName: "admin_demo",
  });

  await Listing.create([
    {
      title: "Light, fast, aero road bike — inspected & verified",
      brand: "Specialized",
      model: "S-Works Tarmac SL7",
      year: 2022,
      frameSize: "56cm (L)",
      condition: "MINT_USED",
      location: "Ho Chi Minh City",
      price: 180_000_000,
      msrp: 223_750_000,
      currency: "VND",
      state: "PUBLISHED",
      inspectionResult: "APPROVE",
      inspectionScore: 4.6,
      imageUrls: [
        "https://images.unsplash.com/photo-1520975682031-ae1f0c1b1d20?auto=format&fit=crop&w=1600&q=60",
        "https://images.unsplash.com/photo-1525104885112-7c9f2a2c63a1?auto=format&fit=crop&w=1600&q=60",
      ],
      specs: [
        { label: "Groupset", value: "Dura-Ace Di2 R9200" },
        { label: "Frame Material", value: "Carbon Fiber" },
      ],
      seller: { id: seller._id, name: seller.displayName, email: seller.email },
    },
    {
      title: "Endurance geometry, comfortable ride",
      brand: "Trek",
      model: "Domane SL",
      year: 2021,
      frameSize: "54cm (M)",
      condition: "GOOD_USED",
      location: "Da Nang",
      price: 77_500_000,
      currency: "VND",
      state: "PUBLISHED",
      inspectionResult: "APPROVE",
      inspectionScore: 4.2,
      imageUrls: [
        "https://images.unsplash.com/photo-1518655048521-f130df041f66?auto=format&fit=crop&w=1600&q=60",
      ],
      seller: { id: seller._id, name: seller.displayName, email: seller.email },
    },
    {
      title: "Giant TCR Advanced — awaiting inspection",
      brand: "Giant",
      model: "TCR Advanced",
      year: 2020,
      frameSize: "52cm (S)",
      condition: "FAIR_USED",
      location: "Ha Noi",
      price: 70_000_000,
      currency: "VND",
      state: "PENDING_INSPECTION",
      inspectionResult: null,
      certificationStatus: "PENDING_CERTIFICATION",
      imageUrls: [
        "https://images.unsplash.com/photo-1525104885112-7c9f2a2c63a1?auto=format&fit=crop&w=1600&q=60",
      ],
      seller: { id: seller._id, name: seller.displayName, email: seller.email },
    },
    // === Thêm data giả cho test ===
    {
      title: "Cannondale SuperSix EVO — race-ready carbon",
      brand: "Cannondale",
      model: "SuperSix EVO",
      year: 2023,
      frameSize: "54cm (M)",
      condition: "LIKE_NEW",
      location: "Ho Chi Minh City",
      price: 112_500_000,
      msrp: 149_975_000,
      currency: "VND",
      state: "PUBLISHED",
      inspectionResult: "APPROVE",
      inspectionScore: 4.8,
      imageUrls: [
        "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1600&q=60",
      ],
      specs: [
        { label: "Groupset", value: "Shimano Ultegra Di2" },
        { label: "Wheels", value: "Carbon 50mm" },
      ],
      seller: { id: seller._id, name: seller.displayName, email: seller.email },
    },
    {
      title: "Cervelo S5 Aero — wind-tunnel optimized",
      brand: "Cervelo",
      model: "S5",
      year: 2022,
      frameSize: "56cm (L)",
      condition: "MINT_USED",
      location: "Da Nang",
      price: 145_000_000,
      currency: "VND",
      state: "PUBLISHED",
      inspectionResult: "APPROVE",
      inspectionScore: 4.5,
      imageUrls: [
        "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1600&q=60",
      ],
      seller: { id: seller._id, name: seller.displayName, email: seller.email },
    },
    {
      title: "Bianchi Oltre XR4 — Italian racing heritage",
      brand: "Bianchi",
      model: "Oltre XR4",
      year: 2021,
      frameSize: "55cm (L)",
      condition: "GOOD_USED",
      location: "Ha Noi",
      price: 105_000_000,
      currency: "VND",
      state: "PUBLISHED",
      inspectionResult: "APPROVE",
      inspectionScore: 4.3,
      imageUrls: [
        "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=1600&q=60",
      ],
      seller: { id: seller._id, name: seller.displayName, email: seller.email },
    },
    {
      title: "Scott Addict RC 30 — lightweight climber",
      brand: "Scott",
      model: "Addict RC 30",
      year: 2022,
      frameSize: "52cm (S)",
      condition: "MINT_USED",
      location: "Can Tho",
      price: 95_000_000,
      msrp: 112_475_000,
      currency: "VND",
      state: "PUBLISHED",
      inspectionResult: "APPROVE",
      inspectionScore: 4.7,
      imageUrls: [
        "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1600&q=60",
      ],
      seller: { id: seller._id, name: seller.displayName, email: seller.email },
    },
    {
      title: "Pinarello Dogma F — Tour-proven",
      brand: "Pinarello",
      model: "Dogma F",
      year: 2021,
      frameSize: "53.5cm (M)",
      condition: "LIKE_NEW",
      location: "Ho Chi Minh City",
      price: 222_500_000,
      currency: "VND",
      state: "PUBLISHED",
      inspectionResult: "APPROVE",
      inspectionScore: 4.9,
      imageUrls: [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1600&q=60",
      ],
      specs: [{ label: "Groupset", value: "Campagnolo Super Record" }],
      seller: { id: seller._id, name: seller.displayName, email: seller.email },
    },
    {
      title: "Merida Reacto Team-E — aero value",
      brand: "Merida",
      model: "Reacto Team-E",
      year: 2022,
      frameSize: "54cm (M)",
      condition: "GOOD_USED",
      location: "Da Lat",
      price: 65_000_000,
      currency: "VND",
      state: "PUBLISHED",
      inspectionResult: "APPROVE",
      inspectionScore: 4.1,
      imageUrls: [
        "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1600&q=60",
      ],
      seller: { id: seller._id, name: seller.displayName, email: seller.email },
    },
    {
      title: "Colnago V3Rs — Made in Italy",
      brand: "Colnago",
      model: "V3Rs",
      year: 2023,
      frameSize: "52s (S)",
      condition: "LIKE_NEW",
      location: "Ha Noi",
      price: 180_000_000,
      currency: "VND",
      state: "PUBLISHED",
      inspectionResult: "APPROVE",
      inspectionScore: 4.6,
      imageUrls: [
        "https://images.unsplash.com/photo-1486299261210-3a99ffa9d8d5?auto=format&fit=crop&w=1600&q=60",
      ],
      seller: { id: seller._id, name: seller.displayName, email: seller.email },
    },
    {
      title: "Cube Litening C:68X — German engineering",
      brand: "Cube",
      model: "Litening C:68X",
      year: 2022,
      frameSize: "56cm (L)",
      condition: "MINT_USED",
      location: "Ho Chi Minh City",
      price: 85_000_000,
      currency: "VND",
      state: "PUBLISHED",
      inspectionResult: "APPROVE",
      inspectionScore: 4.4,
      imageUrls: [
        "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1600&q=60",
      ],
      seller: { id: seller._id, name: seller.displayName, email: seller.email },
    },
    {
      title: "Focus Izalco Max — gravel-capable road",
      brand: "Focus",
      model: "Izalco Max",
      year: 2021,
      frameSize: "54cm (M)",
      condition: "GOOD_USED",
      location: "Nha Trang",
      price: 72_500_000,
      currency: "VND",
      state: "PUBLISHED",
      inspectionResult: "APPROVE",
      inspectionScore: 4.2,
      imageUrls: [
        "https://images.unsplash.com/photo-1571333250630-f0230e7152f3?auto=format&fit=crop&w=1600&q=60",
      ],
      seller: { id: seller._id, name: seller.displayName, email: seller.email },
    },
    {
      title: "Wilier Zero SLR — ultralight",
      brand: "Wilier",
      model: "Zero SLR",
      year: 2022,
      frameSize: "53cm (M)",
      condition: "MINT_USED",
      location: "Da Nang",
      price: 155_000_000,
      msrp: 187_500_000,
      currency: "VND",
      state: "PUBLISHED",
      inspectionResult: "APPROVE",
      inspectionScore: 4.7,
      imageUrls: [
        "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1600&q=60",
      ],
      seller: { id: seller._id, name: seller.displayName, email: seller.email },
    },
    /** Tin lên sàn chưa kiểm định — để test disclaimer buyer */
    {
      title: "Entry road bike — chưa kiểm định (demo)",
      brand: "Giant",
      model: "Contend",
      year: 2019,
      frameSize: "M",
      condition: "GOOD_USED",
      location: "Ho Chi Minh City",
      price: 12_500_000,
      currency: "VND",
      state: "PUBLISHED",
      inspectionResult: null,
      certificationStatus: "UNVERIFIED",
      publishedAt: new Date(),
      listingExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      imageUrls: [
        "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1600&q=60",
      ],
      seller: { id: seller._id, name: seller.displayName, email: seller.email },
    },
  ]);

  const pubAt = new Date();
  const expAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await Listing.updateMany(
    {
      state: "PUBLISHED",
      inspectionResult: "APPROVE",
    },
    {
      $set: {
        certificationStatus: "CERTIFIED",
        publishedAt: pubAt,
        listingExpiresAt: expAt,
        /** Luồng mới: xe đã qua xác nhận tại kho trước bán (demo). */
        warehouseIntakeVerifiedAt: pubAt,
      },
    },
  );

  // eslint-disable-next-line no-console
  console.log("[seed] done");
  // eslint-disable-next-line no-console
  console.log("Demo accounts:");
  // eslint-disable-next-line no-console
  console.log("buyer@demo.com / Password!1 (BUYER)");
  // eslint-disable-next-line no-console
  console.log("seller@demo.com / Password!1 (SELLER)");
  // eslint-disable-next-line no-console
  console.log("inspector@demo.com / Password!1 (INSPECTOR)");
  // eslint-disable-next-line no-console
  console.log("admin@demo.com / Password!1 (ADMIN)");
}

/** CLI: chạy độc lập với DB thật (MONGODB_URI set) */
async function cliSeed() {
  await connectDb({ mongoUri: process.env.MONGODB_URI });
  await runSeed();
}

const isCli =
  process.argv[1]?.replace(/\\/g, "/").endsWith("seed.js") ||
  process.env.RUN_SEED_CLI === "1";
if (isCli) {
  cliSeed()
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await disconnectDb();
    });
}

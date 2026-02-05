# ShopBike Frontend

ShopBike is a marketplace application for buying and selling bicycles. The platform supports two user roles:

- **Buyers**: Browse, search, and purchase bicycles
- **Sellers**: List bicycles for sale, manage inventory, and handle transactions

## Key Features

- User authentication with role-based access (Buyer/Seller)
- Bicycle listing management with inspection workflow
- Product browsing and detailed views
- Transaction and checkout flow
- User profiles and dashboards
- Listing states: Draft → Pending Inspection → Published → Reserved → Sold

## Business Logic

- Listings go through an inspection process before being published
- Only approved listings are visible in the marketplace
- Support for multiple currencies (VND, USD)
- Bike condition ratings from New to Fair (Used)
- Location-based listings
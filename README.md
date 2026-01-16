# Smart-Kirana: AI-Powered Hyperlocal Supply Chain

Smart-Kirana is a full-stack platform designed to bridge the gap between Wholesalers, Retailers, and Customers. It features real-time inventory synchronization, B2B order management, and AI-driven business intelligence.

## 🚀 Features

- **Supply Chain Sync**: Seamlessly move products from Wholesalers to Retailer inventories with automated SKU management.
- **B2B Operations**: Wholesalers can manage bulk orders, fulfill requests, and track trade history.
- **Retailer Dashboard**: AI-powered analytics including demand forecasting, low stock alerts, and financial reports.
- **Customer Marketplace**: A premium shopping experience with voice search support (Hindi/English) and real-time stock availability.
- **Atomic Transactions**: Reliable order processing even on standalone MongoDB instances.

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, Lucide React, Recharts
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **AI Service**: Python (FastAPI/Flask placeholder)

## 📦 Setup Instructions

1. **Clone the Repo**:
   ```bash
   git clone https://github.com/MDAMANAHMAD/smart-kirana.git
   cd smart-kirana
   ```

2. **Backend Setup**:
   - Navigate to `server/`
   - Run `npm install`
   - Create a `.env` file based on the provided connection string.
   - Run `npm start`

3. **Frontend Setup**:
   - Navigate to `client/`
   - Run `npm install`
   - Run `npm run dev`

## 🔗 Environment Variables

In `server/.env`:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
```

---
Built with ❤️ for the Hyperlocal Retail Ecosystem.

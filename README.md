# FarmVeda - Order Management System

A complete order management system for farm product delivery businesses. Automates the entire process from product catalog to order placement, delivery tracking, payment collection, and invoice generation.

**Built with:** Next.js 16, React 19, TypeScript, MongoDB Atlas, Tailwind CSS

## Features

### Customer Features
- **Product Catalog**: Browse products by date with real-time availability
- **Shopping Cart**: Add products to cart with quantity management
- **Order Placement**: Easy checkout with address management
- **Order Tracking**: View order status and history
- **Payment**: Complete payment through generated payment links
- **Invoice Download**: Download invoices for paid orders

### Admin Features
- **Product Management**: Add products with date-based availability
- **Order Management**: View and manage all orders
- **Delivery Tracking**: Update order status (Pending → Confirmed → Out for Delivery → Delivered)
- **Payment Link Generation**: Auto-generate payment links and QR codes after delivery
- **WhatsApp Integration**: Send payment links and invoices via WhatsApp
- **Excel Export**: Export all order data to Excel
- **Invoice Generation**: Automatic PDF invoice generation
- **Dashboard**: View statistics and recent orders

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: JWT with HTTP-only cookies
- **Database**: JSON file-based (easily migratable to PostgreSQL/MongoDB)
- **PDF Generation**: jsPDF
- **Excel Export**: xlsx
- **QR Code**: qrcode

## Installation

1. **Install Dependencies**
   ```bash
   cd farmveda
   npm install --legacy-peer-deps
   ```

2. **Set Up MongoDB Atlas**
   - Follow the detailed guide in [MONGODB_SETUP.md](./MONGODB_SETUP.md)
   - Create a free MongoDB Atlas account
   - Get your connection string
   - Create `.env.local` file in `farmveda` folder:
     ```env
     MONGODB_URI=your-mongodb-connection-string-here
     JWT_SECRET=your-secret-key-here
     NEXT_PUBLIC_BASE_URL=http://localhost:3000
     ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

5. **Default Admin Account**
   - Mobile: `1234567890`
   - Password: `admin123`
   - Created automatically on first run

## Default Admin Account

- **Mobile**: 1234567890
- **Password**: admin123

**⚠️ Important**: Change the admin password after first login!

## Project Structure

```
farmveda/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── products/     # Product management
│   │   ├── orders/       # Order management
│   │   ├── payment/      # Payment processing
│   │   └── invoice/      # Invoice generation
│   ├── admin/            # Admin pages
│   │   ├── dashboard/    # Admin dashboard
│   │   ├── products/     # Product management
│   │   └── orders/       # Order management
│   ├── catalog/          # Product catalog
│   ├── checkout/         # Checkout page
│   ├── orders/           # Customer orders
│   └── payment/         # Payment page
├── components/           # Reusable components
├── lib/                  # Utilities and helpers
│   ├── types.ts         # TypeScript types
│   ├── db.ts            # Database functions
│   ├── auth.ts          # Authentication utilities
│   └── utils.ts         # Helper functions
└── data/                # JSON database files (auto-created)
```

## Usage Guide

### For Customers

1. **Register/Login**: Create an account or login with mobile number
2. **Browse Products**: Select a date to view available products
3. **Add to Cart**: Add products with desired quantities
4. **Checkout**: Fill in delivery address and place order
5. **Track Orders**: View order status in "My Orders"
6. **Make Payment**: After delivery, use the payment link sent by admin
7. **Download Invoice**: Download invoice after payment completion

### For Admins

1. **Login**: Use admin credentials to login
2. **Add Products**: 
   - Go to "Add Product"
   - Fill product details (name, price, quantity, unit, available date)
   - Products will be visible to customers on the selected date
3. **Manage Orders**:
   - View all orders in dashboard
   - Click "View Details" to see full order information
   - Update order status as delivery progresses
4. **After Delivery**:
   - Mark order as "Delivered"
   - System auto-generates payment link and QR code
   - Copy link or send via WhatsApp to customer
5. **Export Data**: Click "Export Excel" to download all order data
6. **Send Invoice**: After payment, send invoice via WhatsApp

## Workflow

1. **Admin adds products** for specific dates
2. **Customers browse** and place orders
3. **Admin views orders** and prepares for delivery
4. **Admin updates status** as delivery progresses
5. **After delivery**, payment link is auto-generated
6. **Admin sends payment link** via WhatsApp (or copy link)
7. **Customer pays** and confirms payment
8. **Invoice is generated** and can be sent to customer

## Color Theme

- **Primary Color**: #3a8735 (Green)
- **Background**: White
- **Accent Colors**: Various shades of green for UI elements

## Database

The system uses **MongoDB Atlas** (cloud database):
- ✅ Free tier available (512MB storage)
- ✅ Automatic backups
- ✅ Scalable and reliable
- ✅ No local installation needed
- ✅ Secure cloud hosting

See [MONGODB_SETUP.md](./MONGODB_SETUP.md) for detailed setup instructions.

## Environment Variables

Create a `.env.local` file for production:

```env
JWT_SECRET=your-secret-key-here
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm start
   ```

3. For cloud deployment (Vercel, Netlify, etc.):
   - Connect your repository
   - Set environment variables
   - Deploy

## WhatsApp Integration

Since WhatsApp API requires business verification, the system provides:
- **Payment Link Copy**: Admin can copy payment link
- **WhatsApp Share**: Opens WhatsApp with pre-filled message
- **QR Code Display**: Shows QR code that can be shared

For full WhatsApp automation, integrate with:
- WhatsApp Business API
- Twilio WhatsApp API
- Other WhatsApp messaging services

## Support

For issues or questions, please check the code comments or create an issue in the repository.

## License

This project is created for FarmVeda business use.

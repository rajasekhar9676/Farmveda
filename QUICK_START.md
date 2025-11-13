# FarmVeda - Quick Start Guide

## 🚀 Getting Started

1. **Install Dependencies** (if not already done)
   ```bash
   cd farmveda
   npm install --legacy-peer-deps
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to: http://localhost:3000

## 👤 Default Admin Login

- **Mobile**: `1234567890`
- **Password**: `admin123`

⚠️ **Important**: Change the admin password after first login!

## 📱 How to Use

### For Customers:

1. **Register/Login** at http://localhost:3000
2. **Browse Products** - Select date to see available products
3. **Add to Cart** - Choose quantities
4. **Checkout** - Enter delivery address (Community, Apartment, Room No)
5. **Track Orders** - View order status
6. **Make Payment** - After delivery, use payment link from admin
7. **Download Invoice** - After payment completion

### For Admins:

1. **Login** at http://localhost:3000/admin/login
2. **Add Products**:
   - Go to "Add Product"
   - Enter: Name, Price, Quantity, Unit (Kilo/Pieces/Boxes), Available Date
   - Products appear to customers on selected date
3. **Manage Orders**:
   - View all orders in dashboard
   - Click "View Details" for full order info
   - Update status: Pending → Confirmed → Out for Delivery → Delivered
4. **After Delivery**:
   - Mark as "Delivered"
   - System auto-generates payment link & QR code
   - Copy link or click "Send via WhatsApp"
5. **Export Data**: Click "Export Excel" to download all orders
6. **Send Invoice**: After payment, send invoice via WhatsApp

## 🎨 Features Implemented

✅ Date-based product catalog
✅ Shopping cart with localStorage
✅ Order management with status tracking
✅ Payment link generation with QR codes
✅ WhatsApp integration (copy link / share)
✅ Excel export for all orders
✅ PDF invoice generation
✅ Beautiful UI with white & #3a8735 color theme
✅ Customer address management (Community, Apartment, Room No)
✅ Product units: Kilo, Pieces, Boxes
✅ Admin dashboard with statistics
✅ Order filtering and search

## 📁 Data Storage

All data is stored in JSON files in the `data/` folder:
- `users.json` - All users (customers & admin)
- `products.json` - All products
- `orders.json` - All orders

This folder is auto-created on first run.

## 🔧 Troubleshooting

**Issue**: TypeScript errors about missing modules
**Solution**: Run `npm install --legacy-peer-deps` and restart the dev server

**Issue**: Database not initializing
**Solution**: The `data/` folder will be created automatically. Make sure the app has write permissions.

**Issue**: Payment links not working
**Solution**: Make sure `NEXT_PUBLIC_BASE_URL` is set in `.env.local` for production

## 📝 Notes

- The system uses file-based JSON storage (perfect for small-medium businesses)
- Can easily migrate to PostgreSQL/MongoDB by updating `lib/db.ts`
- WhatsApp integration uses web links (for full automation, integrate WhatsApp Business API)
- All passwords are hashed using bcrypt
- JWT tokens stored in HTTP-only cookies for security

## 🎯 Next Steps

1. Test the complete workflow
2. Add more products
3. Create customer accounts
4. Process test orders
5. Export data to Excel
6. Generate invoices

Enjoy your automated order management system! 🎉


# Percetakan Sinode GMIT API

Backend API for Percetakan Sinode GMIT printing service.

## Database Schema

### User Table
- `id` (String) - Auth0 sub, manually created upon login
- `name` (String)
- `role` (String) - defaults to "customer"
- `orders` - Relation to Order table
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Order Table
- `id` (UUID)
- `userId` (String) - Foreign key to User
- `productId` (Integer) - References product from constants
- `price` (Float) - defaults to 0
- `status` (String)
- `orderSpecifications` (JSON) - Order details
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/category/:category` - Get products by category (print, outdoor, others)

### Users
- `POST /api/users` - Create or get user (for Auth0 login)
  ```json
  {
    "id": "auth0|123456",
    "name": "John Doe"
  }
  ```
- `GET /api/users/:id` - Get user by ID with their orders
- `PATCH /api/users/:id/role` - Update user role (admin only)
  ```json
  {
    "role": "admin"
  }
  ```

### Orders
- `POST /api/orders` - Create a new order
  ```json
  {
    "userId": "auth0|123456",
    "productId": 1,
    "price": 50000,
    "status": "pending",
    "orderSpecifications": {
      "quantity": 100,
      "size": "A4",
      "color": "full color"
    }
  }
  ```
- `GET /api/orders` - Get all orders
  - Query params: `userId`, `status`, `productId`
- `GET /api/orders/:id` - Get order by ID
- `PATCH /api/orders/:id` - Update order
  ```json
  {
    "price": 60000,
    "status": "processing"
  }
  ```
- `DELETE /api/orders/:id` - Delete order

## Available Products

14 products across 3 categories:
- **Print**: Print Biasa, Buku, Undangan, Sticker
- **Outdoor**: Spanduk/Baliho, Roll Banner, X-Banner, Neon Box, Krans Bunga, Batu Nisan
- **Others**: Stempel, Sablon Gelas, Sablon Piring, Sablon Baju

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env`:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/dbname
   ```

3. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npx prisma studio` - Open Prisma Studio to view/edit data
- `npx prisma migrate dev` - Create and apply migrations
- `npx prisma generate` - Generate Prisma Client

## CORS Configuration

Allowed origins:
- http://localhost:5173 (development)
- https://percetakan-sinode-gmit.vercel.app (production)

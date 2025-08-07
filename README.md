# Product Management System

A full-stack product management application with MongoDB Atlas integration deployed on Vercel.

## Features

- Display products in a responsive grid layout
- Manage products (add, edit, delete)
- Filter and sort products
- MongoDB Atlas integration for persistent data storage
- Serverless API with Express
- Responsive design for mobile and desktop

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB Atlas
- Deployment: Vercel

## Folder Structure

```
product-management-system/
├── api/
│   └── index.js              # Express API for MongoDB operations
├── public/                   # Static files served by Vercel
│   ├── app.js               # Frontend JavaScript
│   ├── index.html           # Main HTML file 
│   └── style.css            # CSS styles
├── .env.example             # Example environment variables
├── .gitignore               # Git ignore file
├── package.json             # Node.js dependencies
├── README.md                # Project documentation
└── vercel.json              # Vercel deployment configuration
```

## Deployment Instructions

### Prerequisites

1. MongoDB Atlas account (free tier available)
2. Vercel account (free tier available)
3. GitHub account

### Step 1: Set Up MongoDB Atlas

1. Create a MongoDB Atlas account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier is sufficient)
3. Create a database user with read/write permissions:
   - Go to Database Access > Add New Database User
   - Create a username and password (secure password recommended)
   - Set privileges to "Read and Write to Any Database"
4. Set up network access:
   - Go to Network Access > Add IP Address
   - Choose "Allow Access from Anywhere" for development (you can restrict this later)
5. Get your connection string:
   - Go to Clusters > Connect > Connect your application
   - Select "Node.js" and version "4.1 or later"
   - Copy the connection string
   - Replace `<username>`, `<password>`, and `<dbname>` with your credentials and "productManagement" as the database name

### Step 2: Deploy to Vercel

1. Fork or clone this repository to your GitHub account
2. Log in to Vercel and create a new project:
   - Go to [https://vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
3. Configure project settings:
   - In the project settings, add the following environment variable:
     - Name: `MONGODB_URI`
     - Value: Your MongoDB Atlas connection string from step 1
4. Deploy the project:
   - Click "Deploy" button
   - Vercel will build and deploy your application
5. Visit your new application at the Vercel-provided URL

### Testing Your Deployment

1. Navigate to your deployed application
2. Go to the "Management" page
3. Click the "Seed Database" button to populate with sample products
4. Test CRUD operations (Create, Read, Update, Delete)

## Local Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd product-management-system
   ```

2. Create a `.env` file in the root directory:
   ```
   MONGODB_URI=your_mongodb_connection_string
   PORT=3000
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Data Structure

The product schema in MongoDB includes:

```javascript
{
  name: String,          // Product name
  description: String,   // Product description
  price: Number,         // Product price
  category: String,      // Product category
  stock: Number,         // Stock quantity
  imageUrl: String,      // URL to product image
  dateAdded: Date        // Date product was added
}
```

## API Endpoints

- `GET /api/products` - Get all products
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product
- `GET /api/seed` - Seed the database with sample products

## License

MIT

## Author

Created by Tasrif Ahmed Mohsin on 2025-08-07
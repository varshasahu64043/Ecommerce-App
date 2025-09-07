import { neon } from "@neondatabase/serverless"

// Database connection
const sql = neon(process.env.DATABASE_URL!)

export { sql }

// Database types
export interface User {
  id: number
  email: string
  password_hash: string
  first_name: string
  last_name: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  description: string
  image_url: string
  created_at: string
}

export interface Product {
  id: number
  name: string
  description: string
  price: number
  original_price?: number
  category_id: number
  image_url: string
  stock_quantity: number
  is_active: boolean
  rating: number
  review_count: number
  created_at: string
  updated_at: string
  category?: Category
}

export interface CartItem {
  id: number
  user_id: number
  product_id: number
  quantity: number
  created_at: string
  updated_at: string
  product?: Product
}

export interface Order {
  id: number
  user_id: number
  total_amount: number
  status: string
  shipping_address: string
  created_at: string
}

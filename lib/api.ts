"use client"

// API utility functions for frontend
export interface Product {
  id: number
  name: string
  description: string
  price: number
  originalPrice?: number
  imageUrl: string
  stockQuantity: number
  rating: number
  reviewCount: number
  category: {
    map(arg0: (cat: any) => any): unknown
    id: number
    name: string
  }
  createdAt: string
  updatedAt: string
}

export interface ProductsResponse {
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface Category {
  id: number
  name: string
  description: string
  imageUrl: string
  productCount?: number
  createdAt: string
}

export interface ProductFilters {
  category?: string
  minPrice?: string
  maxPrice?: string
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  page?: number
  limit?: number
}

export async function fetchProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value.toString())
    }
  })

  const response = await fetch(`/api/products?${params.toString()}`)
  if (!response.ok) {
    throw new Error("Failed to fetch products")
  }

  return response.json()
}

export async function fetchProduct(id: number): Promise<{ product: Product & { relatedProducts: Product[] } }> {
  const response = await fetch(`/api/products/${id}`)
  if (!response.ok) {
    throw new Error("Failed to fetch product")
  }

  return response.json()
}

export async function fetchCategories(includeProductCount = false): Promise<{ categories: Category[] }> {
  const params = includeProductCount ? "?includeProductCount=true" : ""
  const response = await fetch(`/api/categories${params}`)
  if (!response.ok) {
    throw new Error("Failed to fetch categories")
  }

  return response.json()
}

export async function searchProducts(
  query: string,
  limit = 10,
): Promise<{ suggestions: Array<{ id: number; name: string; price: number; imageUrl: string }> }> {
  const params = new URLSearchParams({ q: query, limit: limit.toString() })
  const response = await fetch(`/api/products/search?${params.toString()}`)
  if (!response.ok) {
    throw new Error("Failed to search products")
  }

  return response.json()
}

export async function fetchFeaturedProducts(limit = 8): Promise<{ products: Product[] }> {
  const params = new URLSearchParams({ limit: limit.toString() })
  const response = await fetch(`/api/products/featured?${params.toString()}`)
  if (!response.ok) {
    throw new Error("Failed to fetch featured products")
  }

  return response.json()
}

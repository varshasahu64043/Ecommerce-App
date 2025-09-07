import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Number.parseInt(searchParams.get("limit") || "8")

    // Get featured products (highest rated with good review count)
    const featuredProducts = await sql`
      SELECT 
        p.id, p.name, p.description, p.price, p.original_price,
        p.image_url, p.stock_quantity, p.rating, p.review_count,
        c.id as category_id, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true 
        AND p.rating >= 4.0 
        AND p.review_count >= 100
      ORDER BY (p.rating * LOG(p.review_count + 1)) DESC
      LIMIT ${limit}
    `

    const formattedProducts = featuredProducts.map((product: any) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number.parseFloat(product.price),
      originalPrice: product.original_price ? Number.parseFloat(product.original_price) : null,
      imageUrl: product.image_url,
      stockQuantity: product.stock_quantity,
      rating: Number.parseFloat(product.rating),
      reviewCount: product.review_count,
      category: {
        id: product.category_id,
        name: product.category_name,
      },
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    }))

    return NextResponse.json({ products: formattedProducts })
  } catch (error) {
    console.error("Get featured products error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

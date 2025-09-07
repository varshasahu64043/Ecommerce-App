import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = Number.parseInt(params.id)

    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    const products = await sql`
      SELECT 
        p.id, p.name, p.description, p.price, p.original_price,
        p.image_url, p.stock_quantity, p.rating, p.review_count,
        p.created_at, p.updated_at,
        c.id as category_id, c.name as category_name, c.description as category_description
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ${productId} AND p.is_active = true
    `

    if (products.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const product = products[0]

    // Get related products from the same category
    const relatedProducts = await sql`
      SELECT id, name, price, original_price, image_url, rating, review_count
      FROM products
      WHERE category_id = ${product.category_id} 
        AND id != ${productId} 
        AND is_active = true
      ORDER BY rating DESC
      LIMIT 4
    `

    const formattedProduct = {
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
        description: product.category_description,
      },
      relatedProducts: relatedProducts.map((rp: any) => ({
        id: rp.id,
        name: rp.name,
        price: Number.parseFloat(rp.price),
        originalPrice: rp.original_price ? Number.parseFloat(rp.original_price) : null,
        imageUrl: rp.image_url,
        rating: Number.parseFloat(rp.rating),
        reviewCount: rp.review_count,
      })),
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    }

    return NextResponse.json({ product: formattedProduct })
  } catch (error) {
    console.error("Get product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

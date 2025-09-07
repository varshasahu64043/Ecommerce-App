import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { withAuth } from "@/lib/middleware"

// Get user's cart items
export const GET = withAuth(async (req: NextRequest, userId: number) => {
  try {
    const cartItems = await sql`
      SELECT 
        ci.id, ci.quantity, ci.created_at, ci.updated_at,
        p.id as product_id, p.name, p.price, p.original_price, 
        p.image_url, p.stock_quantity,
        c.name as category_name
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ci.user_id = ${userId} AND p.is_active = true
      ORDER BY ci.created_at DESC
    `

    const formattedItems = cartItems.map((item: any) => ({
      id: item.id,
      quantity: item.quantity,
      product: {
        id: item.product_id,
        name: item.name,
        price: Number.parseFloat(item.price),
        originalPrice: item.original_price ? Number.parseFloat(item.original_price) : null,
        imageUrl: item.image_url,
        stockQuantity: item.stock_quantity,
        categoryName: item.category_name,
      },
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }))

    // Calculate totals
    const subtotal = formattedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    const totalItems = formattedItems.reduce((sum, item) => sum + item.quantity, 0)

    return NextResponse.json({
      items: formattedItems,
      summary: {
        subtotal: Number.parseFloat(subtotal.toFixed(2)),
        totalItems,
        itemCount: formattedItems.length,
      },
    })
  } catch (error) {
    console.error("Get cart error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

// Add item to cart or update quantity
export const POST = withAuth(async (req: NextRequest, userId: number) => {
  try {
    const { productId, quantity = 1 } = await req.json()

    if (!productId || quantity < 1) {
      return NextResponse.json({ error: "Invalid product ID or quantity" }, { status: 400 })
    }

    // Check if product exists and is active
    const products = await sql`
      SELECT id, name, stock_quantity, is_active
      FROM products 
      WHERE id = ${productId}
    `

    if (products.length === 0 || !products[0].is_active) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const product = products[0]

    if (quantity > product.stock_quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 })
    }

    // Check if item already exists in cart
    const existingItems = await sql`
      SELECT id, quantity
      FROM cart_items
      WHERE user_id = ${userId} AND product_id = ${productId}
    `

    if (existingItems.length > 0) {
      // Update existing item
      const newQuantity = existingItems[0].quantity + quantity

      if (newQuantity > product.stock_quantity) {
        return NextResponse.json({ error: "Insufficient stock" }, { status: 400 })
      }

      await sql`
        UPDATE cart_items 
        SET quantity = ${newQuantity}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existingItems[0].id}
      `
    } else {
      // Add new item
      await sql`
        INSERT INTO cart_items (user_id, product_id, quantity)
        VALUES (${userId}, ${productId}, ${quantity})
      `
    }

    return NextResponse.json({ message: "Item added to cart successfully" })
  } catch (error) {
    console.error("Add to cart error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

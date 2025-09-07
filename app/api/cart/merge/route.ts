import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { withAuth } from "@/lib/middleware"

// Merge guest cart with user cart when logging in
export const POST = withAuth(async (req: NextRequest, userId: number) => {
  try {
    const { guestCartItems } = await req.json()

    if (!Array.isArray(guestCartItems) || guestCartItems.length === 0) {
      return NextResponse.json({ message: "No guest cart items to merge" })
    }

    // Process each guest cart item
    for (const guestItem of guestCartItems) {
      const { productId, quantity } = guestItem

      if (!productId || !quantity || quantity < 1) continue

      // Check if product exists and is active
      const products = await sql`
        SELECT id, stock_quantity, is_active
        FROM products 
        WHERE id = ${productId}
      `

      if (products.length === 0 || !products[0].is_active) continue

      const product = products[0]

      // Check if item already exists in user's cart
      const existingItems = await sql`
        SELECT id, quantity
        FROM cart_items
        WHERE user_id = ${userId} AND product_id = ${productId}
      `

      if (existingItems.length > 0) {
        // Update existing item (add quantities)
        const newQuantity = Math.min(existingItems[0].quantity + quantity, product.stock_quantity)

        await sql`
          UPDATE cart_items 
          SET quantity = ${newQuantity}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${existingItems[0].id}
        `
      } else {
        // Add new item
        const finalQuantity = Math.min(quantity, product.stock_quantity)

        await sql`
          INSERT INTO cart_items (user_id, product_id, quantity)
          VALUES (${userId}, ${productId}, ${finalQuantity})
        `
      }
    }

    return NextResponse.json({ message: "Guest cart merged successfully" })
  } catch (error) {
    console.error("Merge cart error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

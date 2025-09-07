import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { withAuth } from "@/lib/middleware"

// Update cart item quantity
export const PUT = withAuth(async (req: NextRequest, userId: number, { params }: { params: { id: string } }) => {
  try {
    const cartItemId = Number.parseInt(params.id)
    const { quantity } = await req.json()

    if (isNaN(cartItemId) || quantity < 1) {
      return NextResponse.json({ error: "Invalid cart item ID or quantity" }, { status: 400 })
    }

    // Verify cart item belongs to user and get product info
    const cartItems = await sql`
      SELECT ci.id, ci.product_id, p.stock_quantity
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.id = ${cartItemId} AND ci.user_id = ${userId}
    `

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 })
    }

    const cartItem = cartItems[0]

    if (quantity > cartItem.stock_quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 })
    }

    // Update quantity
    await sql`
      UPDATE cart_items 
      SET quantity = ${quantity}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${cartItemId}
    `

    return NextResponse.json({ message: "Cart item updated successfully" })
  } catch (error) {
    console.error("Update cart item error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

// Remove cart item
export const DELETE = withAuth(async (req: NextRequest, userId: number, { params }: { params: { id: string } }) => {
  try {
    const cartItemId = Number.parseInt(params.id)

    if (isNaN(cartItemId)) {
      return NextResponse.json({ error: "Invalid cart item ID" }, { status: 400 })
    }

    // Verify cart item belongs to user
    const result = await sql`
      DELETE FROM cart_items 
      WHERE id = ${cartItemId} AND user_id = ${userId}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Item removed from cart successfully" })
  } catch (error) {
    console.error("Remove cart item error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

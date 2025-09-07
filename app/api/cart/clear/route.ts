import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { withAuth } from "@/lib/middleware"

// Clear all items from user's cart
export const DELETE = withAuth(async (req: NextRequest, userId: number) => {
  try {
    await sql`
      DELETE FROM cart_items 
      WHERE user_id = ${userId}
    `

    return NextResponse.json({ message: "Cart cleared successfully" })
  } catch (error) {
    console.error("Clear cart error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

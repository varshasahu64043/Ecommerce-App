import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    // Get product suggestions based on name
    const suggestions = await sql`
      SELECT id, name, price, image_url
      FROM products
      WHERE name ILIKE ${`%${query}%`} 
        AND is_active = true
      ORDER BY 
        CASE 
          WHEN name ILIKE ${`${query}%`} THEN 1
          WHEN name ILIKE ${`%${query}%`} THEN 2
          ELSE 3
        END,
        rating DESC
      LIMIT ${limit}
    `

    const formattedSuggestions = suggestions.map((product: any) => ({
      id: product.id,
      name: product.name,
      price: Number.parseFloat(product.price),
      imageUrl: product.image_url,
    }))

    return NextResponse.json({ suggestions: formattedSuggestions })
  } catch (error) {
    console.error("Search products error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

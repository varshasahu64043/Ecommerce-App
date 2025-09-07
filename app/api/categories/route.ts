import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const includeProductCount = searchParams.get("includeProductCount") === "true"

    let categories

    if (includeProductCount) {
      // Get categories with product counts
      categories = await sql`
        SELECT 
          c.id, c.name, c.description, c.image_url, c.created_at,
          COUNT(p.id) as product_count
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
        GROUP BY c.id, c.name, c.description, c.image_url, c.created_at
        ORDER BY c.name ASC
      `
    } else {
      // Get categories without product counts
      categories = await sql`
        SELECT id, name, description, image_url, created_at
        FROM categories
        ORDER BY name ASC
      `
    }

    const formattedCategories = categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      imageUrl: category.image_url,
      productCount: includeProductCount ? Number.parseInt(category.product_count) : undefined,
      createdAt: category.created_at,
    }))

    return NextResponse.json({ categories: formattedCategories })
  } catch (error) {
    console.error("Get categories error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

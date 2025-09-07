import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    // Extract query parameters
    const category = searchParams.get("category")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const offset = (page - 1) * limit

  // Build dynamic query
  const whereConditions = ["p.is_active = true"]
  // Keep filter params separate from pagination params
  const filterParams: any[] = []
  let paramIndex = 1

    if (category) {
  whereConditions.push(`p.category_id = $${paramIndex}`)
  filterParams.push(Number.parseInt(category))
      paramIndex++
    }

    if (minPrice) {
  whereConditions.push(`p.price >= $${paramIndex}`)
  filterParams.push(Number.parseFloat(minPrice))
      paramIndex++
    }

    if (maxPrice) {
  whereConditions.push(`p.price <= $${paramIndex}`)
  filterParams.push(Number.parseFloat(maxPrice))
      paramIndex++
    }

    if (search) {
  whereConditions.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`)
  filterParams.push(`%${search}%`)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

    // Validate sort column
    const validSortColumns = ["name", "price", "rating", "created_at"]
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : "created_at"
    const order = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC"

    // Fast path: no filters (homepage / all products)
    if (!category && !minPrice && !maxPrice && !search) {
      const rows = await sql`
        SELECT 
          p.id, p.name, p.description, p.price, p.original_price,
          p.image_url, p.stock_quantity, p.rating, p.review_count,
          p.created_at, p.updated_at,
          c.id as category_id, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = true
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `

      const countRows = await sql`
        SELECT COUNT(*) as total
        FROM products p
        WHERE p.is_active = true
      `
      const total = Number(countRows?.[0]?.total ?? 0)

      const formattedProducts = rows.map((product: any) => ({
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

      return NextResponse.json({
        products: formattedProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      })
    }

    // Fast path: category-only filter
    if (category && !minPrice && !maxPrice && !search) {
      const catId = Number.parseInt(category)
      const rows = await sql`
        SELECT 
          p.id, p.name, p.description, p.price, p.original_price,
          p.image_url, p.stock_quantity, p.rating, p.review_count,
          p.created_at, p.updated_at,
          c.id as category_id, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = true AND p.category_id = ${catId}
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `

      const countRows = await sql`
        SELECT COUNT(*) as total
        FROM products p
        WHERE p.is_active = true AND p.category_id = ${catId}
      `
      const total = Number(countRows?.[0]?.total ?? 0)

      const formattedProducts = rows.map((product: any) => ({
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

      return NextResponse.json({
        products: formattedProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      })
    }

    // Fast path: no filters (homepage/all products)
    if (!category && !minPrice && !maxPrice && !search) {
      const rows = await sql`
        SELECT 
          p.id, p.name, p.description, p.price, p.original_price,
          p.image_url, p.stock_quantity, p.rating, p.review_count,
          p.created_at, p.updated_at,
          c.id as category_id, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = true
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `

      const countRows = await sql`
        SELECT COUNT(*) as total
        FROM products p
        WHERE p.is_active = true
      `
      const total = Number(countRows?.[0]?.total ?? 0)

      const formattedProducts = rows.map((product: any) => ({
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

      return NextResponse.json({
        products: formattedProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      })
    }

    // Fast path: category-only filtering using tagged SQL (safer and reliable)
    if (category && !minPrice && !maxPrice && !search) {
      const catId = Number.parseInt(category)
      const products = await sql`
        SELECT 
          p.id, p.name, p.description, p.price, p.original_price,
          p.image_url, p.stock_quantity, p.rating, p.review_count,
          p.created_at, p.updated_at,
          c.id as category_id, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = true AND p.category_id = ${catId}
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `

      const countRows = await sql`
        SELECT COUNT(*) as total
        FROM products p
        WHERE p.is_active = true AND p.category_id = ${catId}
      `
      const total = Number(countRows?.[0]?.total ?? 0)

      const formattedProducts = products.map((product: any) => ({
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

      return NextResponse.json({
        products: formattedProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      })
    }

    // General path: dynamic filtering
    // Get products with category information
    const productsQuery = `
      SELECT 
        p.id, p.name, p.description, p.price, p.original_price,
        p.image_url, p.stock_quantity, p.rating, p.review_count,
        p.created_at, p.updated_at,
        c.id as category_id, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.${sortColumn} ${order}
      LIMIT $${filterParams.length + 1} OFFSET $${filterParams.length + 2}
    `

  const productsParams = [...filterParams, limit, offset]
  const productsRes: any = await (sql as any).unsafe(productsQuery, productsParams)
  const products = Array.isArray(productsRes) ? productsRes : productsRes?.rows ?? []

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      ${whereClause}
    `

  const countRes: any = await (sql as any).unsafe(countQuery, filterParams)
  const countRows = Array.isArray(countRes) ? countRes : countRes?.rows ?? []
  const total = Number(countRows?.[0]?.total ?? 0)

    // Debug logs to help diagnose empty responses
    console.log('[GET /api/products] params', {
      category,
      minPrice,
      maxPrice,
      search,
      sortBy: sortColumn,
      order,
      page,
      limit,
      offset,
      whereClause,
      filterParams,
    })
    console.log('[GET /api/products] results', { productsCount: products.length, total })

    // Format response
    const formattedProducts = products.map((product: any) => ({
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

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Get products error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

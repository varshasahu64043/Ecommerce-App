"use client"

import { useEffect, useState } from "react"
import { ProductCard } from "./product-card"
import { Button } from "@/components/ui/button"
import { fetchProducts, type Product, type ProductFilters } from "@/lib/api"

interface ProductGridProps {
  filters?: ProductFilters
  title?: string
  showLoadMore?: boolean
}

export function ProductGrid({ filters = {}, title, showLoadMore = true }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    hasNext: false,
    total: 0,
  })

  const loadProducts = async (page = 1, append = false) => {
    try {
      if (page === 1) setLoading(true)
      else setLoadingMore(true)

      const response = await fetchProducts({ ...filters, page, limit: 12 })

      if (append) {
        setProducts((prev) => [...prev, ...response.products])
      } else {
        setProducts(response.products)
      }

      setPagination({
        page: response.pagination.page,
        hasNext: response.pagination.hasNext,
        total: response.pagination.total,
      })
    } catch (error) {
      console.error("Failed to load products:", error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    loadProducts(1, false)
  }, [JSON.stringify(filters)])

  const handleLoadMore = () => {
    loadProducts(pagination.page + 1, true)
  }

  if (loading) {
    return (
      <div>
        {title && <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg aspect-[3/4] animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <span className="text-sm text-gray-500">{pagination.total} products</span>
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {showLoadMore && pagination.hasNext && (
            <div className="text-center mt-8">
              <Button onClick={handleLoadMore} disabled={loadingMore} variant="outline" size="lg">
                {loadingMore ? "Loading..." : "Load More Products"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

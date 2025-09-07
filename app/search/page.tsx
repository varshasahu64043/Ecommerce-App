"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Search, Filter, Grid, List } from "lucide-react"
import { Header } from "@/components/header"
import { ProductFilters } from "@/components/product-filters"
import { ProductGrid } from "@/components/product-grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import type { ProductFilters as ProductFiltersType } from "@/lib/api"

function SearchContent() {
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<ProductFiltersType>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    const query = searchParams.get("q")
    const category = searchParams.get("category")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const sortBy = searchParams.get("sortBy")
    const sortOrder = searchParams.get("sortOrder") as "asc" | "desc"

    const newFilters: ProductFiltersType = {}
    if (query) {
      newFilters.search = query
      setSearchQuery(query)
    }
    if (category) newFilters.category = category
    if (minPrice) newFilters.minPrice = minPrice
    if (maxPrice) newFilters.maxPrice = maxPrice
    if (sortBy) newFilters.sortBy = sortBy
    if (sortOrder) newFilters.sortOrder = sortOrder

    setFilters(newFilters)
  }, [searchParams])

  const handleFiltersChange = (newFilters: ProductFiltersType) => {
    setFilters(newFilters)

    // Update URL
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, value.toString())
      }
    })

    const newUrl = `/search${params.toString() ? `?${params.toString()}` : ""}`
    window.history.replaceState({}, "", newUrl)
  }

  const handleClearFilters = () => {
    setFilters({})
    setSearchQuery("")
    window.history.replaceState({}, "", "/search")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      handleFiltersChange({ ...filters, search: searchQuery.trim() })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">
            {filters.search ? `Search: "${filters.search}"` : "All Products"}
          </span>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-2xl">
            <Input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-12 h-12 text-base"
            />
            <Button type="submit" size="sm" className="absolute right-1 top-1 h-10 px-4">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block">
            <ProductFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden gap-2 bg-transparent">
                      <Filter className="h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <ProductFilters
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        onClearFilters={handleClearFilters}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                {filters.search && (
                  <Badge variant="secondary" className="hidden sm:inline-flex">
                    Showing results for "{filters.search}"
                  </Badge>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Products */}
            <ProductGrid filters={filters} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  )
}

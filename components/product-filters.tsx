"use client"

import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, X } from "lucide-react"
import { fetchCategories, type Category } from "@/lib/api"

interface ProductFiltersProps {
  filters: any
  onFiltersChange: (filters: any) => void
  onClearFilters: () => void
}

export function ProductFilters({ filters, onFiltersChange, onClearFilters }: ProductFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [priceRange, setPriceRange] = useState([0, 1000])

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { categories } = await fetchCategories(true)
        setCategories(categories)
      } catch (error) {
        console.error("Failed to load categories:", error)
      }
    }

    loadCategories()
  }, [])

  useEffect(() => {
    const minPrice = filters.minPrice ? Number.parseFloat(filters.minPrice) : 0
    const maxPrice = filters.maxPrice ? Number.parseFloat(filters.maxPrice) : 1000
    setPriceRange([minPrice, maxPrice])
  }, [filters.minPrice, filters.maxPrice])

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value)
    onFiltersChange({
      ...filters,
      minPrice: value[0] > 0 ? value[0].toString() : undefined,
      maxPrice: value[1] < 1000 ? value[1].toString() : undefined,
    })
  }

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      onFiltersChange({ ...filters, category: categoryId })
    } else {
      onFiltersChange({ ...filters, category: undefined })
    }
  }

  const handleSortChange = (sortBy: string, sortOrder: "asc" | "desc") => {
    onFiltersChange({ ...filters, sortBy, sortOrder })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.category) count++
    if (filters.minPrice || filters.maxPrice) count++
    if (filters.search) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="space-y-6">
      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Active Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-8 px-2 text-xs">
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="secondary" className="gap-1">
                  Search: {filters.search}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => onFiltersChange({ ...filters, search: undefined })}
                  />
                </Badge>
              )}
              {filters.category && (
                <Badge variant="secondary" className="gap-1">
                  Category: {categories.find((c) => c.id.toString() === filters.category)?.name}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => onFiltersChange({ ...filters, category: undefined })}
                  />
                </Badge>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <Badge variant="secondary" className="gap-1">
                  Price: ${filters.minPrice || 0} - ${filters.maxPrice || 1000}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => onFiltersChange({ ...filters, minPrice: undefined, maxPrice: undefined })}
                  />
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sort Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Sort By</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={filters.sortBy === "price" && filters.sortOrder === "asc" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSortChange("price", "asc")}
              className="text-xs"
            >
              Price: Low to High
            </Button>
            <Button
              variant={filters.sortBy === "price" && filters.sortOrder === "desc" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSortChange("price", "desc")}
              className="text-xs"
            >
              Price: High to Low
            </Button>
            <Button
              variant={filters.sortBy === "rating" && filters.sortOrder === "desc" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSortChange("rating", "desc")}
              className="text-xs"
            >
              Highest Rated
            </Button>
            <Button
              variant={filters.sortBy === "created_at" && filters.sortOrder === "desc" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSortChange("created_at", "desc")}
              className="text-xs"
            >
              Newest First
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Price Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={handlePriceChange}
            max={1000}
            min={0}
            step={10}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={filters.category === category.id.toString()}
                onCheckedChange={(checked) => handleCategoryChange(category.id.toString(), checked as boolean)}
              />
              <label
                htmlFor={`category-${category.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
              >
                {category.name}
                {category.productCount !== undefined && (
                  <span className="text-gray-500 ml-1">({category.productCount})</span>
                )}
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Rating Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Customer Rating</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">& Up</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { fetchCategories, type Category } from "@/lib/api"

export function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { categories } = await fetchCategories(true)
        setCategories(categories)
      } catch (error) {
        console.error("Failed to load categories:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg aspect-square animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/category/${category.id}`}
          className="group bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 overflow-hidden"
        >
          <div className="aspect-square relative overflow-hidden bg-gray-50">
            <Image
              src={category.imageUrl || "/placeholder.svg"}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
          <div className="p-3 text-center">
            <h3 className="font-medium text-gray-900 text-sm mb-1">{category.name}</h3>
            {category.productCount !== undefined && (
              <p className="text-xs text-gray-500">{category.productCount} products</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}

"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

export default function CartPage() {
  const { items, summary, updateQuantity, removeItem, clearCart, loading } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set())

  const handleQuantityChange = async (itemId: number, productId: number, newQuantity: number) => {
    if (newQuantity < 1) return

    setUpdatingItems((prev) => new Set(prev).add(itemId || productId))

    try {
      await updateQuantity(itemId || productId, newQuantity)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update quantity",
        variant: "destructive",
      })
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(itemId || productId)
        return newSet
      })
    }
  }

  const handleRemoveItem = async (itemId: number, productId: number, productName: string) => {
    try {
      await removeItem(itemId || productId)
      toast({
        title: "Item removed",
        description: `${productName} has been removed from your cart.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove item",
        variant: "destructive",
      })
    }
  }

  const handleClearCart = async () => {
    try {
      await clearCart()
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to clear cart",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Shopping Cart</span>
        </div>

        {items.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link href="/">
              <Button size="lg" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Shopping Cart ({summary.totalItems} items)</h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCart}
                  className="text-red-600 hover:text-red-700 bg-transparent"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cart
                </Button>
              </div>

              <div className="space-y-4">
                {items.map((item) => {
                  const itemKey = item.id || item.product.id
                  const isUpdating = updatingItems.has(itemKey)

                  return (
                    <Card key={itemKey}>
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={item.product.imageUrl || "/placeholder.svg"}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium text-gray-900 line-clamp-2">{item.product.name}</h3>
                                <p className="text-sm text-gray-500">{item.product.categoryName}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(item.id || 0, item.product.id, item.product.name)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="flex items-center justify-between">
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-3">
                                <div className="flex items-center border border-gray-300 rounded-lg">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleQuantityChange(item.id || 0, item.product.id, item.quantity - 1)
                                    }
                                    disabled={item.quantity <= 1 || isUpdating}
                                    className="h-8 w-8 p-0 hover:bg-gray-100"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                                    {isUpdating ? "..." : item.quantity}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleQuantityChange(item.id || 0, item.product.id, item.quantity + 1)
                                    }
                                    disabled={item.quantity >= item.product.stockQuantity || isUpdating}
                                    className="h-8 w-8 p-0 hover:bg-gray-100"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                                {item.product.stockQuantity < 10 && (
                                  <span className="text-xs text-red-600">Only {item.product.stockQuantity} left</span>
                                )}
                              </div>

                              {/* Price */}
                              <div className="text-right">
                                <div className="font-bold text-lg text-gray-900">
                                  ${(item.product.price * item.quantity).toFixed(2)}
                                </div>
                                {item.product.originalPrice && (
                                  <div className="text-sm text-gray-500 line-through">
                                    ${(item.product.originalPrice * item.quantity).toFixed(2)}
                                  </div>
                                )}
                                <div className="text-xs text-gray-500">${item.product.price.toFixed(2)} each</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal ({summary.totalItems} items)</span>
                      <span className="font-medium">${summary.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">${(summary.subtotal * 0.08).toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between text-lg font-bold text-gray-900 mb-6">
                    <span>Total</span>
                    <span>${(summary.subtotal * 1.08).toFixed(2)}</span>
                  </div>

                  <div className="space-y-3">
                    <Link href="/checkout">
                      <Button className="w-full h-12 text-base">Proceed to Checkout</Button>
                    </Link>
                    <Link href="/">
                      <Button variant="outline" className="w-full h-12 text-base gap-2 bg-transparent">
                        <ArrowLeft className="w-4 h-4" />
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>

                  {!user && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <Link href="/login" className="font-medium hover:underline">
                          Sign in
                        </Link>{" "}
                        to save your cart and get personalized recommendations.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

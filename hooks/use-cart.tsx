"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useAuth } from "./use-auth"

interface CartProduct {
  id: number
  name: string
  price: number
  originalPrice?: number
  imageUrl: string
  stockQuantity: number
  categoryName: string
}

interface CartItem {
  id?: number // undefined for guest cart items
  quantity: number
  product: CartProduct
  createdAt?: string
  updatedAt?: string
}

interface CartSummary {
  subtotal: number
  totalItems: number
  itemCount: number
}

interface CartContextType {
  items: CartItem[]
  summary: CartSummary
  loading: boolean
  addToCart: (productId: number, quantity?: number) => Promise<void>
  updateQuantity: (itemId: number, quantity: number) => Promise<void>
  removeItem: (itemId: number) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [summary, setSummary] = useState<CartSummary>({ subtotal: 0, totalItems: 0, itemCount: 0 })
  const [loading, setLoading] = useState(false)
  const { user, token } = useAuth()

  // Load cart on mount and when auth state changes
  useEffect(() => {
    if (user && token) {
      // User is logged in, merge guest cart and load user cart
      mergeGuestCartAndLoad()
    } else {
      // Load guest cart from localStorage
      loadGuestCart()
    }
  }, [user, token])

  const loadGuestCart = () => {
    try {
      const guestCart = localStorage.getItem("guest_cart")
      if (guestCart) {
        const guestItems = JSON.parse(guestCart)
        setItems(guestItems)
        calculateSummary(guestItems)
      } else {
        setItems([])
        setSummary({ subtotal: 0, totalItems: 0, itemCount: 0 })
      }
    } catch (error) {
      console.error("Failed to load guest cart:", error)
      setItems([])
      setSummary({ subtotal: 0, totalItems: 0, itemCount: 0 })
    }
  }

  const saveGuestCart = (cartItems: CartItem[]) => {
    try {
      localStorage.setItem("guest_cart", JSON.stringify(cartItems))
    } catch (error) {
      console.error("Failed to save guest cart:", error)
    }
  }

  const mergeGuestCartAndLoad = async () => {
    try {
      const guestCart = localStorage.getItem("guest_cart")

      if (guestCart) {
        const guestItems = JSON.parse(guestCart)

        if (guestItems.length > 0) {
          // Merge guest cart with user cart
          await fetch("/api/cart/merge", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              guestCartItems: guestItems.map((item: CartItem) => ({
                productId: item.product.id,
                quantity: item.quantity,
              })),
            }),
          })

          // Clear guest cart
          localStorage.removeItem("guest_cart")
        }
      }

      // Load user cart
      await loadUserCart()
    } catch (error) {
      console.error("Failed to merge guest cart:", error)
      await loadUserCart()
    }
  }

  const loadUserCart = async () => {
    if (!token) return

    try {
      setLoading(true)
      const response = await fetch("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setItems(data.items)
        setSummary(data.summary)
      }
    } catch (error) {
      console.error("Failed to load user cart:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateSummary = (cartItems: CartItem[]) => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    setSummary({
      subtotal: Number.parseFloat(subtotal.toFixed(2)),
      totalItems,
      itemCount: cartItems.length,
    })
  }

  const addToCart = async (productId: number, quantity = 1) => {
    if (user && token) {
      // Add to user cart via API
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to add item to cart")
      }

      await refreshCart()
    } else {
      // Add to guest cart in localStorage
      try {
        // Fetch product details
        const productResponse = await fetch(`/api/products/${productId}`)
        if (!productResponse.ok) {
          throw new Error("Product not found")
        }

        const { product } = await productResponse.json()

        const updatedItems = [...items]
        const existingItemIndex = updatedItems.findIndex((item) => item.product.id === productId)

        if (existingItemIndex >= 0) {
          // Update existing item
          const newQuantity = updatedItems[existingItemIndex].quantity + quantity
          if (newQuantity > product.stockQuantity) {
            throw new Error("Insufficient stock")
          }
          updatedItems[existingItemIndex].quantity = newQuantity
        } else {
          // Add new item
          if (quantity > product.stockQuantity) {
            throw new Error("Insufficient stock")
          }

          updatedItems.push({
            quantity,
            product: {
              id: product.id,
              name: product.name,
              price: product.price,
              originalPrice: product.originalPrice,
              imageUrl: product.imageUrl,
              stockQuantity: product.stockQuantity,
              categoryName: product.category?.name ?? 'Uncategorized',
            },
          })
        }

        setItems(updatedItems)
        calculateSummary(updatedItems)
        saveGuestCart(updatedItems)
      } catch (error) {
        throw error
      }
    }
  }

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (user && token) {
      // Update user cart via API
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update item")
      }

      await refreshCart()
    } else {
      // Update guest cart
      const updatedItems = items.map((item) => (item.product.id === itemId ? { ...item, quantity } : item))

      setItems(updatedItems)
      calculateSummary(updatedItems)
      saveGuestCart(updatedItems)
    }
  }

  const removeItem = async (itemId: number) => {
    if (user && token) {
      // Remove from user cart via API
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to remove item")
      }

      await refreshCart()
    } else {
      // Remove from guest cart
      const updatedItems = items.filter((item) => item.product.id !== itemId)
      setItems(updatedItems)
      calculateSummary(updatedItems)
      saveGuestCart(updatedItems)
    }
  }

  const clearCart = async () => {
    if (user && token) {
      // Clear user cart via API
      const response = await fetch("/api/cart/clear", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to clear cart")
      }

      await refreshCart()
    } else {
      // Clear guest cart
      setItems([])
      setSummary({ subtotal: 0, totalItems: 0, itemCount: 0 })
      localStorage.removeItem("guest_cart")
    }
  }

  const refreshCart = async () => {
    if (user && token) {
      await loadUserCart()
    } else {
      loadGuestCart()
    }
  }

  return (
    <CartContext.Provider
      value={{
        items,
        summary,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

"use client"

import Link from "next/link"
import { CheckCircle, Package, Truck, Home } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function OrderSuccessPage() {
  const orderNumber = `ORD-${Date.now().toString().slice(-8)}`

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-lg text-gray-600 mb-8">
            Thank you for your purchase. Your order has been confirmed and will be shipped soon.
          </p>

          {/* Order Details */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Order Number</h3>
                  <p className="text-gray-600 font-mono">{orderNumber}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Estimated Delivery</h3>
                  <p className="text-gray-600">3-5 business days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4">
              <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Order Processing</h3>
              <p className="text-sm text-gray-600">We're preparing your items for shipment</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Shipping</h3>
              <p className="text-sm text-gray-600">Your order will be shipped within 24 hours</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                <Home className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Delivery</h3>
              <p className="text-sm text-gray-600">Delivered to your doorstep</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" className="w-full sm:w-auto">
                Continue Shopping
              </Button>
            </Link>
            <Link href="/orders">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                View Order Details
              </Button>
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              A confirmation email has been sent to your email address with order details and tracking information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client";

import React from 'react';

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      {/* Navbar Skeleton */}
      <div className="bg-white shadow-sm">
        <div className="h-16 bg-gradient-to-r from-yellow-200 to-yellow-300"></div>
        <div className="h-20 bg-white border-b border-gray-100"></div>
      </div>
      
      {/* Hero Section Skeleton */}
      <div className="pt-36 pb-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="h-12 bg-gray-200 rounded-lg mb-4 max-w-2xl mx-auto"></div>
            <div className="h-6 bg-gray-200 rounded-lg mb-2 max-w-xl mx-auto"></div>
            <div className="h-6 bg-gray-200 rounded-lg max-w-lg mx-auto"></div>
          </div>
          
          {/* Products Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
      {/* Image */}
      <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-4"></div>
      
      {/* Title */}
      <div className="h-6 bg-gray-200 rounded mb-2"></div>
      
      {/* Description */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
      
      {/* Price */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-8 bg-gray-200 rounded w-24"></div>
        <div className="h-6 bg-gray-200 rounded w-16"></div>
      </div>
      
      {/* Button */}
      <div className="h-12 bg-gray-200 rounded-lg"></div>
    </div>
  );
}

export function NavbarSkeleton() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-pulse">
      <div className="bg-gradient-to-r from-yellow-200 to-yellow-300 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <div className="h-4 bg-gray-300 rounded w-32"></div>
              <div className="h-4 bg-gray-300 rounded w-24"></div>
            </div>
            <div className="flex space-x-2">
              <div className="h-8 bg-gray-300 rounded w-32"></div>
              <div className="h-8 bg-gray-300 rounded-full w-8"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-8">
            <div className="h-6 bg-gray-200 rounded w-20"></div>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
            <div className="h-16 bg-gray-200 rounded-full w-16"></div>
            <div className="h-6 bg-gray-200 rounded w-28"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
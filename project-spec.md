# Production-Ready Rental Product Booking Platform

## Project Goal

Build a complete full-stack Rental Product Booking Platform with a Customer Website and Admin Dashboard.

The application must be production-ready, mobile responsive, scalable, and suitable for real rental businesses.

The platform should support rental products such as:

* Cameras
* Projectors
* Sound Systems
* Generators
* Tents
* Party Equipment
* Construction Tools
* Machinery

The application must be deployable on Vercel + Supabase initially and allow future migration to PostgreSQL, Cloudflare, VPS, or custom backend infrastructure with minimal changes.

---

# Tech Stack

Frontend

* React
* Vite
* TypeScript
* Tailwind CSS
* React Router
* TanStack Query
* React Hook Form
* Zod

Backend

* Supabase

Database

* PostgreSQL-compatible schema

Storage

* Supabase Storage initially

Design code so storage can later be migrated to Cloudflare R2 or Cloudinary.

---

# User Roles

## Customer

Can:

* Browse products
* View product details
* Check availability
* Submit booking requests
* Track booking status

## Admin

Can:

* Manage products
* Manage categories
* Manage bookings
* Manage inventory
* Manage media
* View availability calendar

---

# Customer Website

## Home Page

Display:

* Hero section
* Featured products
* Product categories
* Benefits section
* Contact section

---

## Product Listing Page

Features:

* Search products
* Filter by category
* Sort by price
* Sort by availability

Each product card should display:

* Product image
* Product name
* Daily rental price
* Available quantity
* View details button

Use pagination.

---

## Product Details Page

Display:

* Product image gallery
* Product video URL embed
* Product name
* Description
* Specifications
* Rental price per day
* Available quantity

Booking widget:

* Start date
* End date
* Quantity

Automatically calculate:

* Total rental days
* Total rent amount

Show availability before booking.

---

## Booking Form

Collect:

* Full Name
* Phone Number
* Email (optional)
* Address

Generate:

* Unique Booking Reference Number

Create booking with status:

PENDING

---

## Booking Tracking

Customer can track booking using:

* Booking Reference Number
* Phone Number

Display:

* Booking Status
* Product
* Quantity
* Rental Dates

No customer login required in Phase 1.

---

# Booking Workflow

Customer submits booking

↓

Booking status = PENDING

↓

Admin reviews booking

↓

APPROVED or REJECTED

↓

If approved:

DELIVERED

↓

RETURNED

Customer can also cancel before approval.

---

# Inventory & Availability Logic

This is the most important feature.

All availability calculations must happen server-side.

Never trust frontend calculations.

Example:

Product Quantity = 10

Booking A:
1 July – 5 July
Quantity = 4

Booking B:
2 July – 4 July
Quantity = 3

Remaining quantity must be calculated correctly.

Prevent:

* Overbooking
* Negative inventory
* Invalid date ranges

Only bookings with status:

PENDING
APPROVED
DELIVERED

should reserve inventory.

Cancelled, Rejected, and Returned bookings must not reserve inventory.

Use database transactions where needed.

---

# Admin Authentication

Secure Admin Login

Features:

* Email
* Password
* Protected Routes
* Session Handling

Only admins can access dashboard.

---

# Admin Dashboard

Display:

* Total Products
* Total Categories
* Total Bookings
* Pending Bookings
* Approved Bookings
* Active Rentals

Recent Bookings Table

Inventory Alerts

Quick Actions

---

# Category Management

Admin can:

* Add Category
* Edit Category
* Delete Category

Examples:

* Cameras
* Projectors
* Sound Systems
* Generators
* Tents

---

# Product Management

Admin can:

* Add Product
* Edit Product
* Delete Product

Fields:

* Product Name
* Category
* Description
* Specifications
* Rental Price Per Day
* Total Quantity
* Status

Status:

ACTIVE
INACTIVE

Media:

* Multiple Images Upload
* Video URL Field

Videos should use external URLs only.

No direct video upload.

---

# Booking Management

Display:

* Booking Reference Number
* Product
* Customer Name
* Phone Number
* Rental Dates
* Quantity
* Total Rent
* Status

Actions:

* Approve
* Reject
* Cancel
* Mark Delivered
* Mark Returned

Provide:

* Search
* Filters
* Pagination

---

# Availability Calendar

Provide calendar view for admins.

Color Codes:

Green = Available

Yellow = Partially Booked

Red = Fully Booked

Clicking a date should display:

* Product Name
* Total Quantity
* Booked Quantity
* Available Quantity

---

# Payment Ready Architecture

Do not implement payment gateway in Phase 1.

However, prepare database and booking system for future payment integration.

Booking table should include:

* payment_status
* payment_method
* amount_paid

Supported statuses:

PENDING
COMPLETED
FAILED
REFUNDED

Future integration should support:

* Razorpay
* Cashfree
* Stripe

without major database changes.

---

# Database Tables

Create tables for:

* admins
* categories
* products
* product_media
* customers
* bookings
* booking_items

Use proper foreign keys and indexes.

---

# UI Requirements

Design style:

* Airbnb
* Stripe
* Linear

Requirements:

* Mobile-first
* Fully responsive
* Modern cards
* Clean forms
* Sidebar dashboard
* Loading skeletons
* Toast notifications
* Empty states
* Professional tables

Must work well on:

* Android
* iPhone
* Tablet
* Desktop

---

# Performance Requirements

Must support:

* 200+ Products
* 1000+ Images
* Thousands of Bookings
* Multiple Concurrent Users

Implement:

* Pagination
* Lazy Loading
* Image Optimization
* Query Caching

---

# Error Handling

Provide user-friendly messages for:

* Booking conflicts
* Invalid dates
* Network failures
* Validation errors
* Server errors

---

# Deliverables

Generate:

* Complete Source Code
* Database Schema
* Supabase Setup
* Sample Seed Data
* Admin Dashboard
* Customer Website
* Booking Engine
* Availability Logic
* Environment Variables
* Deployment Guide

The final application must be fully functional and deployable, not a mockup or prototype. All booking workflows, inventory calculations, availability management, admin features, and customer features must work end-to-end.

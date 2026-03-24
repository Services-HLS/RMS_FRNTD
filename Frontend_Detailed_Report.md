# Frontend Detailed Functionality Analysis Report

## Overview
This detailed report enumerates the exact granular functionality available on every frontend page inside the Restaurant Management System. This was mapped via automated UI interaction simulating an active user journey as `admin_r1`.

---

### 1. Unified Authentication Flow (`/login`)
* **Secure Inputs:** Text box for username masking and a togglable password input field filtering raw strings to visible dots.
* **Redirection Engine:** Upon obtaining a validated token, the global React Context (`AuthContext.js`) initializes and evaluates the user role, routing them to the appropriate primary dashboard. 

### 2. Admin Global Dashboard (`/admin/dashboard`)
* **KPI Header Cards:** Four primary top-level statistics dynamically calculating values like Total Revenue (Gross), Gross Order volume, Active running Operations, and Total logged Expenses.
* **Component Interactions:** 
  * Bar chart rendering tracking sales fluctuations over defined active ranges. 
  * "Bestselling Items" mapped array returning highest volume output menu units.
* **Global Sidebar Component:** Sticky left-oriented nav, highlighting active route in blue, encapsulating responsive sub-menus for standard module jumping.

### 3. Point of Sale Interface (`/admin/pos`)
* **Order Toggles:** Radio-style top navigation tabs isolating `Dine In` vs `Walk In`.
* **Category Filters:** Buttons enabling live static sorting of the dish catalog (All, Main Course, Drinks, Starters).
* **Item Catalog Cards:** Rendered tiles displaying Menu Item Image, Name, Price, and current real-time stock availability. Increments item logic silently avoiding reload.
* **Cart Summary Drawer:** 
  * **Customer Metadata:** Inputs for capturing Customer Name and Phone Number natively bound to the order state.
  * **Table Assignment (Dine In only):** Dropdown explicitly tied to available unassigned table objects.
  * **Action Footer:** "Place Order" CTA logic directly interacting with exact payment type sub-modals (QR Generation, Cash processing, Online handling).

### 4. Live Kitchen Display System - KDS (`/admin/kitchen`)
* **Live Refresh Polling:** Continual update loop querying the `/orders/active` layer.
* **Actionable State Kanban:** 
  * **Cards:** Distinct ticket objects housing order items (Qty + Item Name), Elapsed Wait Time, Order Type, and Customer reference.
  * **Status Toggles:** Primary CTA mapping "Mark Preparing" to visually acknowledge order capture, and "Mark Ready" appending a completion flag and triggering a bell alert.
  * **Print Functions:** Native thermal printer layout rendering via "Print KOT" (Kitchen Order Ticket) commands.

### 5. Accountability: Order History (`/admin/history`)
* **Date Sorting Engine:** Native calendar component injecting `startDate` & `endDate` payloads for historical querying.
* **Order Card Layouts:** Row components outputting `Order ID`, `Total Payload Amount`, `Source` (POS vs Walk-in QR), and chronological creation timestamp.
* **Action Handlers:** "View Details" modal spawning to output granular item arrays mapped to the exact base bill and associated taxes.

### 6. Dynamic Inventory & Stock Control 
**Raw Stocks (`/admin/stock`):**
* **Grid Rendering:** Tabular data fields showing Material Name, Assumed Unit metrics (`kg`, `ltr`), Total tracked Quantity, and the Threshold minimum level.
* **Modifiers:** `+` & `-` interactive inputs updating real-time values, shifting row visual warnings (red vs green) based on minimum stock parameters.

**Menu Editor (`/admin/menu-inventory`):**
* **Direct Modifiers:** Editable fields rendering standard Dish Name, Pricing float values, and assumed Preparation Duration (in minutes). Allows pushing fast price adjustments.

### 7. Core Management: Expenses & Marketing
**Expenses Manager (`/admin/expenses`):**
* **Logging Form:** Inputs standardizing `Category`, `Amount`, `Description`, and a date validation parser.
* **Accumulated Total Metric:** Header dynamically compounding listed rows into a single `Total Tracked Expenses` floating sum.

**Marketing Campaigns (`/admin/marketing`):**
* **Payload Creator:** Form rendering selections for `Campaign Type` (Alert, Banner), targeting start/end dates, and a rich text input establishing the promotional copy mapped back to consumer APIs.

### 8. Physical Layouts: Table Configurator (`/admin/tables`)
* **Grid Floorplan:** Responsive component drawing squares tied to `table_id` references (e.g. `T1`).
* **Visual Status Engines:** State engines interpreting JSON response flags, altering table border logic from 'Available' (Green outlines) to 'Occupied' (Red outlines) natively.
* **Quick Binding:** Left-click properties querying the assigned active order bound to the table.

### 9. Unified QR Configuration Engine (`/admin/qr`)
* **Walk-in Canvas:** Dedicated high-resolution React element drawing a generic walk-in endpoint QR link.
* **Table Scopes:** Sub-component drawing iterated URLs injecting specific Table IDs directly to the generated `<img>` tag, enabling "Download High-Res PNG" for physical printing operations.

---
**Verdict:** The React architecture correctly employs context-based isolation. `CartContext` safely persists cart states across sibling routes locally while `AuthContext` ensures robust user access protections. Every small interactive input element resolves back cleanly to the observed REST APIs.

# CRM Design System Overhaul

This document outlines the proposed design improvements to transform the CRM from a basic Bootstrap implementation into a premium, modern web application.

## 1. Visual Strategy
The goal is to create a **"Premium Dark/Light Hybrid"** aesthetic using Glassmorphism, high-quality typography, and a refined color palette.

### Color Palette (60-30-10 Rule)
| Usage | Hex | Description |
| :--- | :--- | :--- |
| **Background (60%)** | `#FFFFFF` | Main content area and page background. |
| **Sidebar (30%)** | `#0D6EFD` | Sidebar background and secondary accents. |
| **Primary (10%)** | `#E98937` | Action buttons (Sign In, Save), highlights, and active states. |

---

## 2. Core Improvements

### A. Typography & Iconography
- **Font**: Transition to **"Outfit"** or **"Inter"** for all UI elements. These are modern, highly readable, and feel premium.
- **Icons**: Continue using `react-icons` but ensure consistent sizing and weight across the dashboard.

### B. Layout & Navigation
- **Sidebar**: Implement a smoother transition with better spacing. Use a semi-transparent dark background with a subtle border instead of flat `bg-dark`.
- **Topbar**: Add a "Frosted Glass" effect (back-drop blur) so it feels integrated into the page content.
- **Shadows**: Use custom "Soft Shadows" instead of standard Bootstrap `shadow-sm`.
  - *Example*: `box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);`

### C. Components
- **Cards**: Use larger border-radius (`1rem` or `16px`) and subtle gradients.
- **Buttons**: Implement micro-animations (hover: scale up 2%, active: scale down 2%).
- **Inputs**: Focus states should use the Indigo primary color with a soft glow (`box-shadow`).

---

## 3. Recommended Tech Stack Changes
- **Tailwind CSS (Optional but Recommended)**: For rapid, consistent styling without the "Bootstrap look".
- **Framer Motion**: For smooth page transitions and sidebar animations.

---

## 4. Next Steps
1. **Apply Color Schema**: If you have a specific color schema, we should implement it via CSS Variables in `index.css`.
2. **Refactor Components**: Update `src/components/ui/` to use the new design tokens.
3. **Enhance Login Page**: Redesign the login card with a background gradient or abstract SVG pattern to make it "pop".

---
*Created by Antigravity AI*

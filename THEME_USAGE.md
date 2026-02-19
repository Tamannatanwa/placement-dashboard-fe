# Modern Theme Usage Guide

## Overview
Your app now uses a modern backdrop blur theme with:
- **Outfit Font** - Applied globally
- **Purple/Blue Color Scheme** - Modern gradient theme
- **Glassmorphism Effects** - Backdrop blur utilities
- **Background Image Support** - With blur overlay

## Using Background Images

To use background images with the `AnimatedBackground` component:

```tsx
import { AnimatedBackground } from "@/components/layouts/AnimatedBackground";

// With background image from public folder
<AnimatedBackground 
  backgroundImage="/images/your-background.jpg"
  enableBlur={true}
/>

// Without background image (uses animated orbs only)
<AnimatedBackground />
```

## Glassmorphism Utility Classes

### Available Classes:

1. **`.glass`** - Light glass effect with backdrop blur
   ```tsx
   <div className="glass rounded-lg p-4">
     Content with glass effect
   </div>
   ```

2. **`.glass-dark`** - Darker glass effect
   ```tsx
   <div className="glass-dark rounded-lg p-4">
     Dark glass content
   </div>
   ```

3. **`.glass-card`** - Card with glassmorphism (includes shadow)
   ```tsx
   <div className="glass-card rounded-xl p-6">
     Glass card content
   </div>
   ```

4. **`.glass-modal`** - Modal/dialog glass effect
   ```tsx
   <div className="glass-modal rounded-xl p-6">
     Modal content
   </div>
   ```

5. **`.backdrop-blur-glass`** - Enhanced backdrop blur
   ```tsx
   <div className="backdrop-blur-glass rounded-lg p-4">
     Enhanced blur content
   </div>
   ```

## Color Scheme

The theme uses purple and blue gradients:
- Primary: Purple (`purple-400`, `purple-500`, `purple-600`)
- Secondary: Blue (`blue-400`, `blue-500`, `blue-600`)
- Accents: Indigo, Violet, Cyan

## Example Usage in Components

### Card with Glass Effect:
```tsx
<div className="glass-card rounded-xl p-6 hover:shadow-lg hover:shadow-purple-500/20 transition-all">
  <h3 className="text-xl font-semibold">Title</h3>
  <p className="text-muted-foreground">Content</p>
</div>
```

### Button with Gradient:
```tsx
<Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/50">
  Click Me
</Button>
```

### Section with Background:
```tsx
<section className="relative min-h-screen">
  <AnimatedBackground backgroundImage="/images/bg.jpg" />
  <div className="relative z-10">
    {/* Your content */}
  </div>
</section>
```

## Adding Background Images

1. Place your background images in `/src/public/images/`
2. Reference them in components:
   ```tsx
   backgroundImage="/images/your-image.jpg"
   ```
3. The `AnimatedBackground` component will automatically apply blur and overlay effects

## Font

The **Outfit** font is applied globally. All text will use this font automatically.


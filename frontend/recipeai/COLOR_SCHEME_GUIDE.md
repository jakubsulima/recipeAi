# Color Scheme Implementation Guide

## Your Color Palette

Your project uses the following color scheme defined in `App.css`:

- **text**: `#fefefe` (white/light text)
- **background**: `#111111` (dark background)
- **primary**: `#fefefe` (primary/main color)
- **secondary**: `#444444` (secondary/gray)
- **accent**: `#ffd43c` (yellow accent)

## How to Use Colors in Components

With Tailwind v4, you can use these colors directly with Tailwind utility classes:

### Text Colors

```tsx
<h1 className="text-text">Light text</h1>
<p className="text-primary">Primary text</p>
<span className="text-accent">Accent text</span>
```

### Background Colors

```tsx
<div className="bg-background">Dark background</div>
<div className="bg-primary">Primary background</div>
<div className="bg-secondary">Secondary background</div>
<div className="bg-accent">Accent background</div>
```

### Border Colors

```tsx
<div className="border border-primary">Border with primary color</div>
<div className="border-2 border-accent">Accent border</div>
```

### Hover States

```tsx
<button className="bg-primary hover:bg-accent">Button with hover</button>
<a className="text-text hover:text-accent">Link with hover</a>
```

### Focus States

```tsx
<input className="focus:ring-2 focus:ring-accent focus:border-accent" />
```

### Opacity Variants

Tailwind automatically generates opacity variants:

```tsx
<div className="bg-accent/50">50% opacity accent background</div>
<div className="text-primary/80">80% opacity primary text</div>
```

## Common Component Patterns

### Button

```tsx
<button className="bg-accent text-background px-4 py-2 rounded hover:bg-accent/90">
  Click me
</button>
```

### Card

```tsx
<div className="bg-secondary p-6 rounded-lg shadow-lg">
  <h2 className="text-text text-xl font-bold mb-2">Card Title</h2>
  <p className="text-text/80">Card content goes here</p>
</div>
```

### Input Field

```tsx
<input
  type="text"
  className="w-full p-2 bg-secondary text-text border border-primary/20 rounded focus:outline-none focus:ring-2 focus:ring-accent"
  placeholder="Enter text..."
/>
```

### Navigation Bar

```tsx
<nav className="bg-primary p-4">
  <div className="flex items-center justify-between">
    <a href="/" className="text-background font-bold hover:text-accent">
      Logo
    </a>
    <div className="flex space-x-4">
      <a href="/about" className="text-background hover:text-accent">
        About
      </a>
      <a href="/contact" className="text-background hover:text-accent">
        Contact
      </a>
    </div>
  </div>
</nav>
```

### Alert/Message

```tsx
<div className="bg-accent text-background p-4 rounded">
  <p className="font-semibold">Important message!</p>
</div>
```

## Tips

1. **Consistency**: Always use these color variables instead of hardcoded hex values
2. **Contrast**: Remember that `text` and `primary` are the same color - use them for light elements against dark backgrounds
3. **Accessibility**: The `accent` color (#ffd43c) provides good contrast against both light and dark backgrounds
4. **Dark Theme**: Your color scheme is already dark-themed with `background` being #111111

## Examples from Your Components

### Replace old patterns:

```tsx
// ❌ Old way (if you had these)
className = "bg-[#fefefe]";
className = "text-[#ffd43c]";

// ✅ New way
className = "bg-primary";
className = "text-accent";
```

### For components that need to stand out:

```tsx
<button className="bg-accent text-background font-bold py-2 px-4 rounded hover:bg-accent/90">
  Generate Recipe
</button>
```

### For subtle backgrounds:

```tsx
<div className="bg-secondary p-6 rounded-lg">
  <h3 className="text-text">Section Title</h3>
</div>
```

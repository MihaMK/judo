import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        subdued: "hsl(var(--subdued))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        gold: "hsl(var(--gold))",
        "gold-foreground": "hsl(var(--gold-foreground))",
        surface: "hsl(var(--surface))",
        "surface-foreground": "hsl(var(--surface-foreground))",
        ring: "hsl(var(--ring))",
        success: "hsl(var(--success))",
        "success-foreground": "hsl(var(--success-foreground))",
        warning: "hsl(var(--warning))",
        "warning-foreground": "hsl(var(--warning-foreground))",
        danger: "hsl(var(--danger))",
        "danger-foreground": "hsl(var(--danger-foreground))"
      },
      fontSize: {
        "page-title": ["1.75rem", { lineHeight: "2.125rem", letterSpacing: "-0.01em" }],
        "section-title": ["1.125rem", { lineHeight: "1.625rem" }],
        "card-title": ["1rem", { lineHeight: "1.5rem" }],
        body: ["0.9375rem", { lineHeight: "1.5rem" }],
        caption: ["0.75rem", { lineHeight: "1rem" }],
        badge: ["0.75rem", { lineHeight: "1rem" }]
      },
      borderRadius: {
        control: "var(--radius-control)",
        button: "var(--radius-button)",
        input: "var(--radius-input)",
        avatar: "var(--radius-avatar)",
        card: "var(--radius-card)",
        panel: "var(--radius-panel)"
      },
      spacing: {
        xs: "var(--space-xs)",
        sm: "var(--space-sm)",
        md: "var(--space-md)",
        lg: "var(--space-lg)",
        xl: "var(--space-xl)",
        "2xl": "var(--space-2xl)",
        control: "var(--height-control)",
        "control-sm": "var(--height-control-sm)",
        "control-lg": "var(--height-control-lg)"
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        surface: "var(--shadow-surface)",
        raised: "var(--shadow-raised)",
        focus: "var(--shadow-focus)"
      },
      transitionDuration: {
        ui: "var(--duration-ui)"
      }
    }
  },
  plugins: []
};

export default config;

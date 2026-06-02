export const designTokens = {
  color: {
    brand: {
      primary: "hsl(var(--primary))",
      gold: "hsl(var(--gold))"
    },
    semantic: {
      background: "hsl(var(--background))",
      foreground: "hsl(var(--foreground))",
      surface: "hsl(var(--surface))",
      muted: "hsl(var(--muted))",
      border: "hsl(var(--border))",
      success: "hsl(var(--success))",
      warning: "hsl(var(--warning))",
      danger: "hsl(var(--danger))"
    }
  },
  typography: {
    pageTitle: "text-page-title",
    sectionTitle: "text-section-title",
    cardTitle: "text-card-title",
    body: "text-body",
    caption: "text-caption",
    badge: "text-badge"
  },
  spacing: {
    xs: "space-xs",
    sm: "space-sm",
    md: "space-md",
    lg: "space-lg",
    xl: "space-xl",
    "2xl": "space-2xl"
  },
  radius: {
    card: "rounded-card",
    button: "rounded-button",
    input: "rounded-input",
    avatar: "rounded-avatar"
  }
} as const;

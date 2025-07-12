"use server";

// This file previously contained revalidation functions for the Strapi-based architecture.
// After migrating to Contentlayer + Supabase, revalidation is no longer needed:
// - Content is statically generated at build time via Contentlayer
// - Comments are handled client-side with optimistic updates via Supabase
// - No runtime content changes require on-demand revalidation

// File kept for potential future server actions
"use server";

import { revalidatePath } from "next/cache";

export async function revalidateAllPages() {
  revalidatePath('/', 'page');
  revalidatePath('/posts/[id]', 'page');
  revalidatePath('/profile', 'page');
  revalidatePath('/sitemap.xml', 'page');
}

// Legacy function for backward compatibility
export async function revalidatePostPages() {
  await revalidateAllPages();
}
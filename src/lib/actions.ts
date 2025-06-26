"use server";

import { revalidatePath } from "next/cache";

export async function revalidatePostPages() {
  revalidatePath('/posts/[id]', 'page');
  revalidatePath('/', 'page');
}
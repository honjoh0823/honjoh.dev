import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const article = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/article" }),
    schema: z.object({
        title: z.string(),
        date: z.string(),
        description: z.string(),
        image: z.string().optional(),
    }),
});

export const collections = { article };

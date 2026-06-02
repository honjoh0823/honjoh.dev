// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
    site: 'https://honjoh.dev',
    integrations: [sitemap({
        filter: (page) => !page.includes('/yamato/about'),
    })],
});

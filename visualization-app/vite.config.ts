import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import ViteYaml from '@modyfi/vite-plugin-yaml';

// https://vite.dev/config/
export default defineConfig({
    base: '/gallery-app/',
    plugins: [react(), tailwindcss(), ViteYaml()]
});

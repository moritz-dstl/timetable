/// <reference types="vite/client" />
/// <reference types="vitest" />

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig((mode) => {
    // Load env file based on `mode` [development or production] from main directory
    const env = loadEnv(mode, process.cwd() + '/../..', 'VITE_');

    return {
        plugins: [react()],
        define: {
            __APP_ENV__: JSON.stringify(env.APP_ENV),
        },
        envDir: process.cwd() + '/../..',
        server: {
            host: "0.0.0.0",        // Expose on network
            port: 3000,
            strictPort: true,       // Exit if port is already in use, instead of automatically trying the next available port
        }
    };
})

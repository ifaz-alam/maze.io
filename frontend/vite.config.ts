import { defineConfig } from "vite";

/**
 * host: true because Docker creates a virtual network interface. Now the app needs to listen on the container's external interface, rather than just the internal interface
 */
// https://vite.dev/config/
export default defineConfig({
    server: {
        port: 3000,
        open: false,
        host: true,
    },
    preview: {
        port: 3000,
        open: false,
        host: true,
    },
});

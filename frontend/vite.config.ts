import { defineConfig } from "vite";

/**
 * host: true because Docker creates a virtual network interface. Now the app needs to listen on the container's external interface, rather than just the internal interface
 */
// https://vite.dev/config/
export default defineConfig({
    // Vite will resolve modules relative to this root (The same place we will have a node_modules folder)
    // Before there was an error in debug console saying vite was looking at src/node_modules which doesn't even exist.
    root: "./",
    base: "/",
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

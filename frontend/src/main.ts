import { Application, Assets, Renderer } from "pixi.js";
import { renderMaze } from "./helpers/maze";

function gameLoop() {
    /**
     * We initialize the app outside the IIFE so that it can be referenced by other functions that are also located outside the IIFE.
     */
    const app: Application<Renderer> = new Application();

    async function setup() {
        const pixiContainer: HTMLElement = document.getElementById("pixi-container") as HTMLElement;
        await app.init({ width: 640, height: 480, background: "#1099bb", resizeTo: pixiContainer });
        document.body.appendChild(app.canvas);
    }

    /**
     * Preloads textures with aliases so that they can be intuitively referenced later.
     *
     * - Assuming you have loaded your global textures (Array of objects with attributes alias and src link), note that to create Sprites, you need to load the texture first, and then create a new Sprite from that loaded texture.
     * - This process can take 2 steps (Due to getting the result of await Assets.load(<alias_name>) followed by calling new Sprite(<result>))
     * - A known shortcut is to just simply call Sprite.from(<alias_name>), which takes 1 less step compared to the method above.
     */
    async function preload() {
        const assets = [
            { alias: "background", src: "https://pixijs.com/assets/tutorials/fish-pond/pond_background.jpg" },
            { alias: "fish1", src: "https://pixijs.com/assets/tutorials/fish-pond/fish1.png" },
            { alias: "fish2", src: "https://pixijs.com/assets/tutorials/fish-pond/fish2.png" },
            { alias: "fish3", src: "https://pixijs.com/assets/tutorials/fish-pond/fish3.png" },
            { alias: "fish4", src: "https://pixijs.com/assets/tutorials/fish-pond/fish4.png" },
            { alias: "fish5", src: "https://pixijs.com/assets/tutorials/fish-pond/fish5.png" },
            { alias: "overlay", src: "https://pixijs.com/assets/tutorials/fish-pond/wave_overlay.png" },
            { alias: "displacement", src: "https://pixijs.com/assets/tutorials/fish-pond/displacement_map.png" },
        ];
        await Assets.load(assets);
    }

    /**
     * Asynchronous Immediately Invoked Function Expression (IIFE).
     */
    (async () => {
        await setup();
        await preload();
        renderMaze(app);
    })();
}

function onWebsiteOpen() {
    console.log("Trying to connect to WS...");
    const socket = new WebSocket("ws://localhost:3001");

    socket.onopen = () => {
        console.log("WebSocket connection opened!");
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            const type: string = data.type;
            console.log(data);

            if (type == "html") {
                const element = document.getElementById(data.id) as HTMLElement;
                element.innerText = String(data.value);
            }
        } catch (err) {
            console.error("Failed to parse WebSocket message", err);
        }
    };

    socket.onerror = (err) => {};

    socket.onclose = () => {};
}

onWebsiteOpen();

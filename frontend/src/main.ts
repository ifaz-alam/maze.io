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

function connectToSocket() {
    console.log("Trying to connect to WS...");
    const jsonWebToken = localStorage.getItem("jwt");
    console.log("Hi my token is", jsonWebToken);
    const socket = new WebSocket(`ws://localhost:3001?jwt=${jsonWebToken}`);

    socket.onopen = () => {
        console.log("WebSocket connection opened!");
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            const type: string = data.type;
            console.log(data);

            if (type == "html") {
                const element: HTMLElement = document.getElementById(data.id) as HTMLElement;
                element.innerText = String(data.value);
            }
        } catch (err) {
            console.error("Failed to parse WebSocket message", err);
        }
        socket.onerror = (err) => {
            alert("An error has occured while trying to connect to the server. Please refresh the page and try again.");
        };

        socket.onclose = () => {};
    };
}

async function handleLogin() {
    // JSON Web Tokens consist of 3 parts separated by a period delimiter: Header, Payload, Signature
    const jsonWebToken = localStorage.getItem("jwt");
    if (jsonWebToken) {
        const payload = JSON.parse(atob(jsonWebToken.split(".")[1]));
        const username = payload?.user;
        if (!username) {
            confirm(`An error has occured. Please refresh the page.`);
            location.reload();
        }

        const message = `You’re already logged in as ${username}. Do you want to stay logged in? Click OK to stay or Cancel to log out.`;

        if (confirm(message)) {
            // User wants to stay logged in — do nothing or proceed normally
        } else {
            // User wants to log out
            localStorage.removeItem("jwt");
            location.reload();
        }

        if (confirmLogout) {
            localStorage.removeItem("jwt");
            // Optionally: reload page or redirect to login
            location.reload();
        }
    }

    const MAX_USERNAME_LENGTH = 16;

    const userInputElement = document.getElementById("username") as HTMLInputElement;
    const userInputValue = userInputElement.value.trim().slice(0, MAX_USERNAME_LENGTH);

    if (!userInputValue) alert("Please enter a username");

    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const request = new Request("http://localhost:3001/login", {
        method: "POST",
        body: JSON.stringify({ username: userInputValue }),
        headers: headers,
    });

    try {
        const response = await fetch(request);

        if (!response.ok) {
            const errorBody = await response.json();
            alert(errorBody.error || "Unknown error. Please try again, or refresh the page if this issue persists.");
        } else {
            const { accessToken } = await response.json();
            localStorage.setItem("jwt", accessToken);
            connectToSocket();
        }
    } catch (error) {
        alert("Network error or server not reachable.");
    }
}

(document.getElementById("loginForm") as HTMLElement).addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleLogin();
});

import { advancedLog } from "./utils";

advancedLog("Controls loaded", "#32a852", "⌨️");

function addEvent(element: any, eventName: any, callback: (e: any) => void) {
    if (element.addEventListener) {
        element.addEventListener(eventName, callback, false);
    } else if (element.attachEvent) {
        element.attachEvent("on" + eventName, callback);
    }
}

const inputHandlers: InputHandler[] = [];

interface InputHandlerConfig {
    [key: string]: {
        keydown?: () => void;
        keyup?: () => void;
    };
}

export class InputHandler {
    keyCallbacks: InputHandlerConfig;

    constructor(keyCallbacks: InputHandlerConfig) {
        this.keyCallbacks = keyCallbacks

        inputHandlers.push(this)

        addEvent(window, "keydown", this.keydown);
        addEvent(window, "keyup", this.keyup);
    }

    keydown(e: KeyboardEvent) {
        for (let handler of inputHandlers) {
            for (let key in handler.keyCallbacks) {
                const callbackObject = handler.keyCallbacks[key];
                if (callbackObject.keydown && e.key === key) {
                    callbackObject.keydown();
                }
            }
        }
    }

    keyup(e: KeyboardEvent) {
        for (let handler of inputHandlers) {
            for (let key in handler.keyCallbacks) {
                const callbackObject = handler.keyCallbacks[key];
                if (callbackObject.keyup && e.key === key) {
                    callbackObject.keyup();
                }
            }
        }
    }
}
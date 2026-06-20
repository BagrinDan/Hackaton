import { setupWorker } from "msw/browser";
import { beachHandlers } from "@/mocks/handlers/beach";

export const worker = setupWorker(...beachHandlers);

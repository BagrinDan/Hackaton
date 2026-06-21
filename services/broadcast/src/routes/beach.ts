import { Router } from "express";
import { v4 as uuid } from "uuid";
import { broadcast } from "../eventBus.js";
import { EventType } from "../types.js";

const router = Router();

router.post("/full", (req, res) => {
  const { body } = req.body;

  broadcast({
    id: uuid(),
    type: EventType.BEACH_FULL,
    timestamp: new Date().toISOString(),
    source: "beach",
    payload: {
      body
    },
  });

  res.json({
    success: true,
  });
});

router.post("/available", (req, res) => {
  const { body } = req.body;

  broadcast({
    id: uuid(),
    type: EventType.BEACH_AVAILABLE,
    timestamp: new Date().toISOString(),
    source: "beach",
    payload: {
      body
    },
  });

  res.json({
    success: true,
  });
});

export default router;

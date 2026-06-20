import { Router } from "express";
import { v4 as uuid } from "uuid";
import { broadcast } from "../eventBus.js";
import { EventType } from "../types.js";

const router = Router();

router.post("/", (req, res) => {
  const { guestName, message } = req.body;

  broadcast({
    id: uuid(),
    type: EventType.PUBLIC_ANNOUNCEMENT,
    timestamp: new Date().toISOString(),
    source: guestName,
    payload: {
      message,
    },
  });

  res.json({
    success: true,
  });
});

export default router;
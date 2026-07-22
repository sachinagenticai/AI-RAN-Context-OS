from __future__ import annotations

import logging
from typing import Optional


def get_logger(name: str, level: Optional[str] = None) -> logging.Logger:
    """Create a structured logger for framework components.

    The logger is intentionally thin so that concrete applications can plug in
    richer logging infrastructure without changing the abstraction.
    """

    logger = logging.getLogger(name)
    if level is not None:
        logger.setLevel(getattr(logging, level.upper(), logging.INFO))
    return logger

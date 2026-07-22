from __future__ import annotations

from enum import Enum


class Technology(str, Enum):
    """Supported radio access technologies."""

    GSM = "GSM"
    UMTS = "UMTS"
    LTE = "LTE"
    NR = "NR"


class CarrierName(str, Enum):
    """Supported cellular carriers."""

    VERIZON = "Verizon"
    AT_T = "AT&T"
    T_MOBILE = "T-Mobile"
    NOKIA = "Nokia"
    ERICSSON = "Ericsson"
    HUAWEI = "Huawei"
    SAMSUNG = "Samsung"


class BandType(str, Enum):
    """Common band categories."""

    LOW = "Low"
    MID = "Mid"
    HIGH = "High"


class SectorId(str, Enum):
    """Logical sector identifiers within a cell."""

    A = "A"
    B = "B"
    C = "C"

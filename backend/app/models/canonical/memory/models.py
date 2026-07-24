from pydantic import Field

from app.models.canonical.base import CanonicalEntityModel


class MemoryEntity(CanonicalEntityModel):
    content: dict[str, object] = Field(default_factory=dict)


class CanonicalMemory(MemoryEntity):
    entity_type: str = "canonical_memory"


class CanonicalConversation(MemoryEntity):
    entity_type: str = "canonical_conversation"


class CanonicalHistory(MemoryEntity):
    entity_type: str = "canonical_history"


class CanonicalLearning(MemoryEntity):
    entity_type: str = "canonical_learning"


class CanonicalExperience(MemoryEntity):
    entity_type: str = "canonical_experience"


class CanonicalKnowledge(MemoryEntity):
    entity_type: str = "canonical_knowledge"
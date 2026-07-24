from pydantic import Field

from app.models.canonical.base import CanonicalEntityModel


class SecurityEntity(CanonicalEntityModel):
    principal: str = Field(default="")


class CanonicalIdentity(SecurityEntity):
    entity_type: str = "canonical_identity"


class CanonicalPermission(SecurityEntity):
    entity_type: str = "canonical_permission"


class CanonicalRole(SecurityEntity):
    entity_type: str = "canonical_role"


class CanonicalCredential(SecurityEntity):
    entity_type: str = "canonical_credential"
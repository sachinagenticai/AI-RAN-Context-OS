from app.models.builders.entity_builder import CanonicalEntityBuilder
from app.models.factories.canonical_factory import CanonicalModelFactory


def test_factory_and_builder_create_canonical_entities() -> None:
    factory_entity = CanonicalModelFactory().create(
        "CanonicalSite",
        {"source_system": "inventory", "vendor": "Synthetic", "name": "Site-1", "location": "Region-A"},
    )
    built_entity = CanonicalEntityBuilder("CanonicalSite").with_fields(source_system="inventory", vendor="Synthetic", name="Site-2").build()

    assert factory_entity.entity_type == "canonical_site"
    assert built_entity.name == "Site-2"
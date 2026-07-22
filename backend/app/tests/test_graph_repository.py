from app.graph.models.telecom_graph import GraphNode, GraphRelationship
from app.graph.repositories.telecom_repository import TelecomGraphRepository


def test_graph_repository_creates_nodes_and_relationships() -> None:
    repository = TelecomGraphRepository()

    region_node = GraphNode("region-1", ("Region",), {"name": "North"})
    site_node = GraphNode("site-1", ("Site",), {"name": "Site A"})
    alarm_node = GraphNode("alarm-1", ("Alarm",), {"severity": "Major"})

    repository.create_node(region_node)
    repository.create_node(site_node)
    repository.create_node(alarm_node)

    repository.create_relationship(
        GraphRelationship("region-1", "site-1", "CONTAINS", {"type": "contains"})
    )
    repository.create_relationship(
        GraphRelationship("site-1", "alarm-1", "HAS_ALARM", {"type": "has_alarm"})
    )

    neighbors = repository.get_neighbors("site-1", "HAS_ALARM")
    assert len(neighbors) == 1
    assert neighbors[0].id == "alarm-1"
    assert repository.list_nodes()[0].id == "region-1"
    assert len(repository.list_relationships()) == 2

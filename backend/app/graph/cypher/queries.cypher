// Create a region and site
MERGE (r:Region {id: $region_id}) SET r.name = $region_name;
MERGE (s:Site {id: $site_id}) SET s.name = $site_name;
MERGE (r)-[:CONTAINS]->(s);

// Create a cell under a site
MERGE (c:Cell {id: $cell_id}) SET c.name = $cell_name;
MERGE (s)-[:CONTAINS]->(c);

// Create a sector under a cell
MERGE (t:Sector {id: $sector_id}) SET t.name = $sector_name;
MERGE (c)-[:CONTAINS]->(t);

// Create alarm and KPI nodes and connect them
MERGE (a:Alarm {id: $alarm_id}) SET a.name = $alarm_name, a.severity = $severity;
MERGE (k:KPI {id: $kpi_id}) SET k.name = $kpi_name, k.value = $kpi_value;
MERGE (w:Weather {id: $weather_id}) SET w.name = $weather_name, w.condition = $weather_condition;
MERGE (t)-[:HAS_ALARM]->(a);
MERGE (t)-[:HAS_KPI]->(k);
MERGE (t)-[:AFFECTED_BY]->(w);

// Find cells connected to a site
MATCH (s:Site {id: $site_id})-[:CONTAINS]->(c:Cell) RETURN c;

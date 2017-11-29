SELECT players.first_name, players.last_name FROM players
RIGHT JOIN point_events ON players.id = point_events.scoring_player_id
LEFT JOIN point_event_types ON point_events.type_id = point_event_types.id
GROUP BY players.id
HAVING
    SUM(CASE WHEN YEAR(point_events.date_scored) = 2015 THEN point_event_types.points END) <
        SUM(CASE WHEN YEAR(point_events.date_scored) = 2016 THEN point_event_types.points END)

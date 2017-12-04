SELECT COUNT(point_events.id) FROM point_events
JOIN point_event_types event_type ON point_events.type_id = event_type.id
JOIN players scoring_player ON point_events.scoring_player_id = scoring_player.id
LEFT JOIN games ON point_events.game_id = games.id
WHERE
    scoring_player.first_name = "Marshawn"
    AND
    scoring_player.last_name = "Lynch"
    AND
    MONTH(games.date_played) = 10
    AND
    event_type.name = 'rushing'
ORDER BY games.date_played ASC

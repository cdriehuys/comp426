SELECT COUNT(point_events.id) FROM point_events
JOIN players scoring_player ON point_events.scoring_player_id = scoring_player.id
LEFT JOIN players passing_player ON point_events.passer_id = passing_player.id
LEFT JOIN games ON point_events.game_id = games.id
LEFT JOIN teams ON games.team1_id = teams.id OR games.team2_id = teams.id
WHERE
    (
        (passing_player.first_name = "Cam" AND passing_player.last_name = "Newton")
        OR
        (scoring_player.first_name = "Cam" AND scoring_player.last_name = "Newton")
    )
    AND
    teams.name = "Atlanta"
ORDER BY games.date_played ASC

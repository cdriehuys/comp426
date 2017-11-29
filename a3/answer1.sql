SELECT COUNT(point_events.id) FROM point_events
JOIN players scoring_player ON point_events.scoring_player_id = scoring_player.id
LEFT JOIN players passing_player ON point_events.passer_id = passing_player.id
JOIN teams opposing_team ON point_events.opposing_team_id = opposing_team.id
WHERE
    (
        (passing_player.first_name = "Cam" AND passing_player.last_name = "Newton")
        OR
        (scoring_player.first_name = "Cam" AND scoring_player.last_name = "Newton")
    )
    AND
    opposing_team.name = "Atlanta"
ORDER BY point_events.date_scored

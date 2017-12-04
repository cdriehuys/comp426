SELECT teams.name FROM teams
RIGHT JOIN games ON teams.id = games.team1_id OR teams.id = games.team2_id
RIGHT JOIN point_events ON games.id = point_events.game_id
INNER JOIN players ON point_events.scoring_player_id = players.id AND teams.id = players.team_id
LEFT JOIN point_event_types ON point_events.type_id = point_event_types.id
WHERE
    games.date_played = "2016-11-24"
    AND
    (
        teams.name = "Dallas"
        OR
        teams.name = "Washington"
    )
GROUP BY teams.id
ORDER BY SUM(point_event_types.points) DESC
LIMIT 1

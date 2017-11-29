CREATE TABLE IF NOT EXISTS teams (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    UNIQUE (id)
);

CREATE TABLE IF NOT EXISTS players (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    team_id INT UNSIGNED NOT NULL,
    UNIQUE (id)
);

CREATE TABLE IF NOT EXISTS point_event_types (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(16) NOT NULL,
    points INT UNSIGNED NOT NULL,
    UNIQUE (id),
    UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS point_events (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    date_scored DATE NOT NULL,
    scoring_player_id INT UNSIGNED NOT NULL,
    opposing_team_id INT UNSIGNED NOT NULL,
    type_id INT UNSIGNED NOT NULL,
    passer_id INT UNSIGNED,
    UNIQUE (id)
);

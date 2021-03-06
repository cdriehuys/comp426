CREATE TABLE IF NOT EXISTS teams (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS players (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    team_id INT UNSIGNED NOT NULL
);

CREATE TABLE IF NOT EXISTS games (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    team1_id INT UNSIGNED NOT NULL,
    team2_id INT UNSIGNED NOT NULL,
    date_played DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS point_event_types (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(16) NOT NULL,
    points TINYINT UNSIGNED NOT NULL,
    UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS point_events (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    scoring_player_id INT UNSIGNED NOT NULL,
    game_id INT UNSIGNED NOT NULL,
    type_id INT UNSIGNED NOT NULL,
    passer_id INT UNSIGNED
);

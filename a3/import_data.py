#!/usr/bin/env python

"""
Script for parsing the input data file and storing it in the database.
"""

from collections import namedtuple
import logging
import os

import MySQLdb

import progressbar


progressbar.streams.wrap_stderr()


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Base directory used to construct all other paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_FILE = os.path.join(BASE_DIR, 'a3-data.txt')

DB_HOST = 'classroom.cs.unc.edu'
DB_NAME = 'cdriehuydb'
DB_SCHEMA = os.path.join(BASE_DIR, 'schema.sql')


class DataPoint:
    def __init__(self, player_first, player_last, team_name,
                 opposing_team_name, date, type_name, passer_first=None,
                 passer_last=None):
        self.player_first = player_first
        self.player_last = player_last
        self.team_name = team_name
        self.opposing_team_name = opposing_team_name
        self.date = date
        self.type_name = type_name
        self.passer_first = passer_first
        self.passer_last = passer_last

    @classmethod
    def from_data_row(cls, row):
        """
        Construct a data point from a row of text input.
        """
        return cls(*row.split())


class PointEvent:
    def __init__(self, id, date_scored, scoring_player_id, opposing_team_id,
                 type_id, passer_id=None):
        self.id = id
        self.date_scored = date_scored
        self.scoring_player_id = scoring_player_id
        self.opposing_team_id = opposing_team_id
        self.type_id = type_id
        self.passer_id = passer_id


Player = namedtuple('Player', ['id', 'first_name', 'last_name', 'team_id'])
PointEventType = namedtuple('PointEventType', ['id', 'name'])
Team = namedtuple('Team', ['id', 'name'])


def clean_db(conn):
    """
    Clean up the database.
    """
    logging.warning('Wiping database before import')

    tables = ('players', 'teams', 'point_event_types', 'point_events')

    cursor = conn.cursor()

    for table in tables:
        sql = 'DROP TABLE IF EXISTS {table}'.format(table=table)
        cursor.execute(sql)

    cursor.close()
    conn.commit()


def create_player(cursor, first, last, team):
    """
    Create a new player record.
    """
    query = ('SELECT * FROM players WHERE first_name = %s AND last_name = %s '
             'AND team_id = %s LIMIT 1')
    query_params = (first, last, team.id)

    count = cursor.execute(query, query_params)

    if count:
        logging.debug('Found player record for: %s %s', first, last)

        return Player._make(cursor.fetchone())
    else:
        sql = ('INSERT INTO players (first_name, last_name, team_id) VALUES '
               '(%s, %s, %s)')

        logging.info('Creating new player record: %s %s', first, last)
        logging.debug('Executing SQL: %s', sql % query_params)

        cursor.execute(sql, query_params)

        return Player(cursor.lastrowid, *query_params)


def create_point_event(cursor, date, scoring_player, opposing_team,
                       event_type, passing_player=None):
    """
    Create a new point event.
    """
    if passing_player:
        passing_query = 'passer_id = %s'
    else:
        passing_query = 'passer_id IS NULL'

    query = ('SELECT * FROM point_events WHERE date_scored = %s AND '
             'scoring_player_id = %s AND opposing_team_id = %s AND '
             'type_id = %s AND {passing} LIMIT 1'
             ).format(passing=passing_query)
    query_params = [date, scoring_player.id, opposing_team.id, event_type.id]

    if (passing_player):
        query_params.append(passing_player.id)

    count = cursor.execute(query, query_params)

    if count:
        point_event = PointEvent(*cursor.fetchone())

        logging.debug('Found duplicate point event (ID %d)', point_event.id)

        return point_event
    else:
        columns = [
            'date_scored', 'scoring_player_id', 'opposing_team_id', 'type_id'
        ]
        if passing_player:
            columns.append('passer_id')

        sql = 'INSERT INTO point_events ({columns}) VALUES ({vars})'.format(
            columns=', '.join(columns),
            vars=','.join('%s' for i in range(len(columns))))

        cursor.execute(sql, query_params)

        return PointEvent(cursor.lastrowid, *query_params)


def create_point_event_type(cursor, name):
    """
    Create a new point event type.
    """
    query = 'SELECT * FROM point_event_types WHERE name = %s LIMIT 1'
    query_params = (name,)

    count = cursor.execute(query, query_params)

    if count:
        logging.debug('Found existing point event type with name: %s', name)

        return PointEventType._make(cursor.fetchone())
    else:
        sql = 'INSERT INTO point_event_types (name) VALUES (%s)'

        logging.info('Creating new point event type: %s', name)
        logging.debug('Executing SQL: %s', sql % query_params)

        cursor.execute(sql, query_params)

        return PointEventType(cursor.lastrowid, *query_params)


def create_team(cursor, name):
    """
    Create a new team record.
    """
    query = 'SELECT * FROM teams WHERE name = %s LIMIT 1'

    count = cursor.execute(query, (name,))

    if count:
        logging.debug('Found existing team record for: %s', name)

        return Team._make(cursor.fetchone())
    else:
        sql = 'INSERT INTO teams (name) VALUES (%s)'

        logging.info('Creating new team record: %s', name)
        logging.debug('Executing SQL: %s', sql % name)

        cursor.execute(sql, (name,))

        return Team(cursor.lastrowid, name)


def get_db_connection():
    """
    Get a connection to the database.
    """
    db_username = os.environ.get('DB_USERNAME', '')
    db_password = os.environ.get('DB_PASSWORD', '')

    return MySQLdb.connect(
        db=DB_NAME,
        host=DB_HOST,
        passwd=db_password,
        user=db_username)


def import_row(database, row):
    """
    Import a row into the database.
    """
    data_point = DataPoint.from_data_row(row)

    cursor = database.cursor()

    team = create_team(cursor, data_point.team_name)
    opposing_team = create_team(cursor, data_point.opposing_team_name)

    player = create_player(
        cursor,
        data_point.player_first,
        data_point.player_last,
        team)

    if data_point.passer_first and data_point.passer_last:
        passer = create_player(
            cursor,
            data_point.passer_first,
            data_point.passer_last,
            team)
    else:
        passer = None

    point_event_type = create_point_event_type(cursor, data_point.type_name)

    create_point_event(
        cursor,
        data_point.date,
        player,
        opposing_team,
        point_event_type,
        passer)

    cursor.close()
    database.commit()


def import_rows(database, data_file):
    """
    Import all the rows from the data set into the database.
    """
    with open(data_file) as f:
        rows = f.readlines()

    progress = progressbar.ProgressBar()

    for row in progress(rows):
        import_row(database, row)


def make_tables(db):
    """
    Ensure the correct tables exist in the database.
    """
    with open(DB_SCHEMA) as f:
        schema = f.read()

    statements = [sql.strip() for sql in schema.split(';')]

    cursor = db.cursor()

    for statement in statements:
        if not statement:
            continue
        logging.debug('Running: %s', statement)
        cursor.execute(statement)


def main():
    """
    Entry point for the program.
    """
    db = get_db_connection()

    clean_db(db)
    make_tables(db)
    import_rows(db, DATA_FILE)

    db.close()


# Only run the script if it was actually called.
if __name__ == '__main__':
    main()

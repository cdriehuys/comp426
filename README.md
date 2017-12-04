# COMP 426

Assignments for COMP 426 at UNC.


## Development

[Browser Sync](https://browsersync.io/) is used to handle live-reloading in development. It is run with [gulp](https://gulpjs.com/). To get started:

```bash
$ yarn
$ yarn run server
```

## Assignments

### Assignment 1

A static site detailing [Darkside's](http://uncdarkside.com) **mythological** journey to a national title. Uses HTML and CSS only.

### Assignment 2

A GUI version of the Game of Hearts. The player plays against 3 "AI" players. Uses HTML, CSS, and JavaScript.

### Assignment 3

This assignment involved importing a dataset into a database and then running queries against the uploaded data.

#### Import

To import the data, install the requirements, export your credentials, and then run the script.

```shell
$ pip install -r requirements.txt
$ export DB_USERNAME='myusername'
$ export DB_PASSWORD='mypassword'
$ ./import.py
```

#### Queries

The answer to question `n` for the assignment can be calculated by running the SQL in the `answer<n>.sql` file.


## License

This project is licensed under the MIT License.


## Author

Chathan Driehuys (cdriehuys@gmail.com)

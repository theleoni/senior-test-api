
const Promise = require('promise');
const PgPromise = require('pg-promise') ({
	promiseLib: Promise
});

const config = {
	user: 'postgres',
	database: 'hotel',
	password: 'root',
	host: 'localhost',
	port: 5432,
	max: 10,
	idleTimeoutMillis: 10000, // 10 s
};

let _db;

function initDb() {

	if (_db) {
		console.warn("HEY! You are trying to init DB again!");
		return;
	}

	_db = PgPromise(config);
}

function getDb() {
	return _db;
}

module.exports = {
	getDb,
	initDb
};

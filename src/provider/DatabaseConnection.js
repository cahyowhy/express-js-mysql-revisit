import mysql from "mysql";

export default class DatabaseConnection {
    static mysqlPool;

    static getInstance() {
        if (!this.mysqlPool) {
            console.log('is this persist ?');

            this.mysqlPool = mysql.createPool({
                connectionLimit: 10,
                host: process.env.DB_HOST,
                database: process.env.DB_NAME,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                port: process.env.DB_PORT
            });
        }

        return this.mysqlPool;
    }

    static executeQuery(query, args = []) {
        return new Promise((resolve, reject) => {
            this.getInstance().query(query, args, function (err, results) {
                if (err) {
                    reject(err);
                }

                try {
                    resolve(JSON.parse(JSON.stringify(results)));
                } catch (_) {
                    resolve(results);
                }
            });
        });
    }

    static endConnection() {
        return new Promise((resolve, reject) => {
            this.getInstance().end(function (err) {
                if (err) reject(err);

                resolve();
            });
        });
    }
}
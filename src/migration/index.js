import Book from "../model/book";
import User from "../model/user";
import UserBook from "../model/user_book";
import DatabaseConnection from "../provider/DatabaseConnection";

const args = process.argv;

if (args && args.length) {
    let promises = [];
    const tableName = args[2];

    // if no args specified execute all table create
    if (!tableName || (tableName === User.tableName)) {
        promises.push(User.createTable());
    }

    if (!tableName || (tableName === Book.tableName)) {
        promises.push(Book.createTable());
    }

    if (promises.length === 0) promises.push(Promise.resolve(null));

    DatabaseConnection.executeQuery('SET foreign_key_checks = 0').then(() => {
        return Promise.all(promises);
    }).then(() => {
        // new promises for table that has foreign key 
        let newPromises = [];
        if (!tableName || (tableName === UserBook.tableName)) {
            newPromises.push(UserBook.createTable());
        }

        return Promise.all(newPromises);
    }).then(() => {
        return DatabaseConnection.executeQuery('SET foreign_key_checks = 1');
    }).then(() => {
        console.log("succeed : some table created");
        process.exit(0);
    }).catch((e) => {
        console.log(e);
        process.exit(1);
    });
}
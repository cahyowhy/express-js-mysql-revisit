import faker from "faker";
import UserController from "../controller/user";
import BookController from "../controller/book";
import Book from "../model/book";
import User from "../model/user";
import UserBook from "../model/user_book";

import DatabaseConnection from "../provider/DatabaseConnection";
import { hashed } from "../util/auth";

const { name: fakerName, phone, internet, date, random, lorem } = faker;

async function seedTableUser(total = 12) {
    try {
        let datas = [];

        for (let i = 0; i < total; i++) {
            const first_name = fakerName.firstName();
            const last_name = fakerName.lastName();
            const name = `${first_name} ${last_name}`;

            datas.push({
                first_name, last_name, email: internet.email(first_name, last_name),
                phone_number: phone.phoneNumber(), name,
                username: internet.userName(first_name, last_name),
                birth_date: date.between(new Date(1991, 1, 1), new Date(1999, 11, 21)),
                password: await hashed("12345678")
            });
        }

        await Promise.all(datas.map(data => DatabaseConnection.executeQuery(`INSERT INTO ${User.tableName} SET ?`, data)));
        console.log("user seeded");
    } catch (e) {
        console.log(e);
    }
}

async function seedTableBook(total = 12) {
    try {
        let datas = [];

        for (let i = 0; i < total; i++) {
            const first_name = () => fakerName.firstName();
            const last_name = () => fakerName.lastName();
            const generate_author = (totalBook = 1) => JSON.stringify(new Array(totalBook).fill(null).map((_) => `${first_name()} ${last_name()}`));

            datas.push({
                authors: generate_author(random.number(2)), title: lorem.words(random.number({ min: 2, max: 4 })),
                publication_date: date.between(new Date(1991, 1, 1), new Date(2018, 11, 21)),
                intro: lorem.words(random.number({ min: 12, max: 64 })), rating: 0, total_review: 0,
                total_page: random.number({ min: 120, max: 314 }), dimension_width: random.number({ min: 10, max: 21 }),
                dimension_height: random.number({ min: 14, max: 29 })
            });
        }

        await Promise.all(datas.map(data => DatabaseConnection.executeQuery(`INSERT INTO ${Book.tableName} SET ?`, data)));
        console.log("book seeded");
    } catch (e) {
        console.log(e);
    }
}

async function seedTableUserBook(total = 12) {
    try {
        const responses = await Promise.all([
            UserController.find({ limit: total, fields: ['id'] }),
            BookController.find({ limit: total, fields: ['id'] }),
        ]);

        let datas = [];
        const [users, books] = responses;

        if (users.length && books.length) {
            for (let i = 0; i < total; i++) {
                let user_id = users[i] && users[i]['id'];
                if (!user_id) user_id = users[0]['id'];

                let book_id = books[i] && books[i]['id'];
                if (!book_id) book_id = books[0]['id'];

                datas.push({
                    borrow_date: date.between(new Date(2020, 1, 1), new Date(2020, 11, 21)),
                    return_date: date.between(new Date(2021, 1, 1), new Date(2021, 11, 21)),
                    user_id, book_id
                });
            }
        }

        await Promise.all(datas.map(data => DatabaseConnection.executeQuery(`INSERT INTO ${UserBook.tableName} SET ?`, data)));
        console.log("user book seeded");
    } catch (e) {
        console.log(e);
    }
}

const args = process.argv;

if (args && args.length) {
    const tableName = args[2];
    const total = args[3] || 12;
    const skipDeleteFirst = args[4] ? args[4] == 'skip-delete' : false;

    DatabaseConnection.executeQuery('SET foreign_key_checks = 0')
        .then(() => {
            if (skipDeleteFirst) return Promise.resolve();

            let promises = [];
            if (!tableName || (tableName === UserBook.tableName)) promises.push(DatabaseConnection.executeQuery(`DELETE FROM ${UserBook.tableName}`));
            if (!tableName || (tableName === User.tableName)) promises.push(DatabaseConnection.executeQuery(`DELETE FROM ${User.tableName}`));
            if (!tableName || (tableName === Book.tableName)) promises.push(DatabaseConnection.executeQuery(`DELETE FROM ${Book.tableName}`));

            return Promise.all(promises);
        })
        .then(() => {
            const promises = [];

            if (!tableName || (tableName === User.tableName)) promises.push(seedTableUser(total));
            if (!tableName || (tableName === Book.tableName)) promises.push(seedTableBook(total));

            return Promise.all(promises);
        }).then(() => {
            const newPromises = [];
            if (!tableName || (tableName === UserBook.tableName)) {
                newPromises.push(seedTableUserBook(total));
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
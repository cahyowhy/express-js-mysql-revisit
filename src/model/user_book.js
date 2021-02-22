import { createResourceTable } from "../util/query-util";
import Book from "./book";
import User from "./user";

export default class UserBook {
    constructor(params) {
        this.user = params && params.user;
        this.book = params && params.book;
    }

    static properties = [
        {
            field: 'user_id', type: 'INT', foreignKeyTo: User.tableName,
            notNull: true, foreignKeyProperties: User.properties
        },
        {
            field: 'book_id', type: 'INT', notNull: true,
            foreignKeyTo: Book.tableName, 
            foreignKeyProperties: Book.properties
        },
        { field: 'borrow_date', type: 'DATETIME' },
        { field: 'return_date', type: 'DATETIME' },
    ];

    static createTable() {
        return createResourceTable(this.tableName, this.properties);
    }

    static tableName = "user_books";
}
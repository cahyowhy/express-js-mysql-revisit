import { createResourceTable } from "../util/query-util";

export default class User {
    constructor(params) {
        this.id = params && params.id;
        this.first_name = params && params.id;
        this.last_name = params && params.last_name;
        this.phone_number = params && params.phone_number;
        this.birth_date = params && params.birth_date;
        this.email = params && params.email;
        this.username = params && params.username;
        this.password = params && params.password;
        this.name = params && params.name;
    }

    static properties = [
        { field: 'first_name', maxLength: 20, required: true },
        { field: 'last_name', maxLength: 20, required: true },
        { field: 'phone_number', maxLength: 25 },
        { field: 'birth_date', type: 'DATETIME', required: true },
        { field: 'email', maxLength: 40, unique: true, notNull: true, required: true },
        { field: 'username', maxLength: 40, unique: true, notNull: true, required: true },
        { field: 'password', maxLength: 60, type: 'CHAR', notNull: true, omitGet: true, required: true },
        { field: 'name', maxLength: 100, type: 'VARCHAR' },
    ];

    static createTable() {
        return createResourceTable(this.tableName, this.properties);
    }

    static tableName = "users";
}
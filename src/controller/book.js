import Book from "../model/book";
import { findResourceTable } from "../util/query-util";

export default class BookController {
    static find({ filter, fields, offset = 0, limit = 15, orderbys = [], sort = "ASC" } = {}) {
        return findResourceTable({ tableName: Book.tableName, filter, fields, offset, limit, orderbys, sort, tableProperties: Book.properties });
    }
}
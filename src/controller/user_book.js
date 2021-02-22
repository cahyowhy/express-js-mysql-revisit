import UserBook from "../model/user_book";
import { findResourceTable } from "../util/query-util";

export default class UserBookController {
    static find({ filter, fields, offset = 0, limit = 15, orderbys = [], sort = "ASC" } = {}) {
        return findResourceTable({ tableName: UserBook.tableName, filter, fields, offset, limit, orderbys, sort, tableProperties: UserBook.properties });
    }
}
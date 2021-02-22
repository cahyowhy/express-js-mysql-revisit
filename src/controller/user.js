import User from "../model/user";
import brypt from "bcrypt";
import { findResourceTable } from "../util/query-util";
import { omitField, pickField, validReqBody } from "../util/underscore";
import { generateToken, hashed } from "../util/auth";
import DatabaseConnection from "../provider/DatabaseConnection";
import ErrorStatus from "../helper/error-status";

export default class UserController {
    static find({ filter, fields, offset = 0, limit = 15, orderbys = [], sort = "ASC", ignoreOmit = false } = {}) {
        return findResourceTable({
            tableName: User.tableName, filter, fields, offset, limit,
            orderbys, sort, tableProperties: User.properties, ignoreOmit
        });
    }

    static async create(param = {}) {
        const finalParam = pickField(param, User.properties.map(item => item.field));

        if (validReqBody(finalParam, User.properties)) {
            finalParam.password = await hashed(finalParam.password);

            if (!finalParam.name) {
                finalParam.name = `${finalParam.first_name} ${finalParam.last_name}`;
            }

            return DatabaseConnection.executeQuery(`INSERT INTO ${User.tableName} SET ?`, finalParam);
        }

        throw new ErrorStatus("Some properties are missing", 400);
    }

    static async update(id, param = {}) {
        let finalParam = pickField(param, User.properties.map(item => item.field));
        finalParam = omitField(finalParam, ['email', 'username']);

        if (finalParam.first_name || finalParam.last_name) {
            let users = await this.find({ filter: { id }, offset: 0, limit: 1, fields: ['first_name', 'last_name'] });
            if (users && users[0]) users = users[0];
            if (users) finalParam.name = `${finalParam.first_name || users.first_name} ${finalParam.last_name || users.last_name}`;
        }

        if (!finalParam || !(Object.keys(finalParam || {}).length) || !parseInt(id)) {
            throw new ErrorStatus("Req. body or Req. params was not valid", 400);
        }

        return DatabaseConnection.executeQuery(`UPDATE ${User.tableName} SET ? WHERE id = ?`, [finalParam, parseInt(id)]);
    }

    static async login({ username, email, password } = {}) {
        try {
            let filter = username ? { username } : email ? { email } : null;

            if (!filter) {
                return null;
            }

            let users = await this.find({ filter, offset: 0, limit: 1, ignoreOmit: true });
            if (users && users[0]) {
                users = users[0];

                if (users.password) {
                    const passwordValid = await brypt.compare(password, users.password);

                    if (passwordValid) {
                        delete users.password;
                        const token = await generateToken(users);

                        return { ...users, token };
                    }
                }

                return null;
            }

            return null;
        } catch (e) {
            throw (e);
        }
    }
}
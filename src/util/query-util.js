import DatabaseConnection from "../provider/DatabaseConnection";
import { omitField } from "./underscore";

/**
 * 
 * @param {String} table 
 * @param {Array} fields 
 * @param {[key: String]: primitive | Array<primitive> | Object{operator, value} | Array<Object{operator, value}>} filter
 * @param {Number} skip 
 * @param {Array} orderbys
 * @param {Number} limit
 * @param {Array} tableProperties
 */
export const findResourceTable = function ({ tableName, fields = [], filter, offset = 0, limit = 15, orderbys = [],
    sort = "ASC", tableProperties = [], ignoreOmit = false } = {}) {
    return new Promise(function (resolve, reject) {
        if (!tableName) reject(new Error("Table name must not be empty !"));

        let joinReferences;
        let fieldJson;
        let tableJoins;

        if (tableProperties && tableProperties.length) {
            if (fields && fields.length) {
                fields = fields.filter(item => {
                    return !tableProperties.filter(child => child.omitGet || ignoreOmit).map(child => child.field).includes(item);
                });
            } else {
                fields = tableProperties.filter(item => !item.omitGet || ignoreOmit).map(item => item.field);
            }

            fields.push('id');
            fields = fields.map(field => `${tableName}.${field}`);

            fieldJson = tableProperties.filter(item => item.type == 'JSON').map(item => item['field']);
            joinReferences = tableProperties.filter(item => item.foreignKeyTo);
            tableJoins = joinReferences.map(item => item.foreignKeyTo)

            if (joinReferences && joinReferences.length) {
                joinReferences = joinReferences.map((item) => {
                    if (item['foreignKeyProperties'] && item['foreignKeyProperties']['length']) {
                        const columnNameAs = (field) => `${item['foreignKeyTo']}_${field}`;
                        const fieldAs = (field) => `${item['foreignKeyTo']}.${field} AS ${columnNameAs(field)}`;

                        item['foreignKeyProperties']
                            .filter(fkProp => !fkProp.omitGet || ignoreOmit)
                            .forEach((fkProp) => {
                                fields.push(fieldAs(fkProp['field']));

                                if (fkProp['type'] == 'JSON') fieldJson.push(columnNameAs(fkProp['field']));
                            });

                        fields.push(fieldAs('id'));
                    } else {
                        fields.push(`${item['foreignKeyTo']}.*`);
                    }

                    return `LEFT JOIN ${item['foreignKeyTo']} ON ${tableName}.${item['field']} = ${item['foreignKeyTo']}.id`;
                });
            }
        }

        let query = `SELECT ${fields && fields.length ? fields.join(", ") : "*"} FROM ${tableName}`;

        if (joinReferences && joinReferences.length) {
            query += ` ${joinReferences.join(' ')}`;
        }

        const values = [];
        let filters = [];

        if (filter && Object.keys(filter || {}).length) {
            Object.keys(filter).forEach((key) => {
                let operator = filter[key]['operator'] || '=';

                if (Array.isArray(filter[key]) && filter[key]['length']) {
                    if (filter[key][0]['value']) {
                        filter[key].forEach((value) => {
                            operator = value && value['operator'] ? value['operator'] : operator;
                            const valueFinal = (value && value['value']) || value;

                            filters.push(`${key} ${operator} ?`);
                            values.push(valueFinal);
                        });
                    } else {
                        operator = 'IN';
                        filters.push(`${key} ${operator} (${filter[key].map((_item) => '?').join(', ')})`);
                        filter[key].forEach((itemKey) => values.push(itemKey));
                    }
                } else {
                    filters.push(`${key} ${operator} ?`);
                    let value = (filter[key] && filter[key]['value']) || filter[key];

                    if (operator.toLowerCase() == "like") value = `%${value}%`;

                    values.push(value);
                }
            });

            if (filters && filters.length) {
                query += ` WHERE ${filters.join(" AND ")}`;
            }
        }

        if (orderbys && orderbys.length) {
            query += ` ORDER BY ${orderbys.join(", ")} ${sort}`;
        }

        query += ` LIMIT ? OFFSET ?`;
        values.push(limit);
        values.push(offset);

        DatabaseConnection.executeQuery(query, values).then(function (results) {
            if (fieldJson && fieldJson.length) {
                results = results.map((item) => {
                    try {
                        fieldJson.forEach((key) => {
                            if (item.hasOwnProperty(key)) {
                                item[key] = JSON.parse(item[key]);
                            }
                        });
                    } catch (_) { }

                    if (tableJoins && tableJoins.length) {
                        tableJoins.forEach((tableJoinKey) => {
                            if (tableJoinKey.endsWith('s')) {
                                const finalTableJoinKey = tableJoinKey.substring(0, tableJoinKey.length - 1);
                                const propkeyRelate = Object.keys(item).filter(itemKey => {
                                    return itemKey.startsWith(tableJoinKey);
                                });

                                item[finalTableJoinKey] = {};
                                propkeyRelate.forEach((propKey) => {
                                    const propKeyFinal = propKey.replace(`${tableJoinKey}_`, '');

                                    item[finalTableJoinKey][propKeyFinal] = item[propKey];
                                });

                                item = omitField(item, propkeyRelate);
                            }
                        });
                    }

                    return item;
                });
            }

            resolve(results);
        }).catch(function (err) {
            reject(err);
        });
    });
}

export const createResourceTable = function (tableName, properties,
    useIdAutoInc = true, dropFirst = true) {

    return new Promise(async function (resolve, reject) {
        try {
            if (!tableName || !(properties && properties.length)) {
                reject(new Error("table name and properties are required"));
            }

            let query = `CREATE TABLE IF NOT EXISTS ${tableName} ( `;
            let fields = properties.reduce((accu, property) => {
                let qItem = `${property['field']} ${property['type'] || 'VARCHAR'}`;
                if (property['maxLength']) qItem += `(${property['maxLength']})`;
                if (property['foreignKeyTo']) qItem += ' UNSIGNED';
                if (property['notNull']) qItem += ` NOT NULL`;
                if (property['unique']) qItem += ` UNIQUE`;

                accu.push(qItem);

                return accu;
            }, []);

            if (useIdAutoInc) {
                fields.push("id INT UNSIGNED NOT NULL AUTO_INCREMENT");
                fields.push("PRIMARY KEY(id)");
            }

            properties.filter((property) => property.foreignKeyTo).forEach((property) => {
                fields.push(`FOREIGN KEY (${property['field']}) REFERENCES ${property['foreignKeyTo']}(id)`);
            });

            query += fields.join(", ");
            query += " ) ENGINE INNODB";

            if (dropFirst) {
                await DatabaseConnection.executeQuery("DROP TABLE IF EXISTS " + tableName);
            }

            await DatabaseConnection.executeQuery(query);

            resolve();
        } catch (e) {
            reject(e);
        }
    });
}
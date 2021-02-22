import jwt from "jsonwebtoken";

export const queryParserHandler = function (req, _res, next) {
    const reqQueryFinal = {};
    const allowQueryFilter = ["filter", "fields", "offset", "limit", "orderbys", "sort"];

    allowQueryFilter.forEach((key) => req.query.hasOwnProperty(key) ? reqQueryFinal[key] = req.query[key] : null);
    req.query = reqQueryFinal;

    if (!parseInt(req.query['offset'])) delete req.query['offset'];
    if (!parseInt(req.query['limit'])) delete req.query['limit'];

    try {
        const filter = req.query['filter'] ? JSON.parse(req.query['filter']) : null;
        const fields = req.query['fields'] ? JSON.parse(req.query['fields']) : null;
        const orderbys = req.query['orderbys'] ? JSON.parse(req.query['orderbys']) : null;

        req.query = { ...req.query, filter, fields, orderbys };
    } catch (_) {
        delete req.query['filter'];
        delete req.query['fields'];
        delete req.query['orderbys'];
    }

    return next();
}

/**
 * the parameter should 4
 * 
 * @param {*} err 
 * @param {*} _req 
 * @param {*} res 
 * @param {*} next 
 */
export const errorHandler = function (err, _req, res, next) {
    if (process.env.DEV) console.log(err);

    if (res.headersSent) {
        return next(err);
    }

    return res.status((err && err.httpStatus) || 500).send({ success: false, message: err && err.stack || 'No message specified' });
}

export const authHandler = function (req, res, next) {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECREET, function (err, user) {
            if (err) {
                res.status(403).send({ success: false, message: "Failed verify access token" });
            }

            req.user = user;

            next();
        });
    } else {
        res.status(401).send({ success: false, message: "Unauthorize" });
    }
}
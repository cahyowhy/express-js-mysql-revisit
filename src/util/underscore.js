import jwt from "jsonwebtoken";

export const omitField = (param, fields) => {
    if ((param && Object.keys(param).length) && (fields && fields.length)) {
        fields.forEach((field) => {
            delete param[field];
        });
    }

    return param;
};

export const pickField = (param, fields) => {
    if ((param && Object.keys(param).length) && (fields && fields.length)) {
        let newParam = {};
        fields.forEach((field) => {
            if (param[field]) newParam[field] = param[field];
        });

        return newParam;
    }

    return param;
};

export const validReqBody = (param, properties) => {
    if (!param || !(properties && properties.length)) {
        return false;
    }

    return properties.filter((item) => item.required).every((item) => {
        return param.hasOwnProperty(item['field']);
    });
};
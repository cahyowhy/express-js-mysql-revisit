import bcrypt from "bcrypt";

export const hashed = async function (param) {
    try {
        const hashedParam = await bcrypt.hash(param, await bcrypt.genSalt(10));

        return hashedParam;
    } catch (e) {
        throw (e);
    }
};

export const generateToken = (user) => {
    return new Promise((resolve, reject) => {
        jwt.sign(user, process.env.JWT_SECREET, function (err, result) {
            if (err) reject(err);

            resolve(result);
        });
    });
};
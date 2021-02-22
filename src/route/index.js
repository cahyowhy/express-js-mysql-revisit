import user from "./user";
import user_book from "./user_book";

export default [
    user, user_book,
    (_req, res) => {
        res.status(404).send({ message: "Resource Not found", success: false });
    }
];
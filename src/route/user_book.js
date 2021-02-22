import { Router } from "express";
import UserBookController from "../controller/user_book";
import { authHandler } from "../middleware";

const router = Router();

router.get("/user-books/", authHandler, async function (req, res, next) {
    try {
        const results = await UserBookController.find(req.query);

        return res.send({ success: true, data: results });
    } catch (e) {
        return next(e);
    }
});

export default router;
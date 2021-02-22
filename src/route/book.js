import { Router } from "express";
import BookController from "../controller/book";
import { authHandler } from "../middleware";

const router = Router();

router.get("/books/", authHandler, async function (req, res, next) {
    try {
        const results = await BookController.find(req.query);

        return res.send({ success: true, data: results });
    } catch (e) {
        return next(e);
    }
});

export default router;
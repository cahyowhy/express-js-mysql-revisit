import { Router } from "express";
import UserController from "../controller/user";
import { authHandler } from "../middleware";

const router = Router();

router.get("/users/", authHandler, async function (req, res, next) {
    try {
        const results = await UserController.find(req.query);

        return res.send({ success: true, data: results });
    } catch (e) {
        return next(e);
    }
});

router.post("/users/", async function (req, res, next) {
    try {
        const result = await UserController.create(req.body);

        return res.send({ success: (result && result.insertId) > 0 });
    } catch (e) {
        return next(e);
    }
});

router.put("/users/:id", async function (req, res, next) {
    try {
        const result = await UserController.update(req.params.id, req.body);

        return res.send({ success: result && result.affectedRows > 0 });
    } catch (e) {
        return next(e);
    }
});

router.post("/users/login", async function (req, res, next) {
    try {
        const results = await UserController.login(req.body);

        if (results) {
            return res.send({ success: true, data: results });
        }

        return res.status(401).send({ success: false, data: 'Unauthorize' });
    } catch (e) {
        return next(e);
    }
});

export default router;
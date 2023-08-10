"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMeHandler = void 0;
const getMeHandler = (req, res, next) => {
    try {
        const user = res.locals.user;
        res.status(200).json({
            status: "success",
            data: {
                user,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getMeHandler = getMeHandler;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const deserializeUser_1 = require("../middleware/deserializeUser");
const requireUser_1 = require("../middleware/requireUser");
const validate_1 = require("../middleware/validate");
const user_schema_1 = require("../schema/user.schema");
const router = express_1.default.Router();
// Register user route
router.post("/register", (0, validate_1.validate)(user_schema_1.createUserSchema), auth_controller_1.registerHandler);
// Login user route
router.post("/login", (0, validate_1.validate)(user_schema_1.loginUserSchema), auth_controller_1.loginHandler);
// Logout User
router.get("/logout", deserializeUser_1.deserializeUser, requireUser_1.requireUser, auth_controller_1.logoutHandler);
exports.default = router;

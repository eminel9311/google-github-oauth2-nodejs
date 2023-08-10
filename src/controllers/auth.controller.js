"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.githubOauthHandler = exports.googleOauthHandler = exports.logoutHandler = exports.loginHandler = exports.registerHandler = exports.exclude = void 0;
const session_service_1 = require("../services/session.service");
const prisma_1 = require("../utils/prisma");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function exclude(user, keys) {
    for (let key of keys) {
        delete user[key];
    }
    return user;
}
exports.exclude = exclude;
const registerHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma_1.prisma.user.create({
            data: {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                createdAt: new Date(),
            },
        });
        res.status(201).json({
            status: "success",
            data: {
                user: exclude(user, ["password"]),
            },
        });
    }
    catch (err) {
        if (err.code === "P2002") {
            return res.status(409).json({
                status: "fail",
                message: "Email already exist",
            });
        }
        next(err);
    }
});
exports.registerHandler = registerHandler;
const loginHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma_1.prisma.user.findUnique({
            where: { email: req.body.email },
        });
        if (!user) {
            return res.status(401).json({
                status: "fail",
                message: "Invalid email or password",
            });
        }
        if (user.provider === "Google" || user.provider === "GitHub") {
            return res.status(401).json({
                status: "fail",
                message: `Use ${user.provider} OAuth2 instead`,
            });
        }
        const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN;
        const TOKEN_SECRET = process.env.JWT_SECRET;
        const token = jsonwebtoken_1.default.sign({ sub: user.id }, TOKEN_SECRET, {
            expiresIn: `${TOKEN_EXPIRES_IN}m`,
        });
        res.cookie("token", token, {
            expires: new Date(Date.now() + TOKEN_EXPIRES_IN * 60 * 1000),
        });
        res.status(200).json({
            status: "success",
        });
    }
    catch (err) {
        next(err);
    }
});
exports.loginHandler = loginHandler;
const logoutHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.cookie("token", "", { maxAge: -1 });
        res.status(200).json({ status: "success" });
    }
    catch (err) {
        next(err);
    }
});
exports.logoutHandler = logoutHandler;
const googleOauthHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;
    try {
        const code = req.query.code;
        const pathUrl = req.query.state || "/";
        if (!code) {
            return res.status(401).json({
                status: "fail",
                message: "Authorization code not provided!",
            });
        }
        const { id_token, access_token } = yield (0, session_service_1.getGoogleOauthToken)({ code });
        const { name, verified_email, email, picture } = yield (0, session_service_1.getGoogleUser)({
            id_token,
            access_token,
        });
        if (!verified_email) {
            return res.status(403).json({
                status: "fail",
                message: "Google account not verified",
            });
        }
        const user = yield prisma_1.prisma.user.upsert({
            where: { email },
            create: {
                createdAt: new Date(),
                name,
                email,
                photo: picture,
                password: "",
                verified: true,
                provider: "Google",
            },
            update: { name, email, photo: picture, provider: "Google" },
        });
        if (!user)
            return res.redirect(`${FRONTEND_ORIGIN}/oauth/error`);
        const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN;
        const TOKEN_SECRET = process.env.JWT_SECRET;
        const token = jsonwebtoken_1.default.sign({ sub: user.id }, TOKEN_SECRET, {
            expiresIn: `${TOKEN_EXPIRES_IN}m`,
        });
        res.cookie("token", token, {
            expires: new Date(Date.now() + TOKEN_EXPIRES_IN * 60 * 1000),
        });
        res.redirect(`${FRONTEND_ORIGIN}${pathUrl}`);
    }
    catch (err) {
        console.log("Failed to authorize Google User", err);
        return res.redirect(`${FRONTEND_ORIGIN}/oauth/error`);
    }
});
exports.googleOauthHandler = googleOauthHandler;
const githubOauthHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;
    try {
        const code = req.query.code;
        const pathUrl = (_a = req.query.state) !== null && _a !== void 0 ? _a : "/";
        if (req.query.error) {
            return res.redirect(`${FRONTEND_ORIGIN}/login`);
        }
        if (!code) {
            return res.status(401).json({
                status: "error",
                message: "Authorization code not provided!",
            });
        }
        const { access_token } = yield (0, session_service_1.getGithubOathToken)({ code });
        const { email, avatar_url, login } = yield (0, session_service_1.getGithubUser)({ access_token });
        const user = yield prisma_1.prisma.user.upsert({
            where: { email },
            create: {
                createdAt: new Date(),
                name: login,
                email,
                photo: avatar_url,
                password: "",
                verified: true,
                provider: "GitHub",
            },
            update: { name: login, email, photo: avatar_url, provider: "GitHub" },
        });
        if (!user)
            return res.redirect(`${FRONTEND_ORIGIN}/oauth/error`);
        const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN;
        const TOKEN_SECRET = process.env.JWT_SECRET;
        const token = jsonwebtoken_1.default.sign({ sub: user.id }, TOKEN_SECRET, {
            expiresIn: `${TOKEN_EXPIRES_IN}m`,
        });
        res.cookie("token", token, {
            expires: new Date(Date.now() + TOKEN_EXPIRES_IN * 60 * 1000),
        });
        res.redirect(`${FRONTEND_ORIGIN}${pathUrl}`);
    }
    catch (err) {
        return res.redirect(`${FRONTEND_ORIGIN}/oauth/error`);
    }
});
exports.githubOauthHandler = githubOauthHandler;

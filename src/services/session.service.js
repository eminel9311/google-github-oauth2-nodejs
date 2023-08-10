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
exports.getGithubUser = exports.getGithubOathToken = exports.getGoogleUser = exports.getGoogleOauthToken = void 0;
const axios_1 = __importDefault(require("axios"));
const qs_1 = __importDefault(require("qs"));
const GOOGLE_OAUTH_CLIENT_ID = process.env
    .GOOGLE_OAUTH_CLIENT_ID;
const GOOGLE_OAUTH_CLIENT_SECRET = process.env
    .GOOGLE_OAUTH_CLIENT_SECRET;
const GOOGLE_OAUTH_REDIRECT = process.env
    .GOOGLE_OAUTH_REDIRECT;
const GITHUB_OAUTH_CLIENT_ID = process.env
    .GITHUB_OAUTH_CLIENT_ID;
const GITHUB_OAUTH_CLIENT_SECRET = process.env
    .GITHUB_OAUTH_CLIENT_SECRET;
const getGoogleOauthToken = ({ code, }) => __awaiter(void 0, void 0, void 0, function* () {
    const rootURl = "https://oauth2.googleapis.com/token";
    const options = {
        code,
        client_id: GOOGLE_OAUTH_CLIENT_ID,
        client_secret: GOOGLE_OAUTH_CLIENT_SECRET,
        redirect_uri: GOOGLE_OAUTH_REDIRECT,
        grant_type: "authorization_code",
    };
    try {
        const { data } = yield axios_1.default.post(rootURl, qs_1.default.stringify(options), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        return data;
    }
    catch (err) {
        console.log("Failed to fetch Google Oauth Tokens");
        throw new Error(err);
    }
});
exports.getGoogleOauthToken = getGoogleOauthToken;
function getGoogleUser({ id_token, access_token, }) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data } = yield axios_1.default.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`, {
                headers: {
                    Authorization: `Bearer ${id_token}`,
                },
            });
            return data;
        }
        catch (err) {
            console.log(err);
            throw Error(err);
        }
    });
}
exports.getGoogleUser = getGoogleUser;
const getGithubOathToken = ({ code, }) => __awaiter(void 0, void 0, void 0, function* () {
    const rootUrl = "https://github.com/login/oauth/access_token";
    const options = {
        client_id: GITHUB_OAUTH_CLIENT_ID,
        client_secret: GITHUB_OAUTH_CLIENT_SECRET,
        code,
    };
    const queryString = qs_1.default.stringify(options);
    try {
        const { data } = yield axios_1.default.post(`${rootUrl}?${queryString}`, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        const decoded = qs_1.default.parse(data);
        return decoded;
    }
    catch (err) {
        throw Error(err);
    }
});
exports.getGithubOathToken = getGithubOathToken;
const getGithubUser = ({ access_token, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios_1.default.get("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
        return data;
    }
    catch (err) {
        throw Error(err);
    }
});
exports.getGithubUser = getGithubUser;

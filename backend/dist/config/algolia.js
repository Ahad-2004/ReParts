"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.algoliaClient = void 0;
const algoliasearch_1 = __importDefault(require("algoliasearch"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const appId = process.env.ALGOLIA_APP_ID || '';
const adminKey = process.env.ALGOLIA_ADMIN_KEY || '';
exports.algoliaClient = (0, algoliasearch_1.default)(appId, adminKey);

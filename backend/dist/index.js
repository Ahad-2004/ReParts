"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const listings_1 = __importDefault(require("./routes/listings"));
const upload_1 = __importDefault(require("./routes/upload"));
const chat_1 = __importDefault(require("./routes/chat"));
const admin_1 = __importDefault(require("./routes/admin"));
dotenv_1.default.config();
process.on('unhandledRejection', (reason) => {
    // eslint-disable-next-line no-console
    console.error('Unhandled Rejection at:', reason);
});
process.on('uncaughtException', (err) => {
    // eslint-disable-next-line no-console
    console.error('Uncaught Exception:', err);
});
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.use('/api/listings', listings_1.default);
app.use('/api/upload', upload_1.default);
app.use('/api/chat', chat_1.default);
app.use('/api/admin', admin_1.default);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const general_1 = require("./src/config/helpers/general");
const database_config_1 = __importDefault(require("./src/config/envs/database.config"));
const databaseConfig = (0, database_config_1.default)();
if (databaseConfig.url) {
    (0, lodash_1.unset)(databaseConfig, 'host');
    (0, lodash_1.unset)(databaseConfig, 'port');
    (0, lodash_1.unset)(databaseConfig, 'username');
    (0, lodash_1.unset)(databaseConfig, 'password');
    (0, lodash_1.unset)(databaseConfig, 'database');
}
else {
    (0, lodash_1.unset)(databaseConfig, 'url');
}
const defaultDataSourceOptions = Object.assign(Object.assign({ applicationName: 'lawma_app', name: 'default', type: 'postgres' }, (0, lodash_1.omit)(databaseConfig, ['maxPoolConnCount'])), { synchronize: false, logging: ['error', 'warn', 'log'], logger: 'file', entities: ['./src/**/*.entity.{js,ts}'], migrations: [(0, general_1.pathFromSrc)('config/database/migrations/**/*.{js,ts}')], seeds: [(0, general_1.pathFromSrc)('config/database/seeds/**/*.{js,ts}')], factories: [(0, general_1.pathFromSrc)('config/database/factories/**/*.{js,ts}')], subscribers: [(0, general_1.pathFromSrc)('config/database/subscribers/**/*.{js,ts}')], migrationsRun: false, migrationsTableName: 'migrations', useUTC: true, connectTimeoutMS: 30000, dropSchema: false, migrationsTransactionMode: 'all', metadataTableName: 'typeorm_metadata', maxQueryExecutionTime: 15000, installExtensions: true, logNotifications: true, ssl: true, extra: {
        max: databaseConfig.maxPoolConnCount,
        connectionTimeoutMillis: 30000,
        idleTimeoutMillis: 10000,
        ssl: {
            rejectUnauthorized: false,
        },
    }, cache: {
        type: 'database',
        tableName: 'typeorm_cache_table',
    } });
exports.default = defaultDataSourceOptions;

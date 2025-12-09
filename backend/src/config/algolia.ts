import algoliasearch from 'algoliasearch';
import dotenv from 'dotenv';

dotenv.config();

const appId = process.env.ALGOLIA_APP_ID || '';
const adminKey = process.env.ALGOLIA_ADMIN_KEY || '';

export const algoliaClient = algoliasearch(appId, adminKey);

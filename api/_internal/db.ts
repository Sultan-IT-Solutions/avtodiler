import { neon } from '@neondatabase/serverless';
import { ApiError } from './errors.js';

export const getSql = () => {
	const url = process.env.DATABASE_URL;
	if (!url) {
		throw new ApiError(503, 'DATABASE_NOT_CONFIGURED', 'Service unavailable');
	}
	return neon(url);
};

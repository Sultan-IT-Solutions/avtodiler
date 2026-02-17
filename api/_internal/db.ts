import { neon } from '@neondatabase/serverless';

export const getSql = () => {
	const url = process.env.DATABASE_URL;
	if (!url) {
		throw new Error('Missing DATABASE_URL');
	}
	return neon(url);
};

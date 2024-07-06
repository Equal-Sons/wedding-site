import { type Handler } from '@netlify/functions';

export interface RsvpSubmitRequest {
	firstGuest: {
		name: string;
		email: string;
	};
	secondGuest: {
		name: string;
		email: string;
	};
	willAttendDinner?: boolean;
}

export interface RsvpSubmitResponse {
	okay: boolean;
	error?: string;
}

export const handler: Handler = async (event, context) => {
	try {
		const requestBody = JSON.parse(event.body ?? '{}') as RsvpSubmitRequest;
		if (!requestBody.firstGuest) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					okay: false,
					error: 'Request body is missing required field "firstGuest"',
				}),
			};
		}

		const mailData = {
			from: {
				email: 'justin@equalsons.com',
			},
			personalizations: [
				{
					to: [
						{
							email: 'justin@equalsons.com',
						},
					],
					dynamic_template_data: {
						name: 'Justin Kauszler',
						site_url: process.env.SITE_URL,
					},
				},
			],
			template_id: 'd-57ff2244962346e686962215af5ca57b',
		};

		const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(mailData),
		});

		console.log(res);

		return {
			statusCode: 200,
			body: JSON.stringify({ okay: true }),
		};
	} catch (error) {
		console.error(error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				okay: false,
				error: error instanceof Error ? error.toString() : 'Unknown error',
			}),
		};
	}
};

export default handler;

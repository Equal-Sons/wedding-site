import { type Handler } from '@netlify/functions';
import Joi from 'joi';
export interface RsvpSubmitRequest {
	firstGuest: {
		name: string;
		email: string;
	};
	secondGuest?: {
		name: string;
		email: string;
	};
	willAttendDinner?: boolean;
}

export interface RsvpSubmitResponse {
	okay: boolean;
	error?: string;
}

export const handler: Handler = async (event) => {
	try {
		const requestBody = JSON.parse(event.body ?? '{}') as RsvpSubmitRequest;

		const schema = Joi.object({
			firstGuest: Joi.object({
				name: Joi.string().required(),
				email: Joi.string().email().allow(''),
			}).required(),
			secondGuest: Joi.object({
				name: Joi.string().allow(''),
				email: Joi.string().email().allow(''),
			}),
			willAttendDinner: Joi.boolean(),
		});

		const validationResult = schema.validate(requestBody);

		if (validationResult.error) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					okay: false,
					error: validationResult.error.message,
				}),
			};
		}

		const first_name = requestBody.firstGuest?.name?.split(' ')[0];
		const last_name = requestBody.firstGuest?.name?.split(' ')[1];

		const mailData = {
			list_ids: ['5c42ff59-4da5-42d9-9fce-0c3986f9a373'],
			contacts: [{
				email: requestBody.firstGuest?.email,
				external_id: requestBody.firstGuest.name,
				...(first_name && { first_name }),
				...(last_name && { last_name }),
			}],
		};

		if (requestBody.secondGuest?.email ?? requestBody.secondGuest?.name) {
			const guest_first_name = requestBody.secondGuest?.name?.split(' ')[0];
			const guest_last_name = requestBody.secondGuest?.name?.split(' ')[1];

			mailData.contacts.push({
				email: requestBody.secondGuest?.email,
				external_id: requestBody.secondGuest?.name,
				...(guest_first_name && { first_name: guest_first_name }),
				...(guest_last_name && { last_name: guest_last_name }),
			});
		}

		if (requestBody.willAttendDinner) {
			mailData.list_ids.push('d3579498-2f96-40c1-a8c4-045e9a80b0b1');
		}

		await fetch('https://api.sendgrid.com/v3/marketing/contacts', {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(mailData),
		});

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

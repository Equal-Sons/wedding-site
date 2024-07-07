import { type Handler } from '@netlify/functions';
import { createEvent } from 'ics';

export const handler: Handler = async (event, context) => {
	try {
		const SITE_URL = 'https://jayandash.com';
		const eventDetails = {
			dinner: {
				title: 'Justin and Ashley\'s Wedding Dinner',
				description: 'An intimate dinner with close friends and family. Please come dressed to impress. We will have a photographer on site to capture the memories.',
				location: 'Blue Atlas 1000 Carlisle Ave Unit 200, Richmond, VA 23231',
				startArray: [2024, 11, 21, 16],
				duration: { hours: 4 },
				startString: '20241121T210000Z', // in UTC (add 5 hours for EST)
				endString: '20241122T010000Z',
			},
			reception: {
				title: 'Justin and Ashley\'s Wedding Reception',
				description: 'Join us for our celebration of love and commitment!',
				location: 'Triple Crossing Brewery 5203 Hatcher St, Richmond, VA 23231',
				startArray: [2024, 11, 22, 17],
				duration: { hours: 5 },
				startString: '20241122T220000Z', // in UTC (add 5 hours for EST)
				endString: '20241123T030000Z',
			},
		};

		for (const [key, value] of Object.entries(eventDetails)) {
			const {
				title,
				description,
				location,
				startArray,
				duration,
				startString,
				endString,
			} = value;

			const { error, value: ics } = createEvent({
				// @ts-expect-error this is fine
				start: startArray,
				duration,
				title,
				description,
				location,
				url: SITE_URL,
			});

			if (error) {
				throw error;
			}

			const eventTitle = encodeURIComponent(title);
			const eventDescription = encodeURIComponent(description);
			const eventLocation = encodeURIComponent(location);
			const website = encodeURIComponent(SITE_URL);

			const googleLink = `https://www.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${startString}/${endString}&details=${eventDescription}&location=${eventLocation}&sprop=website:${website}`;

			console.log(key, 'ics', ics);
			console.log(key, 'google link', googleLink);
		}

		return {
			statusCode: 200,
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

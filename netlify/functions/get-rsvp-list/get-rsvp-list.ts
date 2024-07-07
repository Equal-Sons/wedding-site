import { type Handler } from '@netlify/functions';
import { google } from 'googleapis';

// Scopes for Google Sheets
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

// Spreadsheet ID and range
const SPREADSHEET_ID = '1-Iz9K9HY-Gi3JQHxWSypYy2CIFX37ppXVTZ3zJ-xom0'; // Spreadsheet ID from env vars
const SHEET_TAB_ID = 1980313349; // Sheet tab ID of the RSVP list
const RANGE = 'A3:D250'; // Adjust the range as needed

export type RsvpDataFromSheet = [string, string | undefined, string, string];

export interface RsvpDataResponse {
	guestName: string;
	guestPlusName?: string;
	canGuestHavePlusOne: boolean;
	isGuestInvitedToDinner: boolean;
}

// Initialize Google Sheets API client
async function getSheetData(): Promise<RsvpDataResponse[]> {
	const auth = new google.auth.GoogleAuth({
		credentials: {
			client_email: process.env.GOOGLE_CLIENT_EMAIL,
			private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/gm, '\n'), // Handle newline in private key
		},
		scopes: SCOPES,
	});

	google.options({ auth });

	// Setup Google Sheets API client
	const sheets = google.sheets('v4');

	// Get Metadata of the spreadsheet
	const sheetMetadata = await sheets.spreadsheets.get({
		spreadsheetId: SPREADSHEET_ID,
	});

	// Find the sheet tab with the given ID - this is so we don't have to ref the name of tab which can change
	const sheet = sheetMetadata.data.sheets?.find((_sheet) => _sheet.properties?.sheetId === SHEET_TAB_ID);

	if (!sheet) {
		throw new Error(`Sheet with ID ${SHEET_TAB_ID} not found`);
	}

	// Get only the data from the specified range
	const response = await sheets.spreadsheets.values.get({
		spreadsheetId: SPREADSHEET_ID,
		range: `'${sheet.properties?.title}'!${RANGE}`,
	}) as unknown as { data: { values: RsvpDataFromSheet[] } };

	return response.data.values?.map((row) => ({
		guestName: row[0],
		guestPlusName: row[1],
		canGuestHavePlusOne: (row[2].toUpperCase() === 'YES'),
		isGuestInvitedToDinner: (row[3].toUpperCase() === 'YES'),
	}));
}

export const handler: Handler = async () => {
	try {
		const data = await getSheetData();

		return {
			statusCode: 200,
			body: JSON.stringify({
				okay: true,
				data,
			}),
		};
	} catch (error) {
		return {
			statusCode: 500,
			body: JSON.stringify({
				okay: false,
				error: 'Unable to fetch data from Google Sheets',
				details: error instanceof Error ? error.toString() : 'Unknown error',
			}),
		};
	}
};

export default handler;

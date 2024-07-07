document.addEventListener('DOMContentLoaded', () => {
	let rsvpList = [];

	fetchRsvpList().then(data => {
		rsvpList = data;
	});

	const form = document.getElementById('search-form');
	const input = document.getElementById('name');
	const resultsContainer = document.getElementById('results');
	const selectionDetails = document.getElementById('selection-details');

	input.addEventListener('input', () => {
		if (input.value.length > 3) {
			searchAndDisplayResults(input.value, false);
		} else {
			resultsContainer.innerHTML = '';
			selectionDetails.innerHTML = '';
		}
	});

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		searchAndDisplayResults(input.value, true);
	});

	function searchAndDisplayResults(name, isButtonClick) {
		const query = name.toLowerCase().trim();

		if (query.length > 3 || isButtonClick) {
			const matches = rsvpList.filter(rsvp =>
				rsvp.guestName.toLowerCase().includes(query) ||
				(rsvp.guestPlusName && rsvp.guestPlusName.toLowerCase().includes(query))
			);

			displayResults(matches);
		} else if (!isButtonClick) {
			resultsContainer.innerHTML = '';
			selectionDetails.innerHTML = '';
		} else {
			resultsContainer.innerHTML = '<div class="max-w-lg alert alert-warning">Please enter a valid name</div>';
		}
	}

	function displayResults(matches) {
		resultsContainer.innerHTML = '';
		selectionDetails.innerHTML = '';

		if (matches.length === 0) {
			resultsContainer.innerHTML = '<div class="max-w-lg alert alert-warning text-center">Sorry it doesn\'t appear you\'re on the RSVP list. If you believe this is a mistake please contact Ashley or Justin directly.</div>';
			return;
		}

		matches.forEach(match => {
			let matchedName = '';

			if (match.guestName.toLowerCase().includes(input.value.toLowerCase().trim())) {
				matchedName = match.guestName;
			} else if (match.guestPlusName && match.guestPlusName.toLowerCase().includes(input.value.toLowerCase().trim())) {
				matchedName = match.guestPlusName;
			}

			const item = document.createElement('div');
			item.className = 'card w-full max-w-lg shadow-lg bg-white p-8 mb-4';
			item.innerHTML = `
							<div class="flex items-center justify-between">
									<p class="text-lg font-bold">${matchedName}</p>
									<button class="btn btn-primary mt-2" onclick="selectGuest('${match.guestName}', '${match.guestPlusName || ''}', ${match.canGuestHavePlusOne}, ${match.isGuestInvitedToDinner})">Select</button>
							</div>
					`;
			resultsContainer.appendChild(item);
		});
	}

	window.selectGuest = (guestName, guestPlusName, canGuestHavePlusOne, isGuestInvitedToDinner) => {
		resultsContainer.innerHTML = ''; // Hide selection UI
		selectionDetails.innerHTML = `
					<div class="card w-full max-w-lg shadow-lg bg-white p-8 mb-4">
							<p class="text-lg font-bold">Selected Party: ${guestName}${guestPlusName ? ' & ' + guestPlusName : ''}</p>
							<p class="italic">To receive notifications regarding your invite, the wedding, and calendar reminders please enter your email address below.</p>
							<label class="label mt-2">
									<span class="label-text">Email for ${guestName}:</span>
									<input type="email" id="email-${guestName}" class="input input-bordered w-full mb-4" required>
							</label>
							${guestPlusName ? `
							<label class="label mt-2">
									<span class="label-text">Email for ${guestPlusName}:</span>
									<input type="email" id="email-${guestPlusName}" class="input input-bordered w-full mb-4" required>
							</label>
							` : canGuestHavePlusOne ? `
							<label class="label mt-2">
									<span class="label-text">Name for Plus One:</span>
									<input type="text" id="plus-one-name" class="input input-bordered w-full mb-4" required>
							</label>
							<label class="label mt-2">
									<span class="label-text">Email for Plus One:</span>
									<input type="email" id="plus-one-email" class="input input-bordered w-full mb-4" required>
							</label>
							` : ''}
							${isGuestInvitedToDinner ? `
							<div class="divider">You're invited!</div>
							<p class="label-text">As special guests you're invited our pre-reception dinner the night prior on Thursday Nov 21st. This event is limited to family and the wedding party only.</p>
							<label class="cursor-pointer label mt-2">
									<span class="label-text">Attend Dinner?</span>
									<input id="attend-dinner" type="checkbox" class="checkbox checkbox-primary ml-2">
							</label>
							` : ''}
							<button class="btn btn-accent mt-4" onclick="submitRsvp('${guestName}', '${guestPlusName || ''}', ${canGuestHavePlusOne}, ${isGuestInvitedToDinner})">Submit RSVP</button>
					</div>
			`;
	}

	window.submitRsvp = async (guestName, guestPlusName, canGuestHavePlusOne, isGuestInvitedToDinner) => {
		const emailGuest = document.getElementById(`email-${guestName}`).value;
		let emailPlusGuest = null;
		if (guestPlusName) {
			emailPlusGuest = document.getElementById(`email-${guestPlusName}`).value;
		}
		let plusOneName = null;
		let plusOneEmail = null;

		console.log(!guestPlusName.length, canGuestHavePlusOne)
		if (!guestPlusName.length && canGuestHavePlusOne) {
			// Reset guest plus name
			guestPlusName = null;
			plusOneName = document.getElementById('plus-one-name').value;
			plusOneEmail = document.getElementById('plus-one-email').value;
		}
		let attendDinner = false;
		if (isGuestInvitedToDinner) {
			attendDinner = document.getElementById('attend-dinner').checked;
		}

		// Placeholder for handling the submission
		try {
			const body = {
				firstGuest: {
					name: guestName,
					email: emailGuest
				},
				secondGuest: {
					name: guestPlusName ?? plusOneName ?? '',
					email: emailPlusGuest ?? plusOneEmail ?? ''
				},
				willAttendDinner: attendDinner
			};

			await fetch('/.netlify/functions/submit-rsvp', {
				method: 'POST',
				body: JSON.stringify(body)
			});

		} catch (error) {
			console.error(error);
		}
	};
});

function fetchRsvpList() {
	return fetch('/.netlify/functions/get-rsvp-list')
		.then(response => response.json())
		.then(data => data.data);
}
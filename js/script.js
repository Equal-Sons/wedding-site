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
					resultsContainer.innerHTML = '<div class="alert alert-warning">Please enter a valid name</div>';
			}
	}

	function displayResults(matches) {
			resultsContainer.innerHTML = '';
			selectionDetails.innerHTML = '';

			if (matches.length === 0) {
					resultsContainer.innerHTML = '<div class="alert alert-warning">No matches found</div>';
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
					item.className = 'card shadow-sm bg-base-100 p-4 mb-4';
					item.innerHTML = `
							<div>
									<p class="text-lg font-bold">${matchedName}</p>
									<button class="btn btn-secondary mt-2" onclick="selectGuest('${match.guestName}', '${match.guestPlusName || ''}', ${match.canGuestHavePlusOne}, ${match.isGuestInvitedToDinner})">Select</button>
							</div>
					`;
					resultsContainer.appendChild(item);
			});
	}

	window.selectGuest = (guestName, guestPlusName, canGuestHavePlusOne, isGuestInvitedToDinner) => {
			resultsContainer.innerHTML = ''; // Hide selection UI
			selectionDetails.innerHTML = `
					<div class="card shadow-sm bg-base-100 p-4 mb-4">
							<p class="text-lg font-bold">Selected Party: ${guestName}${guestPlusName ? ' & ' + guestPlusName : ''}</p>
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
							<p class="text-lg">You're invited!<p>
							<label class="cursor-pointer label mt-2">
									<span class="label-text">Would you like to attend the dinner event the day before?</span>
									<input id="attend-dinner" type="checkbox" class="checkbox checkbox-primary ml-2">
							</label>
							` : ''}
							<button class="btn btn-primary mt-4" onclick="submitRsvp('${guestName}', '${guestPlusName || ''}', ${canGuestHavePlusOne}, ${isGuestInvitedToDinner})">Submit RSVP</button>
					</div>
			`;
	}

	window.submitRsvp = (guestName, guestPlusName, canGuestHavePlusOne, isGuestInvitedToDinner) => {
			const emailGuest = document.getElementById(`email-${guestName}`).value;
			let emailPlusGuest = '';
			if (guestPlusName) {
					emailPlusGuest = document.getElementById(`email-${guestPlusName}`).value;
			}
			let plusOneName = '';
			let plusOneEmail = '';
			if (!guestPlusName && canGuestHavePlusOne) {
					plusOneName = document.getElementById('plus-one-name').value;
					plusOneEmail = document.getElementById('plus-one-email').value;
			}
			let attendDinner = false;
			if (isGuestInvitedToDinner) {
					attendDinner = document.getElementById('attend-dinner').checked;
			}

			// Placeholder for handling the submission
			alert(`RSVP Submitted:\nGuest: ${guestName} (${emailGuest})\n` +
						`Plus One: ${guestPlusName ? guestPlusName + ' (' + emailPlusGuest + ')' : plusOneName ? plusOneName + ' (' + plusOneEmail + ')' : 'No'}\n` +
						`Attend Dinner: ${attendDinner ? 'Yes' : 'No'}`);
	};
});

function fetchRsvpList() {
	return fetch('/.netlify/functions/get-rsvp-list')
			.then(response => response.json())
			.then(data => data.data);
}
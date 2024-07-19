document.addEventListener("DOMContentLoaded", function () {
	// Use buttons to toggle between views
	document
		.querySelector("#inbox")
		.addEventListener("click", () => load_mailbox("inbox"));
	document
		.querySelector("#sent")
		.addEventListener("click", () => load_mailbox("sent"));
	document
		.querySelector("#archived")
		.addEventListener("click", () => load_mailbox("archive"));
	document.querySelector("#compose").addEventListener("click", compose_email);

	// By default, load the inbox
	load_mailbox("inbox");
});

function compose_email() {
	// initialize all elements variables
	const recipient = document.querySelector("#compose-recipients");
	const subject = document.querySelector("#compose-subject");
	const body = document.querySelector("#compose-body");
	const form = document.querySelector("#compose-form");

	// Show the mailbox and hide other views
	document.querySelector("#emails-view").style.display = "none";
	document.querySelector("#compose-view").style.display = "block";
	document.querySelector("#single-email").style.display = "none";

	// Clear out composition fields
	recipient.value = "";
	subject.value = "";
	body.value = "";

	//add event listener for when the form is submitted
	form.addEventListener(
		"submit",
		(e) => {
			e.preventDefault();
			//check if all the fields are filled in
			if (
				recipient.value !== "" &&
				subject.value !== "" &&
				body.value !== ""
			) {
				// fields filled in, make api request
				console.log("creating new email");
				fetch("/emails", {
					method: "POST",
					body: JSON.stringify({
						recipients: recipient.value,
						subject: subject.value,
						body: body.value,
					}),
				})
					.then((res) => {
						if (res.status === 201) {
							load_mailbox("sent");
						}
					})
					.catch((err) => console.log("something went wrong: ", err));
			} else {
				// fields not filled in, do nothing
			}
		},
		{ once: true },
	);
}

function load_mailbox(mailbox) {
	// Show the mailbox and hide other views
	document.querySelector("#emails-view").style.display = "block";
	document.querySelector("#compose-view").style.display = "none";
	document.querySelector("#single-email").style.display = "none";

	// initialize elements already on the page
	const emailContainer = document.querySelector("#emails-view");

	// Show the mailbox name
	emailContainer.innerHTML = `<h3>${
		mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
	}</h3>`;

	//fetch the emails from the backend
	fetch(`emails/${mailbox}`)
		.then((res) => res.json())
		.then((res) => {
			//loop over every email
			for (email of res) {
				// create elements to render on the page
				const div = document.createElement("div");
				if (email.read) {
					div.classList.add("read");
				} else {
					div.classList.add("unread");
				}
				div.classList.add("email");
				div.setAttribute("data-email", email.id);
				const p = document.createElement("p");
				p.innerHTML = `<span>${email.sender}: </span> '${email.subject}'`;
				const timestamp = document.createElement("p");
				timestamp.innerHTML = email.timestamp;
				div.append(p, timestamp);
				emailContainer.append(div);
			}
		});
}

// listen for clicks on the document
document.addEventListener("click", (e) => {
	let id;
	// gather the id for the email based on what type of element is clicked
	if (e.target.tagName === "DIV") {
		id = e.target.dataset.email;
	} else if (e.target.tagName === "SPAN") {
		id = e.target.parentElement.parentElement.dataset.email;
	} else if (e.target.tagName === "P" || e.target.tagName === "BUTTON") {
		id = e.target.parentElement.dataset.email;
	}
	if (e.target.tagName === "BUTTON") {
		// archive the email
	} else {
		// show the email
		if (id) showEmail(id);
	}
});

const showEmail = (id) => {
	// showing the correct view
	document.querySelector("#emails-view").style.display = "none";
	document.querySelector("#compose-view").style.display = "none";
	document.querySelector("#single-email").style.display = "block";

	// fetching the correct email, and making a request to update read to true
	fetch(`emails/${id}`)
		.then((res) => res.json())
		.then((res) => {
			if (!res.read) {
				fetch(`emails/${id}`, {
					method: "PUT",
					body: JSON.stringify({
						read: true,
					}),
				});
			}

			// setting all the fields that need to be displayed
			document.querySelector("#reading-recipient").innerHTML =
				res.recipients.map((recipient) => recipient).join();
			document.querySelector("#reading-sender").innerHTML = res.sender;
			document.querySelector("#reading-subject").innerHTML = res.subject;
			document.querySelector("#reading-time").innerHTML = res.timestamp;
			document.querySelector("#reading-body").innerHTML = res.body;
			document.querySelector("#archive").setAttribute("data-email", id);
			document
				.querySelector("#archive")
				.classList.add("btn", "btn-outline-primary", "btn-md");

			// if the email is archived, change the button text to unarchive
			if (res.archived) {
				document.querySelector("#archive").innerText = "Unarchive";

				/* if the sender is the same as the current user remove the button alltogether 
                    (as in the problem set described, "This requirement does not apply to emails in the Sent mailbox") */
			} else if (!res.archived) {
				document.querySelector("#archive").innerText = "Archive";
			} else if (document.querySelector("h2").innerText === res.sender) {
				document.querySelector("#archive").remove();
			}
			document.querySelector("#reply").setAttribute("data-email", id);
			document
				.querySelector("#reply")
				.classList.add("btn", "btn-outline-primary", "btn-md");

			// when button is clicked change the archived state to the opposite than what it was
			document.querySelector("#archive").addEventListener(
				"click",
				(e) => {
					console.log(`Archiving email with id of ${id}`);
					fetch(`emails/${id}`, {
						method: "PUT",
						body: JSON.stringify({
							archived: !res.archived,
						}),
					}).then(() => load_mailbox("inbox"));
				},
				{ once: true },
			);

			document.querySelector("#reply").addEventListener(
				"click",
				() => {
					compose_email();
					const recipient = (document.querySelector(
						"#compose-recipients",
					).value = res.sender);
					if (res.subject.split(":")[0] === "Re") {
						const subject = (document.querySelector(
							"#compose-subject",
						).value = `${res.subject}`);
					} else {
						const subject = (document.querySelector(
							"#compose-subject",
						).value = `Re: ${res.subject}`);
					}
					const body = (document.querySelector(
						"#compose-body",
					).value = `on ${res.timestamp} ${res.sender} wrote: ${res.body}`);
				},
				{ once: true },
			);
		});
};

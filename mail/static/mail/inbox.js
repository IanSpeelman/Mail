document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  // initialize all elements variables
  const recipient = document.querySelector("#compose-recipients")
  const subject = document.querySelector("#compose-subject")
  const body = document.querySelector("#compose-body")  
  const form = document.querySelector("#compose-form")
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  
  // Clear out composition fields
  recipient.value = '';
  subject.value = '';
  body.value = '';

  //add event listener for when the form is submitted
  form.addEventListener("submit", (e) => {
    e.preventDefault()
    //check if all the fields are filled in
    if (recipient.value !== "" && subject.value !== "" && body.value !== ""){
      // fields filled in, make api request
      fetch("/emails", {
        method: "POST",
        body: JSON.stringify({
          recipients: recipient.value,
          subject: subject.value,
          body: body.value
        })
      })
      .then(res => {
        if (res.status === 201){
          load_mailbox("sent")
        }
      })
      .catch(err => console.log("something went wrong: ", err))
    } else {
      // fields not filled in, do nothing
    }
  });

}

function load_mailbox(mailbox) {
 
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


}
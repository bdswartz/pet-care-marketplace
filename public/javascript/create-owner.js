async function createAccountHandler(event) {
  event.preventDefault();

  const first_name = document.querySelector('input[name="first"]').value.trim();
  const last_name = document.querySelector('input[name="last"]').value.trim();
  const email = document.querySelector('input[name="email"]').value.trim();
  const address = document.querySelector('input[name="address"]').value.trim();
  const city = document.querySelector('input[name="city"]').value.trim();
  const state = document.querySelector('input[name="state"]').value.trim();
  const zipcode = document.querySelector('input[name="zipcode"]').value.trim();
  console.log(zipcode);
  const password = document
    .querySelector('input[name="password"]')
    .value.trim();
  // const is_owner = true;

  if ((first_name, last_name, email, password)) {
    if (document.getElementById("own").checked) {
      const response = await fetch("/api/owners/", {
        method: "POST",
        body: JSON.stringify({
          first_name: first_name,
          last_name: last_name,
          email: email,
          password: password,
          address: address,
          city: city,
          state: state,
          zip_code: zipcode,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // document.location.reload();
        document.location.replace("/dashboard");
      } else {
        alert(response.statusText);
      }
    }
  }
}

document
  .querySelector("#signupSubmit")
  .addEventListener("click", createAccountHandler);

async function changeRadiusHandler(event) {
event.preventDefault();
const inputDistance = document.querySelector("#radius-input").value.trim();

// puts radius into the walker db for use in user-customized job searches
if (inputDistance) {
    const res = await fetch(`/api/walkers`, {
      method: "PUT",
      body: JSON.stringify({
        radius: inputDistance,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
    console.log("res",res.body);
    document.location.reload();
  }
document.querySelector('#radius-change').modal('hide');
};

document.querySelector("#submit-radius").addEventListener("click", changeRadiusHandler);

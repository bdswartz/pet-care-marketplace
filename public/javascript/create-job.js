$(".new-job-btn")
  .off("click")
  .on("click", function (event) {
    const id = event.target.getAttribute("data-value");
    async function createPostHandler(event) {
      event.preventDefault();
    
      const payStr = document.querySelector('input[name="pay"]').value.trim();
      const pay = parseInt(payStr);
      // const pay = 0;
      const dateStart = document.getElementById("date-start").value;
      const hourStart = document.getElementById("hour-start").value;
      const timeframe = dateStart + "T" + hourStart + "Z";
      const food_and_water = document.getElementById('food_and_water').checked;
      const treat = document.getElementById('treat').checked;
      const litter_box = document.getElementById('litter_box').checked
      const locationStr = document
        .querySelector('input[name="location"]')
        .value.trim();
      const location = parseInt(locationStr);

      var visitType = document.getElementById("visit-type");
      var selectedValue = visitType.options[visitType.selectedIndex].value;
      if (selectedValue == "Walk") {
        walk = true;
        check_in = false;
      } else {
        walk = false;
        check_in = true;
      }

      const petid = id;

      if ((pay, location, timeframe)) {
        const response = await fetch("/api/jobs", {
          method: "POST",
          body: JSON.stringify({
            pay: pay,
            check_in: check_in,
            food_and_water: food_and_water,
            walk: walk,
            treat: treat,
            litter_box: litter_box,
            timeframe: timeframe,
            location: location,
            completed: false,
            walker_id: null,
            // change this to accept the pet ID based off what one was selected
            animal_id: petid,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          document.location.reload();
        } else {
          alert(response.statusText);
        }
      }
    }

    document
      .querySelector(".create-job-form")
      .addEventListener("submit", createPostHandler);
  });

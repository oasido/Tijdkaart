$(document).ready(function () {
  // Activate the daterangepicker in the selected ID inputs
  $('#time-add, #time-edit').daterangepicker({
    timePicker: true,
    timePicker24Hour: true,
    parentEl: '.modal-body',
    timePickerIncrement: 5,
    startDate: moment().hour(7).minute(30).second(0),
    endDate: moment().hour(16).minute(45).second(0),
    opens: 'center',
    locale: {
      format: 'DD/MM/YYYY HH:mm',
    },
  });

  // Menu burger
  $('.navbar-burger').click(function () {
    $('.navbar-burger').toggleClass('is-active');
    $('.navbar-menu').toggleClass('is-active');
  });

  // Show Add Modal
  $('#add-btn').on('click', function () {
    $('#add-modal').addClass('is-active');
  });
  // Delete Add Modal
  $('#cancel-btn, .delete').on('click', function () {
    $('#add-modal').removeClass('is-active');
  });

  let shiftsID, comment, startTime, endTime; // Declare the variables used to fetch() outside of function
  // Show Edit Modal
  $('button[data-id]').on('click', function () {
    shiftsID = $(this).attr('data-id'); // Save the database ID of the button from data attr.
    comment = $(this).attr('data-comment'); // Save the comment string of the button from data attr.

    const dataArray = [];
    $(this)
      .closest('tr')
      .find('.data-table')
      .each(function () {
        dataArray.push($(this).text());
      }); // Gets the values from the row and puts them in an array

    // Get startTime & endTime in daterangerpicker's format, similar to what we have in the DB
    startTime = dataArray[0] + '/' + moment().format('YYYY') + ' ' + dataArray[1];
    endTime = dataArray[0] + '/' + moment().format('YYYY') + ' ' + dataArray[2];

    // Insert data
    $('#time-edit').val(`${startTime} - ${endTime}`);
    $('#comment-edit').val(comment);
    $('#edit-modal').addClass('is-active');
  });

  // Remove Edit Modal
  $('#cancel-btn, .delete').on('click', function () {
    $('#edit-modal').removeClass('is-active');
  });

  // Add Modal post using fetch()
  $('#submit-add').on('click', function () {
    const timeSplit = $('#time-add').val().split(' - ');
    comment = $('#comment-add').val();
    const shiftData = { startTime: timeSplit[0], endTime: timeSplit[1], comment };
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shiftData),
    };
    fetch('/add', options);
    $('#add-modal').removeClass('is-active');
    setTimeout(() => {
      location.reload();
    }, 50);
  });

  // Edit Modal post using fetch()
  $('#submit-edit').on('click', function () {
    const timeSplit = $('#time-edit').val().split(' - ');
    comment = $('#comment-edit').val();
    const shiftData = { shiftsID, startTime: timeSplit[0], endTime: timeSplit[1], comment };
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shiftData),
    };
    fetch('/edit', options);
    $('#edit-modal').removeClass('is-active');
    setTimeout(() => {
      location.reload();
    }, 50);
  });

  // Delete shift button using fetch()
  $('#submit-delete').on('click', function () {
    const shiftData = { shiftsID };
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shiftData),
    };
    const confirmation = confirm('Are you sure you want to delete this shift?');
    if (confirmation) {
      fetch('/delete', options);
      $('#edit-modal').removeClass('is-active');
      setTimeout(() => {
        location.reload();
      }, 50);
    }
  });

  // Hide modals upon clicking ESC
  $(document).on('keyup', function (e) {
    if (e.key == 'Escape') $('#edit-modal, #add-modal').removeClass('is-active');
  });

  // jQuery month picker
  $('#daterange').MonthPicker({
    Button: "<div class='control'><a class='button is-grey'>📅</a></div>",
    MonthFormat: 'yy-mm',
  });
});

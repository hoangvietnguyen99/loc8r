// file in public folder will be treated by express as statics files
// to be downloaded to the browser instead of run on the server

// this file is for validating in the browser with JQuery
$('#addReview').submit(function e() { // listens for the submit event of the review form
  $('.alert.alert-danger').hide();
  if (!$('input#name').val() || !$('select#rating').val() || !$('textarea#review').val()) { // checks for any missing values
    if ($('.alert.alert-danger').length) { // shows of injects an error message into the page if a value is missing
      $('.alert.alert-danger').show();
    } else {
      $(this).prepend('<div role="alert" class="alert alert-danger">All fields required, please try again</div>');
    }
    return false; // prevents the form from submitting if a value is missing
  }
});
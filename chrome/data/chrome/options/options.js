/**
 * Turn checkboxes on & off from localStorage based on their values
 */
var checkboxes = $('input[type="checkbox"]').each(function () {

  var val = $(this).attr('value'),
      key = 'buffer.op.' + val,
      setting = localStorage.getItem(key);

  if( setting === val || setting === null) {
    $(this).attr('checked', true);
  } else {
    $(this).attr('checked', false);
  }

});

/**
 * Fill in text inputs from localStorage
 */
var inputs = $('input[type="text"]').each(function () {

  var val = $(this).attr('placeholder'),
      key = 'buffer.op.' + $(this).attr('name');

  if( localStorage.getItem(key) !== val ) {
    $(this).val(localStorage.getItem(key));
  }

});

var shouldReset = false;
var currentCombo = [];

$('input[name="key-combo"]').keyup(function(e) {
  // when all keys are released, if the user starts pressing keys again in
  // the input field we should clean it up first (see keydown handler)
  shouldReset = true;
});

$('input[name="key-combo"]').keydown(function(e) {
  // we don't actually use the input
  e.preventDefault();

  // keyup fired, we need to reset the field
  if (shouldReset) {
      currentCombo = [];
      shouldReset = false;
  }

  if (e.which === 8) {
    // backspace pressed, clear combo
    currentCombo = [];
    $(this).val('');
    return;
  }

  var pressedKey = null;

  switch(e.which) {
      case 16:
        var pressedKey = "shift";
        break;
      case 17:
        pressedKey = "ctrl";
        break;
      case 18:
        pressedKey = "alt";
        break;
      case 91:
        pressedKey = "command";
        break;
      default:
        pressedKey = String.fromCharCode(e.which).toLowerCase();

        // ignore other keys (e.g., arrows or functions)
        if (!pressedKey.match(/[a-z0-9]/)) {
          pressedKey = null;
        }

        break;
  }

  // we don't allow duplicate keys (or null)
  if (!pressedKey || currentCombo.indexOf(pressedKey) > -1) {
      return;
  }

  // add the new key
  currentCombo.push(pressedKey);
  $(this).val(currentCombo.join("+"));
});

/**
 * Save it all
 */
$('.submit').click(function (ev) {

  ev.preventDefault();

  // clean previous error class
  $('input[name="key-combo"]').removeClass("error");

  var keycombo = $('input[name="key-combo"]').val();

  // Check the key combo
  // The regex:
  //
  // starts with (one or more) of     alt / shift / ctrl / command and a plus
  // then (zero or more) of           a-z / 0-9 (only one) and a plus
  // then ends with                   a-z / 0-9 (only one)
  if( keycombo.length > 0 &&
      keycombo.match(/^(((alt|shift|ctrl|command)\+)+([a-z0-9]{1}\+)*([a-z0-9]{1}))$/gi) === null ) {
    // Indicate there's an error
    $('input[name="key-combo"]').addClass('error');
    // Wiggle the box
    var button = $(this).addClass('wiggle');
    setTimeout(function () {
      $(button).removeClass('wiggle');
    }, 1500 * 0.15);
    return;
  }

  // Save the checkbox values based on their values
  $(checkboxes).each(function () {

    var val = $(this).attr('value'),
        key = 'buffer.op.' + val;

    if( $(this).prop('checked') ) {
      localStorage.setItem(key, val);
    } else {
      localStorage.setItem(key, 'false');
    }

  });

  // Save the checkbox values based on their values
  $(inputs).each(function () {

    var val = $(this).val(),
        key = 'buffer.op.' + $(this).attr('name'),
        placeholder = $(this).attr('placeholder');

    if( val !== placeholder ) {
      if( val === '' ) val = placeholder;
      localStorage.setItem(key, val);
    }

  });

  // Indicate to the user that things went well
  $(this).text('Saved').addClass("saved");

  // Ask for a good review
  if( ! localStorage.getItem('buffer.reviewed') ) {
    $('header h1:not(.highlight)').html('Enjoying <strong>Buffer</strong>? Head over to the <a class="fivestars" href="https://chrome.google.com/webstore/detail/noojglkidnpfjbincgijbaiedldjfbhh?hl=en-GB" target="_bank">Chrome Web Store</a> and give us 5 stars.<br>We will love you <em>forever</em>.').addClass('highlight');
  }

});

/**
 * Reset the save button
 */
$('input').on('keyup click', function () {
  $('.submit').text('Save').removeClass("saved");
});

/**
 * Store that the user has already been to the Web Store (:. we <3 them)
 */
$('body').on('click', '.fivestars', function () {
  localStorage.setItem('buffer.reviewed', 'true');
  $('header h1').html("You're <strong>awesome</strong> &hearts;").addClass('love').removeClass('highlight');
});

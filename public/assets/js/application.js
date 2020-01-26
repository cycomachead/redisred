$(document).ready(() => {
  const KEYS = ['title', 'url'];
  const urlParams = new URLSearchParams(location.search);
  KEYS.forEach((key) => {
    $(`input[name="${key}"]`).val(urlParams.get(key));
  });
});

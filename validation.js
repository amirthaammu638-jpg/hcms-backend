function validateRegister() {
const pwd = document.getElementById('password');
if (pwd && pwd.value.length < 6) { alert('Password must be at least 6 chars'); return false; }
return true;
}


function validateComplaint() {
const title = document.querySelector('input[name="title"]').value.trim();
const desc = document.querySelector('textarea[name="description"]').value.trim();
if (!title) { alert('Title required'); return false; }
if (desc.length < 10) { alert('Description must be at least 10 chars'); return false; }
return true;
}
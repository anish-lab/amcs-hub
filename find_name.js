const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('attendance_dump.html', 'utf-8');
const $ = cheerio.load(html);

console.log('--- PROFILE ICON / DROPDOWN / USER DETAILS IN ATTENDANCE DUMP ---');
$('#profileIcon, #profileDropdown, .profile-icon, .user-name, .student-name, .dropdown-item').each((_, el) => {
  console.log($(el).text().trim());
});

console.log('--- ALL SPANS / LABELS / DIVS IN HEADER ---');
$('header, nav, .container-fluid').find('span, a, p, div').each((_, el) => {
  const t = $(el).text().trim();
  if (t && t.length < 50 && (t.includes('ANISH') || t.includes('24PT') || t.includes('Welcome') || t.includes('Student'))) {
    console.log('Header text:', t);
  }
});

const puppeteer = require("puppeteer");
const OpenAI = require("openai");
require("dotenv").config();

const profile = {
  gender: "female",
  name_title: "Miss",
  name_first: "Jennie",
  name_last: "Nichols",
  location_street_number: 8929,
  location_street_name: "Valwood Pkwy",
  location_city: "Billings",
  location_state: "Michigan",
  location_country: "United States",
  location_postcode: "63104",
  location_coordinates_latitude: "-69.8246",
  location_coordinates_longitude: "134.8719",
  location_timezone_offset: "+9:30",
  location_timezone_description: "Adelaide, Darwin",
  email: "jennie.nichols@example.com",
  login_uuid: "7a0eed16-9430-4d68-901f-c0d4c1c3bf00",
  login_username: "yellowpeacock117",
  login_password: "addison",
  login_salt: "sld1yGtd",
  login_md5: "ab54ac4c0be9480ae8fa5e9e2a5196a3",
  login_sha1: "edcf2ce613cbdea349133c52dc2f3b83168dc51b",
  login_sha256:
    "48df5229235ada28389b91e60a935e4f9b73eb4bdb855ef9258a1751f10bdc5d",
  dob_date: "1992-03-08T15:13:16.688Z",
  dob_age: 30,
  registered_date: "2007-07-09T05:51:59.390Z",
  registered_age: 14,
  phone: "(272) 790-0888",
  cell: "(489) 330-2385",
  picture_large: "https://randomuser.me/api/portraits/men/75.jpg",
  picture_medium: "https://randomuser.me/api/portraits/med/men/75.jpg",
  picture_thumbnail: "https://randomuser.me/api/portraits/thumb/men/75.jpg",
  nat: "US",
};

// Set up OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_TOKEN,
});

async function identifyFieldNames(profileFields, html) {
  const prompt = `
  I'm going to give you profile fields in JSON and an HTML document. Give 
  Provide a JSON mapping of profile fields to input names for the HTML form on the page
  with the given output format.

  ---

  # Output format

  {
    "profile_property_name": "html_input_field_name"
  }

  --- 

  # Profile fields

  ${JSON.stringify(profileFields)}

  ---

  # HTML document

  ${html}
  
  `;

  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
  });

  const mapping = JSON.parse(chatCompletion.choices[0].message.content);
  return mapping;
}

async function fillForm(url, profileFields) {
  let browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url);
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);

  // Get the mapping of profile fields to input names
  const fieldMapping = await identifyFieldNames(profileFields, bodyHTML);

  for (const [profileKey, inputName] of Object.entries(fieldMapping)) {
    const value = profileFields[profileKey];
    if (!value) {
      console.error("Missing value for field", profileKey);
      continue;
    }
    try {
      await page.type(`input[name="${inputName}"]`, value);
    } catch (error) {
      console.error(`Could not find input field with name: ${inputName}`);
    }
  }

  await browser.close();
}

// Read URL and profile fields from command line arguments
fillForm("https://www.roboform.com/filling-test-all-fields", profile).catch(
  console.error
);

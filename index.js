const puppeteer = require("puppeteer");
const OpenAI = require("openai");
require("dotenv").config();

const { BROWSERLESS_TOKEN, OPENAI_API_KEY } = process.env;

const BROWSERLESS_PARAMS = new URLSearchParams({
  token: BROWSERLESS_TOKEN,
  timeout: 300000,
  // proxy: "residential",
  // proxyCountry: "us",
  headless: true,
  stealth: true,
  // proxySticky: true,
}).toString();

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
  email: "jennie.nichols@example.com",
  dob_age: 30,
  phone: "(272) 790-0888",
  cell: "(489) 330-2385",
  nat: "US",
};

// Set up OpenAI configuration
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

async function identifyFieldNames(profileFields, html) {
  const prompt = `
  I'm going to give you profile fields in JSON and an HTML document. Give 
  Provide a JSON mapping of profile fields to input names for the HTML form on the page
  with the given output format.

  If you can't find a form field for a given profile field, do not include it in the output.

  ---

  # Output format

  {
    "profile_property_name": "html_input_field_name"
  }

  Where "html_input_field_name" is always a string.

  --- 

  # Profile fields

  ${JSON.stringify(profileFields)}

  ---

  # HTML document

  ${html}
  
  `;

  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4o",
    response_format: { type: "json_object" },
  });

  const mapping = JSON.parse(chatCompletion.choices[0].message.content);
  return mapping;
}

async function fillForm(url, profileFields) {
  const browser = await puppeteer.connect({
    browserWSEndpoint: `wss://chrome.browserless.io?${BROWSERLESS_PARAMS}`,
  });
  const page = await browser.newPage();
  await page.goto(url);
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);

  // Get the mapping of profile fields to input names
  const fieldMapping = await identifyFieldNames(profileFields, bodyHTML);
  console.log({ fieldMapping });

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

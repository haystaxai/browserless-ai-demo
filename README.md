# Puppeteer Form Filler

This is a Node.js script that uses Puppeteer to automate filling out web forms with predefined profile data. It also utilizes the OpenAI API to map the profile fields to the corresponding input field names on the web page.

## Prerequisites

- Node.js (v14 or later)
- A valid OpenAI API key
- A valid Browserless token (optional, for running in a headless browser)

## Setup

1. Clone the repository or download the source code.
2. Navigate to the project directory.
3. Run `npm install` to install the required dependencies.
4. Create a `.env` file (see below)
5. Run `npm start`

## `.env` file

```
OPENAI_API_KEY=your_openai_api_key
BROWSERLESS_TOKEN=your_browserless_token
```

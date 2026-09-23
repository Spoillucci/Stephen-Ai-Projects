/**
 * Gmail Inbox Manager
 *
 * Scans Gmail for emails you are tagged into (CC, direct To, or a label),
 * extracts context and requested actions with Gemini, and appends rows to a
 * Google Sheet task list so you can skip the inbox.
 */

const CONFIG = {
  // Gmail search for emails to process. Examples:
  //   'cc:me OR to:me is:unread'
  //   'label:EA-Inbox'
  //   'cc:me OR to:me newer_than:7d'
  GMAIL_QUERY: 'label:EA-Inbox is:unread',

  // Sheet tab name
  SHEET_NAME: 'Task List',

  // Mark processed Gmail threads with this label (created on first run)
  PROCESSED_LABEL: 'EA-Processed',

  // Max emails per run (Gmail + Gemini quotas)
  BATCH_SIZE: 20,

  // Gemini model
  GEMINI_MODEL: 'gemini-2.0-flash',
};

const HEADERS = [
  'Received',
  'From',
  'Subject',
  'Context',
  'Requested Action',
  'Urgency',
  'Deadline',
  'Status',
  'Gmail Link',
  'Thread ID',
  'Message ID',
];

/**
 * Run once from the Apps Script editor to authorize and create the sheet layout.
 */
function setup() {
  const sheet = getOrCreateSheet_();
  ensureHeaders_(sheet);
  ensureProcessedLabel_();
  ensureTrigger_();
  SpreadsheetApp.getUi().alert(
    'Gmail Inbox Manager is ready.\n\n' +
      '1. Create a Gmail filter that applies the EA-Inbox label to emails you want tracked.\n' +
      '2. Set Script Properties: SPREADSHEET_ID, GEMINI_API_KEY.\n' +
      '3. processNewEmails runs every 15 minutes, or run it manually now.'
  );
}

/**
 * Main job: fetch new matching emails and append task rows.
 */
function processNewEmails() {
  const props = PropertiesService.getScriptProperties();
  const apiKey = props.getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY in Script Properties.');
  }

  const sheet = getOrCreateSheet_();
  ensureHeaders_(sheet);
  const processedLabel = ensureProcessedLabel_();
  const knownMessageIds = loadKnownMessageIds_(sheet);

  const query = buildQuery_(CONFIG.GMAIL_QUERY, CONFIG.PROCESSED_LABEL);
  const threads = GmailApp.search(query, 0, CONFIG.BATCH_SIZE);

  let added = 0;
  for (const thread of threads) {
    const messages = thread.getMessages();
    const message = messages[messages.length - 1];
    const messageId = message.getId();

    if (knownMessageIds.has(messageId)) {
      continue;
    }

    const extraction = extractWithGemini_(message, apiKey);
    appendTaskRow_(sheet, message, thread, extraction);
    knownMessageIds.add(messageId);
    thread.addLabel(processedLabel);
    added++;
  }

  Logger.log('Processed %s thread(s), added %s row(s).', threads.length, added);
}

/**
 * Manual test on the most recent matching email.
 */
function testOnLatestEmail() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY in Script Properties.');
  }

  const query = buildQuery_(CONFIG.GMAIL_QUERY.replace(' is:unread', ''), CONFIG.PROCESSED_LABEL);
  const threads = GmailApp.search(query, 0, 1);
  if (!threads.length) {
    SpreadsheetApp.getUi().alert('No matching emails found. Adjust CONFIG.GMAIL_QUERY or your Gmail filter.');
    return;
  }

  const message = threads[0].getMessages().pop();
  const extraction = extractWithGemini_(message, apiKey);
  Logger.log(JSON.stringify(extraction, null, 2));
  SpreadsheetApp.getUi().alert(
    'Latest email analyzed:\n\n' +
      'From: ' + message.getFrom() + '\n' +
      'Subject: ' + message.getSubject() + '\n\n' +
      'Context: ' + extraction.context + '\n\n' +
      'Requested: ' + extraction.requestedAction
  );
}

function buildQuery_(baseQuery, processedLabel) {
  return baseQuery + ' -label:' + processedLabel;
}

function getOrCreateSheet_() {
  const props = PropertiesService.getScriptProperties();
  const spreadsheetId = props.getProperty('SPREADSHEET_ID');
  if (!spreadsheetId) {
    throw new Error('Missing SPREADSHEET_ID in Script Properties.');
  }

  const ss = SpreadsheetApp.openById(spreadsheetId);
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  }
  return sheet;
}

function ensureHeaders_(sheet) {
  const firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  if (firstRow[0] !== HEADERS[0]) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }

  // Status dropdown in column H
  const statusRange = sheet.getRange('H2:H');
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Open', 'In Progress', 'Waiting', 'Done', 'Not Needed'], true)
    .setAllowInvalid(false)
    .build();
  statusRange.setDataValidation(rule);
}

function ensureProcessedLabel_() {
  const name = CONFIG.PROCESSED_LABEL;
  const existing = GmailApp.getUserLabelByName(name);
  return existing || GmailApp.createLabel(name);
}

function ensureTrigger_() {
  const triggers = ScriptApp.getProjectTriggers();
  const hasTrigger = triggers.some(function (t) {
    return t.getHandlerFunction() === 'processNewEmails';
  });
  if (!hasTrigger) {
    ScriptApp.newTrigger('processNewEmails').timeBased().everyMinutes(15).create();
  }
}

function loadKnownMessageIds_(sheet) {
  const lastRow = sheet.getLastRow();
  const ids = new Set();
  if (lastRow < 2) {
    return ids;
  }

  const messageIdCol = HEADERS.indexOf('Message ID') + 1;
  const values = sheet.getRange(2, messageIdCol, lastRow - 1, 1).getValues();
  values.forEach(function (row) {
    if (row[0]) {
      ids.add(String(row[0]));
    }
  });
  return ids;
}

function appendTaskRow_(sheet, message, thread, extraction) {
  const gmailLink = 'https://mail.google.com/mail/u/0/#inbox/' + thread.getId();
  const row = [
    message.getDate(),
    message.getFrom(),
    message.getSubject(),
    extraction.context || '',
    extraction.requestedAction || '',
    extraction.urgency || 'Normal',
    extraction.deadline || '',
    'Open',
    gmailLink,
    thread.getId(),
    message.getId(),
  ];

  sheet.appendRow(row);
  const newRow = sheet.getLastRow();
  sheet.getRange(newRow, 1).setNumberFormat('mmm d, yyyy h:mm am/pm');
  sheet.getRange(newRow, 9).setFormula('=HYPERLINK("' + gmailLink + '","Open")');
}

function extractWithGemini_(message, apiKey) {
  const body = trimEmailBody_(message.getPlainBody() || message.getBody());
  const prompt = [
    'You extract executive-assistant task details from email.',
    'Return ONLY valid JSON with these keys:',
    '{"context":"1-2 sentence summary of what this email is about",',
    '"requestedAction":"what the recipient specifically needs to do, or \\"None\\" if informational only",',
    '"urgency":"Low|Normal|High|Urgent",',
    '"deadline":"explicit date/time mentioned, or empty string if none"}',
    '',
    'Rules:',
    '- Focus on what is being asked of the person reading this email.',
    '- If the email is FYI only, set requestedAction to "None".',
    '- Do not invent deadlines.',
    '',
    'From: ' + message.getFrom(),
    'To: ' + message.getTo(),
    'Cc: ' + message.getCc(),
    'Subject: ' + message.getSubject(),
    'Date: ' + message.getDate(),
    '',
    'Body:',
    body,
  ].join('\n');

  const url =
    'https://generativelanguage.googleapis.com/v1beta/models/' +
    CONFIG.GEMINI_MODEL +
    ':generateContent?key=' +
    apiKey;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  };

  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  if (response.getResponseCode() !== 200) {
    Logger.log('Gemini error: %s', response.getContentText());
    return fallbackExtraction_(message);
  }

  const data = JSON.parse(response.getContentText());
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return safeParseJson_(text) || fallbackExtraction_(message);
}

function fallbackExtraction_(message) {
  const snippet = trimEmailBody_(message.getPlainBody() || message.getBody(), 280);
  return {
    context: snippet,
    requestedAction: 'Review email and determine next step',
    urgency: 'Normal',
    deadline: '',
  };
}

function safeParseJson_(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }
    try {
      return JSON.parse(match[0]);
    } catch (e2) {
      return null;
    }
  }
}

function trimEmailBody_(body, maxLen) {
  const limit = maxLen || 6000;
  const cleaned = String(body)
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s*>.*$/gm, '')
    .trim();
  return cleaned.length > limit ? cleaned.slice(0, limit) + '\n...[truncated]' : cleaned;
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Inbox Manager')
    .addItem('Process new emails now', 'processNewEmails')
    .addItem('Test on latest email', 'testOnLatestEmail')
    .addToUi();
}

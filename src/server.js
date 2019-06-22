const fs = require('fs')
const { google } = require('googleapis')
const express = require('express')
const cors = require('cors')

const app = express()

app.set(express.urlencoded({ extended: false }))

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = './src/config/token.json'

// Load client secrets from a local file.
fs.readFile('./src/config/credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err)
  // Authorize a client with credentials, then call the Gmail API.
  authorize(JSON.parse(content), findMessages)
})

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  )

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback)
    oAuth2Client.setCredentials(JSON.parse(token))
    callback(oAuth2Client)
  })
}

function findMessages(auth) {
  let gmail = google.gmail('v1')
  gmail.users.messages.list(
    {
      auth: auth,
      userId: 'me',
      maxResults: 10,
      q: ''
    },
    function(err, response) {
      // console.log(response.data)
      // console.log('++++++++++++++++++++++++++')
      printMessage(response.data.messages, auth) //snippet not available
    }
  )
}

let body = []

function printMessage(messageID, auth) {
  let gmail = google.gmail('v1')

  gmail.users.messages.get(
    {
      auth: auth,
      userId: 'me',
      id: messageID[0].id
    },
    function(err, response) {
      body.push(response.data.snippet)
      messageID.splice(0, 1)
      if (messageID.length > 0) printMessage(messageID, auth)
      else {
        console.log(JSON.stringify(body))
        console.log('All Done')
      }
    }
  )
}

app.use(cors())

app.get('/', (req, res) => {
  res.json(body)
})

app.listen(3333)

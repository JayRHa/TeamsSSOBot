// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// index.js is used to setup and configure your bot

// Import required pckages
const path = require('path');

// Read botFilePath and botFileSecret from .env file.
const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

const restify = require('restify');

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
const {
    CloudAdapter,
    ConversationState,
    MemoryStorage,
    UserState,
    ConfigurationBotFrameworkAuthentication,
    TeamsSSOTokenExchangeMiddleware
} = require('botbuilder');

const { TeamsBot } = require('./bots/teamsBot');
const { MainDialog } = require('./dialogs/mainDialog');
const { env } = require('process');

const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(process.env);

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about how bots work.
const adapter = new CloudAdapter(botFrameworkAuthentication);
const memoryStorage = new MemoryStorage();
const tokenExchangeMiddleware = new TeamsSSOTokenExchangeMiddleware(memoryStorage, env.connectionName);
adapter.use(tokenExchangeMiddleware);

adapter.onTurnError = async (context, error) => {
    console.error(`\n [onTurnError] unhandled error: ${ error }`);

    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${ error }`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );

    await conversationState.delete(context);
};


const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);
const userTokenMap = new Map();

// Create the main dialog.
const dialog = new MainDialog(userTokenMap);
const bot = new TeamsBot(conversationState, userState, dialog, userTokenMap);

const server = restify.createServer();
server.use(restify.plugins.bodyParser());

server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log(`\n${ server.name } listening to ${ server.url }`);
    console.log('\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator');
    console.log('\nTo talk to your bot, open the emulator select "Open Bot"');
});

server.post('/api/messages', async (req, res) => {
    await adapter.process(req, res, (context) => bot.run(context));
});
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ConfirmPrompt, DialogSet, DialogTurnStatus, OAuthPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { LogoutDialog } = require('./logoutDialog');

const CONFIRM_PROMPT = 'ConfirmPrompt';
const MAIN_DIALOG = 'MainDialog';
const MAIN_WATERFALL_DIALOG = 'MainWaterfallDialog';
const OAUTH_PROMPT = 'OAuthPrompt';
const { SimpleGraphClient } = require('../simpleGraphClient');
const { polyfills } = require('isomorphic-fetch');
const { CardFactory } = require('botbuilder-core');
const { tokenResponseAdaptiveCard } = require('../cards/tokenResponseAdpativeCard');
const { AdaptiveCards } = require("@microsoft/adaptivecards-tools");

class MainDialog extends LogoutDialog {
    constructor(userTokenMap) {
        super(MAIN_DIALOG, process.env.connectionName);

        this.addDialog(new OAuthPrompt(OAUTH_PROMPT, {
            connectionName: process.env.connectionName,
            text: 'Please Sign In',
            title: 'Sign In',
            timeout: 300000
        }));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
            this.promptStep.bind(this),
            this.fetchGraphTokenStep.bind(this),
        ]));

        this.initialDialogId = MAIN_WATERFALL_DIALOG;
        this.userTokenMap = userTokenMap;
    }

    /**
     * The run method handles the incoming activity (in the form of a DialogContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} dialogContext
     */
    async run(context, accessor, userTokenMap) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);
        const dialogContext = await dialogSet.createContext(context);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id, userTokenMap);
        }
    }

    async promptStep(stepContext) {
        try {
            return await stepContext.beginDialog(OAUTH_PROMPT);
        } catch (err) {
            console.error(err);
        }
    }

    async fetchGraphTokenStep(stepContext) {
        // Get the token from the previous step. Note that we could also have gotten the
        // token directly from the prompt itself. There is an example of this in the next method.
        const tokenResponse = stepContext.result;
        if (!tokenResponse || !tokenResponse.token) {
            await stepContext.context.sendActivity('Login was not successful please try again.');
        } else {
            const client = new SimpleGraphClient(tokenResponse.token);
            const me = await client.getMe();
            const title = me ? me.jobTitle : 'UnKnown';
            await stepContext.context.sendActivity(`You're logged in as ${me.displayName} (${me.userPrincipalName}); your job title is: ${title}; your photo is: `);
            const photoBase64 = await client.GetPhotoAsync(tokenResponse.token);
            const card = CardFactory.thumbnailCard("", CardFactory.images([photoBase64]));
            await stepContext.context.sendActivity({attachments: [card]});
            const cardJson = AdaptiveCards.declare(tokenResponseAdaptiveCard(tokenResponse.token)).render();
            await stepContext.context.sendActivity({
                type: "message",
                attachments: [
                  CardFactory.adaptiveCard(cardJson)
                ]
             });
             // Set the token in userTokenMap. This is used to map the token to the user Id.
            this.userTokenMap.set(stepContext.context.activity.from.id, tokenResponse.token);
        }
        return await stepContext.endDialog();
    }
}

module.exports.MainDialog = MainDialog;

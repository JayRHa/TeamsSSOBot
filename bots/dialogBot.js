// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { TeamsActivityHandler, CardFactory } = require('botbuilder');
const { tokenResponseAdaptiveCard } = require('../cards/tokenResponseAdpativeCard');
const { AdaptiveCards } = require('@microsoft/adaptivecards-tools');
const axios = require('axios');
class DialogBot extends TeamsActivityHandler {
    conversationMap = new Map();
    constructor(conversationState, userState, dialog, userTokenMap) {
        super();
        if (!conversationState) {
            throw new Error('[DialogBot]: Missing parameter. conversationState is required');
        }
        if (!userState) {
            throw new Error('[DialogBot]: Missing parameter. userState is required');
        }
        if (!dialog) {
            throw new Error('[DialogBot]: Missing parameter. dialog is required');
        }
        if (!userTokenMap) {
            throw new Error('[DialogBot]: Missing parameter. userTokenMap is required');
        }

        this.conversationState = conversationState;
        this.userState = userState;
        this.userTokenMap = userTokenMap;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty('DialogState');

        this.onMessage(async (context, next) => {
            console.log('Running dialog with Message Activity.');
            console.log(context.activity);

            // Extract the value.
            const value = context.activity.value;
            if (value && value.action) {
                const action = value.action;
                if (action === 'positive_feedback') {
                    await context.sendActivity('Thanks for the positive feedback!');
                    await next();
                    return;
                } else if (action === 'negative_feedback') {
                    await context.sendActivity('Sorry to hear that. We will use your feedback to improve our service.');
                    await next();
                    return;
                } else if (action === 'restart_conversation') {
                    // Clear conversationMap.
                    this.conversationMap.clear();
                    await context.sendActivity('Conversation restarted.');
                    await next();
                    return;
                }
                await context.sendActivity(`Feedback action ${ value.action } not recognized.`);
                await next();
                return;
            }

            // Extract the text.
            const text = context.activity.text;
            if (text) {
                if (text === 'get-my-token') {
                    // Run the Dialog with the new message Activity.
                    await this.dialog.run(context, this.dialogState, this.userTokenMap);
                    await next();
                    return;
                }
    
                if (text === 'Restart Conversation') {
                    // Clear conversationMap.
                    this.conversationMap.clear();
                    await context.sendActivity('Conversation restarted.');
                    await next();
                    return;
                }
    
                // Create the key for the conversation if it does not exist.
                if (!this.conversationMap.has(context.activity.from.id)) {
                    this.conversationMap.set(context.activity.from.id, []);
                }
    
                // Save the conversation in the conversation array.
                this.conversationMap.get(context.activity.from.id).push({
                    "user": text
                });
    
                // Simulate call to OpenAI.
                await axios.post('https://enjlm4jrjn4vp.x.pipedream.net/openai', {
                    userId: context.activity.from.id,
                    token: this.userTokenMap.get(context.activity.from.id),
                    conversations: this.conversationMap.get(context.activity.from.id)
                });
                // Simulate reply.
                const systemReply = `You said: ${text}`;
                const cardJson = AdaptiveCards.declare(tokenResponseAdaptiveCard(systemReply)).render();
                await context.sendActivity({
                    type: "message",
                    attachments: [
                        CardFactory.adaptiveCard(cardJson)
                    ],
                    suggestedActions: {
                        actions: [
                          {
                            type: "imBack",
                            title: "Restart Conversation",
                            value: "restart_conversation"
                          },
                        ]
                    },
                });
    
                // Save the conversation in the conversation array.
                this.conversationMap.get(context.activity.from.id).push({
                    "system": systemReply
                });
    
                // Print the conversation array.
                console.log(this.conversationMap);
            }
            await next();
        });
    }

    /**
     * Override the ActivityHandler.run() method to save state changes after the bot logic completes.
     */
    async run(context) {
        await super.run(context);

        // Save any state changes. The load happened during the execution of the Dialog.
        await this.conversationState.saveChanges(context, false);
        await this.userState.saveChanges(context, false);
    }
}

module.exports.DialogBot = DialogBot;

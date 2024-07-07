function tokenResponseAdaptiveCard(token) {
  const utcNow = () => new Date().toISOString();
  return {
    "type": "AdaptiveCard",
    "body": [
      {
        "type": "TextBlock",
        "size": "Medium",
        "weight": "Bolder",
        "text": "Assistant"
      },
      {
        "type": "ColumnSet",
        "columns": [
          {
            "type": "Column",
            "items": [
              {
                "type": "Image",
                "style": "Person",
                "url": "https://cdn-icons-png.flaticon.com/512/4712/4712109.png",
                "altText": "${creator.name}",
                "size": "Small"
              }
            ],
            "width": "auto"
          },
          {
            "type": "Column",
            "items": [
              {
                "type": "TextBlock",
                "weight": "Bolder",
                "text": "BOT",
                "wrap": true
              },
              {
                "type": "TextBlock",
                "spacing": "None",
                "text": `Created ${utcNow()}`,
                "isSubtle": true,
                "wrap": true
              }
            ],
            "width": "stretch"
          }
        ]
      },
      {
        "type": "TextBlock",
        "text": token,
        "wrap": true
      },
      {
        "type": "ColumnSet",
        "columns": [
          {
            "type": "Column",
            "width": "auto",
            "items": [
              {
                "type": "ActionSet",
                "actions": [
                  {
                    "type": "Action.Submit",
                    "title": "👍",
                    "data": {
                      "id": "positive_feedback",
                      "action": "positive_feedback",
                    }
                  }
                ]
              }
            ]
          },
          {
            "type": "Column",
            "width": "auto",
            "items": [
              {
                "type": "ActionSet",
                "actions": [
                  {
                    "type": "Action.Submit",
                    "title": "👎",
                    "style": "destructive",
                    "data": {
                      "id": "negative_feedback",
                      "action": "negative_feedback",
                    }
                  }
                ]
              }
            ]
          },
        ]
      }
    ],
    "actions": [
      {
        "type": "Action.OpenUrl",
        "title": "Open Google",
        "url": "https://www.google.com"
      },
    ],
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "version": "1.6"
  };
}


module.exports.tokenResponseAdaptiveCard = tokenResponseAdaptiveCard;
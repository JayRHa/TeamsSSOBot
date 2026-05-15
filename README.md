<!-- unified-readme:start -->
<div align="center">

# Teams SSO Bot

**Archived Microsoft Teams SSO bot sample and experimentation project.**

Authenticate. Authorize. Respond.

[![GitHub stars](https://img.shields.io/github/stars/JayRHa/TeamsSSOBot?style=for-the-badge&logo=github&color=f4c542)](https://github.com/JayRHa/TeamsSSOBot/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/JayRHa/TeamsSSOBot?style=for-the-badge&logo=github&color=4078c0)](https://github.com/JayRHa/TeamsSSOBot/network/members)
[![GitHub issues](https://img.shields.io/github/issues/JayRHa/TeamsSSOBot?style=for-the-badge&logo=github&color=d73a4a)](https://github.com/JayRHa/TeamsSSOBot/issues)
[![Contributors](https://img.shields.io/github/contributors/JayRHa/TeamsSSOBot?style=for-the-badge&logo=github&color=28a745)](https://github.com/JayRHa/TeamsSSOBot/graphs/contributors)

---

`Teams SSO` | `JavaScript` | `Public` | `Archived`

</div>

## What is this?

Teams SSO Bot is a reference project for understanding how single sign-on works inside a Microsoft Teams bot. It connects the Teams client, Bot Framework bot endpoint, Microsoft Entra ID, and optional downstream API calls into one authentication flow.

## Project Context

- Use it to understand or demonstrate the Teams SSO handshake for a conversational bot.
- The key boundary is token handling: Teams obtains the user token, the bot validates identity and scopes, then continues the conversation or calls a downstream API.
- This repository is archived and kept as a reference implementation.

## How It Works

At runtime, Microsoft Teams sends bot activities to the bot endpoint. When the bot needs identity, Teams performs the SSO token exchange with Microsoft Entra ID and returns a token result that the bot can validate before responding.

```mermaid
sequenceDiagram
    participant User as Teams user
    participant Teams as Microsoft Teams
    participant Bot as Bot endpoint
    participant Entra as Microsoft Entra ID
    participant API as Downstream API
    User->>Teams: Opens bot or sends message
    Teams->>Bot: Sends activity with Teams context
    Bot->>Teams: Requests SSO token
    Teams->>Entra: Performs token exchange
    Entra-->>Teams: Returns delegated token
    Teams-->>Bot: Provides token result
    Bot->>Bot: Validates claims and scopes
    Bot->>API: Calls downstream API when configured
    Bot-->>User: Returns authenticated response
```

## Quick Start

1. Review the project context and workflow below.
2. Clone the repository:

   ```bash
   git clone https://github.com/JayRHa/TeamsSSOBot.git
   ```

3. Continue with the setup, usage, or workflow sections below.

---
<!-- unified-readme:end -->

## Status

This repository is archived and kept for reference.

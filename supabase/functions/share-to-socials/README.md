# Share to Socials Edge Function

This function handles the auto-posting of new pets to social media platforms.

## Current Status
Currently, this function runs in **MOCK MODE**. It simulates a successful post to Facebook and Instagram but does not actually call their APIs.

## Configuration for Real Posting
To enable real posting, you will need to:

1.  **Facebook/Instagram**:
    *   Create a Meta App.
    *   Get a Page Access Token.
    *   Set `FACEBOOK_PAGE_TOKEN` and `FACEBOOK_PAGE_ID` in Supabase secrets.

2.  **Twitter/X**:
    *   Create a Developer Account.
    *   Get API Key, Secret, Access Token, and Access Token Secret.
    *   Set `TWITTER_API_KEY`, `TWITTER_API_SECRET`, etc. in Supabase secrets.

## Deployment
To deploy this function:
```bash
supabase functions deploy share-to-socials --no-verify-jwt
```

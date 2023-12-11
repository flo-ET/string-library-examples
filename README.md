# String Library - Usage guides

Here you'll find helpful guides on how to use the Easytranslate string Library.
Please read the ["String Library"](https://documenter.getpostman.com/view/7540275/SWECVaCX?version=latest#27e35853-7dbb-44bf-ba27-955afa2ed7d9) section in our API documentation before you continue.

## Simple workflow example
This is a very high level guide on basic steps we recommend you follow in order to work with the string library.
*It's assumed that you have created an easytranslate account, string library and an automation workflow. You've also generated a PAT or otherwise have access to fresh access tokens.*

0. Regestier a webhook endpoint here `/laas/api/v1/teams/:team_name/webhook-endpoints`. Make sure to specify `task.updated` in the events to reduce incoming traffic.
1. Gather and compile strings you want translated. See examples [here](code_examples/README.md).
2. Use `strings-library/api/v1/teams/:team-name/libraries/:library-id/sync` to transfer your strings and all available translations to the library[^1]. Keep the list of key names handy for the coming steps.
3. If you wish to translate these strings immediately, use `/strings-library/api/v1/teams/:team-name/libraries/:library-id/start-automation` and provide the list of key names[^2].
4. _Wait for the translation to finish. If you follow step 0, you'll automatically be notified when a batch of strings is finished_
5. (optional) Validate the webhook event for the workflow step[^3] and language (`data.attributes.type` and `data.attributes.target_language`).
6. Fetch the translations from the URL provided in the webhook body (`data.attributes.target_content`). You'll receive a flat json with key value pairs like this:
```javascript
{
    'path.to.attribute': 'text in target language'
}
``` 
7. (optional) Follow the examples mentioned in step 1 to integrate the translations into your system.

[^1] There are other ways to update the library, but this is the preferred method. It's not mandatory to provide translations, but considering you already have some translations, this avoids paying for them.
[^2] Not providing Key names will automatically send all untranslated strings in the library for translation. Providing key names allows you to send keys for translation that have already been translated.
[^3] Automation workflows typically consist of 3 steps: `machine_translation`, `translation`, `internal_review`. If your automation workflow includes human translation, you probably want to ignore when the `machine_translation` step is finished. `internal_review` is handy if you make your own edits to projects using the review editor, and want those updates to apply to your system, whether you have human translation step or not.
# string-library-examples
Code examples and functions that help transforming CRM objects for use with EasyTranslate's String Library API

Many modern CRMs give you multilingual support and APIs to retrieve and update translations for CRM objects (often called entity in these examples).

You can use and modify these functions to work with your specific platform.
In general, the goal is to transform Entities like this:

```javascript
let arrayOfCRMEntities = [
    {

        id: 123123123,
        attributes: {
            someHtml: "<b>This is a Product",
            otherHtml: ["<h1>I am a header</h1>", "I am a footer <tag>"]
            name: 'Some Product',
            language: 'en-us',
        },
        iDoNotWantThisKey: "reference.link/dont_translate",
        translations: [
            {
                id: 321321312,
                attributes: {
                    language: 'fr'
                },
                ...
            }
        ]      
    },
    ...
]
```
...then flatten and filter the entity ...
```javascript
let flatEntities = [
    {
        id: 123123123,
        "attributes.someHtml": "<b>This is a Product",
        "attributes.otherHtml.0": "<h1>I am a header</h1>",
        ...
    },
    ...
]
```
...into string library compatible objects like this:
```javascript
let keys = {
    "entity.123123123.attributes.name": {
        "name": "entity.123123123.attributes.name",
        "external_id": "123123123",
        "strings": {
            "en": {
                "text": "Some Product",
                "language_code": "en",
                "external_id": "123123123"
            },
            "fr_FR": {
                "text": "",
                "language_code": "fr_FR",
                "external_id": "321321321"
            }
        }
    },
    "entity.123123123.attributes.otherHtml.0": {
        "name": "entity.123123123.attributes.otherHtml.0",
        "external_id": "123123123",
        "strings": {
            "en": {
                "text": "<h1>I am a header</h1>",
                "language_code": "en"
            }
        }
    },
    ...
}
```
There are steps involved in making sure this works properly:
1. Iterate the array of Entities
2. Flatten the entity, since nested strings do not work for this.
3. Filter for child attributes that should be translated
4. Plug the resulting flat entity into some constructor to create the library entry

On returning translated content back to your crm (especially with deeply nested objects):
1. Retrieve the string library from EasyTranslate
2. Also retrieve the array of Entities that you want to update
3. Flatten the entities like you did above 
4. Iterate the library, and reconstruct the flat entities from the keys (many keys for one Object/Entity)
5. Assign the attributes of the reconstructed object to the target flat object
6. unflatten the target object, making it ready to send to your CRM

NOTE: If your CRM creates new Objects with some reference to the original Object for each translation, consider using the string external IDs to embedd that information.


## [Javascript snippet](/javascript/CMStoStringLib.js)
(No readme for now. Please read docs in file for technical reference)


For any questions, contact flo@easytranslate.com

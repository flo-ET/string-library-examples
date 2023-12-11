const flat = require("flat")
const _ = require("lodash")


class libKey {
    constructor(keyName, keyExtId) {
        this.name = keyName,
        this.external_id = keyExtId,
        this.strings = {}
    }
}

/**
 * Returns a string to be put in libKey.strings
 *  langCode needs to be ISO 639-1 with locale indication for target languages (i.e. it_IT)
 */
class libString {
    constructor(strExtId, langCode, text) {
            this.text = text,
            this.language_code = langCode,
            this.external_id = strExtId
    }
}

/* 
 Mapping assumes that your CMS uses language codes and that they are not identical to ET language codes
 You need to figure out the mapping yourself
 You will also need to create mappings in both directions for source and target language codes
*/ 
const langMapCMSToEtSource = {
    'en-us': 'en',
    'de-de': 'de',
}
const langMapCMSToETTarget = {
    'fr': 'fr_FR',
}

/**
 * This function assumes that your object has a 'lanugage' attribute
 * @param {Object} _entity 
 * @param {string} _attr 
 * @returns {libKey}
 */
function makeLibraryEntry(_entity, _attr) {
    if (_entity[_attr]) {
        let keyName = `${_entity.id}.${_attr}`;
        let keyExtId = _entity.id;
        let key = {[keyName]: new libKey(keyName, keyExtId)};
        let sourceString = {[langMapCMSToEtSource[_entity.attributes.language]]: new libString(`source.${keyExtId}`, langMapCMSToEtSource[_entity.attributes.language], _entity[_attr])};
        Object.assign(key[keyName].strings, sourceString);
        for (let targetEntity of _entity.translations) {
            let targetString = {
                [langMapCMSToETTarget[targetEntity.attributes.language]]: 
                    new libString(targetEntity.id, langMapCMSToETTarget[targetEntity.attributes.language], "")
            }
            Object.assign(key[keyName].strings, targetString)
        }
        return key;
    }
}

/**
 * Pass an array of CMS Objects to be flattened and collected into keys
 * An array of (possibly nested) child attributes can be provided to filter for
 * @param {Array} entityArray
 * @param {Array} attrs
 * @returns {Object}
 */
function transformCMSEntityArray(entityArray, attrs = []) {
    let keys = {};
    for (let entity of entityArray) {
        const safeEntity = safeKeyNames(entity)
        const flatEntity = flat.flatten(safeEntity)
        if (attrs.length == 0) {
            // Use all attributes of the object
            attrs = Object.keys(flatEntity)
        }
        for (let attr of attrs) {
            // retrieve relevant attributes
            const attrPaths = Object.keys(flatEntity).filter(key => key.endsWith(attr))
            for (let attrPath of attrPaths) {
                Object.assign(keys, makeLibraryEntry(flatEntity, attrPath))
            }
        }
    }
    return keys
}

/**
 * This function considers the README example object.
 * @param {Array} stringLib
 * @returns {Array} 
 */
function transformStringLib(stringLib) {
    let translatedFlatEntities = {}
    for (let key of stringLib) {
        let keyNameParts = key.attributes.name.split('.')
        for (let translation of key.attributes.translations) {
            let id = translation.external_id // very handy to use if you know the id of the translated objects
            if (!translatedFlatEntities[id]) {
                translatedFlatEntities[id] = {id: id}
            }
            let targetAttribute = keyNameParts.splice(2, 10).join('.')
            translatedFlatEntities[id][targetAttribute] = translation.text
        }
    }
    return translatedFlatEntities
}

/**
 * Recursively iterate the CMS Object's attrivutes and prepare them for being flattened
 * When flattening, objects in arrays will have their index in that array indicated
 * Since there are some Objects where the attribute names are also numbers, we need to make sure that we can safely unflatten them to the correct type
 * @param {Object} obj 
 * @param {boolean} danger 
 * @returns {Object}
 */
function safeKeyNames(obj, danger = false) {
    const getNewKey = (key) => {return ((Number.isInteger(Number(key)))? `_${key}_`:key)};
    const getOldKey = (key) => {return (Number.isInteger(Number(key.replace(/_/gm, ''))))? key.replace(/_/gm, ''):key};
    const replaceAllObjKeys = (obj, keyFunction) => {
        if (Array.isArray(obj)) {
          for (let i = 0; i < obj.length; i++) {
            replaceAllObjKeys(obj[i], keyFunction);
          }
        }
        else if (typeof obj === "object") {
          for (const key in obj) {
            const newKey = keyFunction(key);
            obj[newKey] = obj[key];
            if (key !== newKey) {
              delete obj[key];
            }
            replaceAllObjKeys(obj[newKey], keyFunction);
          }
        }
        return obj;
    }
    if (danger) {
        return replaceAllObjKeys(obj, getOldKey);
    }
    return replaceAllObjKeys(obj, getNewKey);
}
// @ts-check

/** @import {EMC} from './types/mount-observer/types' */;
/** @import {AllProps, Actions} from './types/fetch-for/types' */
/** @import {RAConfig} from './types/roundabout/types' */
/** @import {PatternConfig} from './types/nested-regex-groups/types' */

/** @type {PatternConfig[]} */
const parsePatterns = [
    {
        name: 'targetPart',
        pattern: String.raw `^(?<targetPart>.*)`,
        description: 'Target specifier for where to deliver fetch results'
    }
];

/**
 * @type {EMC<any, AllProps, Element, RAConfig<AllProps, Actions> >}
 */
export const emc = {
    enhConfig: {
        enhKey: 'FetchFor',
        spawn: 'fetch-for/fetch-for.js',
        withAttrs: {
            base: 'fetch-for',
            _base: {
                mapsTo: 'fetchForParams',
                parser: 'parse-pattern-statements',
                instanceOf: 'Array',
                parserConfig: parsePatterns
            }
        }
    },
    customData: {
        weakRef: {
            properties: ['enhancedElement']
        },
        compacts: {
            when_fetchForParams_changes_call_hydrate: 0,
            when_fetchReadyEvent_changes_call_doFetch: 0,
        }
    }
};

export function render(){
    return JSON.stringify(emc, null, 4);
}

console.log(render());

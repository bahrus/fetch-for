// @ts-check
import { BeHive, seed, MountObserver } from 'be-hive/be-hive.js';
/** @import {EMC} from './ts-refs/trans-render/be/types' */
/** @import {Actions, PAP, AllProps, AP} from './ts-refs/fetch-for/types' */;

const targetPart = String.raw `^(?<targetPart>.*)`;

/**
 * @type {Array<[string, string]>}
 */
const dssKeys = [['targetPart', 'remoteSpecifier']];

/**
 * @type {EMC<any, AP>}
 */
export const emc = {
    base: 'fetch-for',
    map: {
        '0.0': {
            instanceOf: 'Object$entences',
            objValMapsTo: '.',
            regExpExts: {
                fetchForParams: [
                    {
                        regExp: targetPart,
                        defaultVals: {},
                        dssKeys,
                    }
                ]
            }
        }
    },
    enhPropKey: 'fetchFor',
    importEnh: async () => {
        const { FetchFor } = await import('./fetch-for.js');
        return FetchFor;
    },
};
const mose = seed(emc);
MountObserver.synthesize(document, BeHive, mose);

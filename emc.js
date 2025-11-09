// @ts-check
import { BeHive, seed, MountObserver } from 'be-hive/be-hive.js';
/** @import {EMC} from './ts-refs/trans-render/be/types' */
/** @import {Actions, PAP, AllProps, AP} from './ts-refs/fetch-for/types' */;

/**
 * @type {EMC<any, AP>}
 */
export const emc = {
    base: 'fetch-for',
    map: {
        '0.0': {
            instanceOf: 'String',
            mapsTo: 'target',
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

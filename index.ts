import {def} from 'trans-render/lib/def.js';
import {FetchFor} from './fetch-for.js';

await FetchFor.bootUp();
def('fetch-for', FetchFor);

declare global {
    interface HTMLElementTagNameMap {
      'fetch-for': FetchFor;
    }
}
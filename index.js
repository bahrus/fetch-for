import { def } from 'trans-render/lib/def.js';
import { FetchFor } from './fetch-for.js';
await FetchFor.bootUp();
def(FetchFor.config.name, FetchFor);

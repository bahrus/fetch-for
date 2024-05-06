import { analyze } from './node_modules/may-it-be/analyze.js';
import { resolve } from "path";
import {config} from './config.js';
import * as fs from 'fs';
const info = analyze(resolve("types.d.ts"), config);
const cem =  JSON.stringify(info.package, null, 2);
fs.writeFileSync('./custom-elements.json', cem, {encoding: 'utf-8'});
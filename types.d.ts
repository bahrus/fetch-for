import { JSONObject } from '../trans-render/lib/types';
import { Specifier } from '../trans-render/dss/types';
import {SimpleWCInfo} from 'may-it-be/SimpleWCInfo';

declare class WeakRef<TProps = any>{}
/**
 * fetch-for props
 */
export interface EndUserProps{

    /**
     * Url to invoke
     */
    href?: string,

    /**
     * Specifier for list of form associated or contentEditable peer elements that 
     * should partake in forming the URL.
     */
    for?: string,

    /**
     * Indicates whether to treat the response as HTML or JSON or Text
     */
    as?: 'html' | 'json' | 'text',

    /**
     * The http verb to be used for the request
     */
    method?: 
        | 'GET' 
        | 'HEAD' 
        | 'POST' 
        | 'PUT' 
        | 'DELETE' 
        | 'OPTIONS' 
        | 'TRACE'
        | 'PATCH',
    /**
     * Either the JSON stringified or the parsed JSON object 
     * If parsed, the web component will stringify it.
     */
    body?: any,

    /**
     * Request credentials
     */
    credentials?: RequestCredentials,

    /**
     * <a href=https://github.com/bahrus/trans-render/tree/baseline/dss target=_blank>Directed Scoped Specifier</a> to the 
     * DOM element where the retrieved content should be applied.
     */
    target?: string,

    /**
     * If as=html, specify whether to (stream) the contents into an attached shadow DOM or not.
     */
    shadow?: ShadowRootMode,

    /**
     * Do not cache results even if the url has been invoked before.
     */
    noCache?: boolean,

    /**
     * Stream the contents into the target element
     */
    stream?: boolean,

    /**
     * 
     */
    when?: string,

    form?: string,

}

export interface OverridableGetters{
    init: RequestInit,
    accept?: string,
    value?: any,
    //isAttrParsed?: boolean,
    targetSelf?: boolean
    targetSpecifier?: Specifier
    whenCount?: number,
    nextWhenCount?: number,


}

export type EventName = string;

export interface AllProps extends EndUserProps, OverridableGetters{
    resolvedTarget?: Element | null,
    forRefs?: Map<string, [WeakRef<HTMLInputElement>, EventName]>,
    formData?: FormData,
    formRef?: WeakRef<HTMLFormElement>,
    formSpecifier?: Specifier,
}

export type PP = Partial<AllProps>;

export type ProPP = Promise<PP>


/**
 * methods for fetch-for
 */
export interface Methods extends Actions{
    validateResp(resp: Response): boolean,
    validateOn(): boolean,
    setTargetProp(target: Element | null, data: any, shadow?: ShadowRootMode): void,
}

export interface Actions{
    do(self: this): Promise<void>;
    parseFor(self: this): ProPP;
    parseTarget(self: this): ProPP;
    listenForInput(self: this): ProPP;
    //listenForSelect(self: this): ProPP;
    doInitialLoad(self: this): ProPP;
    initializeWhen(self: this): Promise<PP | undefined>;
    onForm(self: this): ProPP;
    onFormSpecifier(self: this): ProPP;
    onFormRef(self: this): Promise<void>,
}

// https://github.com/webcomponents-cg/community-protocols/issues/12#issuecomment-872415080
export type loadEventName = 'load';
export type inputEventName = 'input';
export type selectionChangeEventName = 'select';

export interface EventForFetch {
    href?: string;
    trigger?: Element,
    forData: ForData,
    formData: FormData,
    body?: string | JSONObject
}

export type ForData = {[key: string]: HTMLInputElement}

/**
 * fetch-for web component
 */
export abstract class FetchForInfo implements SimpleWCInfo {
    src: './fetch-for.js';
    tagName: 'fetch-for';
    props: EndUserProps;
    cssParts: {
        
    }
}

export type Package = [FetchForInfo];


/**
 * Uses Route Magic
 * @param app The instantiated Express app object.
 * @param options Options.
 */
export function use(app: any, options?: {
    /** If `invokerPath` is not defined, this is relative to your nodejs ROOT. */
    routesFolder?: string
    /** If this is defined, `routesFolder` will be relative to this path instead of your nodejs ROOT. */
    invokerPath?: string
    /** Use your own debug module. */
    debug?: function
    /** This prints out all your routes. If no debug module is passed, it uses console.log by default. */
    logMapping?: boolean
    /** `false` by default, i.e. you should not have a `foo.js` and a folder named `foo` sitting at the same level. That's poor organisation. */
    allowSameName?: boolean
    /** Allows you to skip folders or files with a suffix. */
    ignoreSuffix?: string | string[]
}): undefined

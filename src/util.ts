import vscode from "vscode"

class App {
    private constructor() { }

    private static _instance = new App()

    private context: vscode.ExtensionContext | null = null

    public static instance(): App {
        return this._instance
    }

    public setContext(context: vscode.ExtensionContext) {
        this.context = context
        /* context.globalState.setKeysForSync([
            history.key,
            bookmark.key,
        ]) */
    }

    public getContext(): vscode.ExtensionContext | null {
        return this.context
    }
}

export {
    App
}
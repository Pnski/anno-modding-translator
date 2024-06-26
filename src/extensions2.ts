import * as vscode from 'vscode';
import { App } from "./util";

enum CommandName {
    singleFile = 'singleFile',
    multiFile = 'multifile',
    modinfo = 'modinfo'
}

const activate = (context: vscode.ExtensionContext) => {
    App.instance().setContext(context);

    [
        {
            command: CommandName.singleFile,
            handler: singleFile.action
        },
        {
            command: CommandName.multiFile,
            handler: multiFile.action
        },
        {
            command: CommandName.modinfo,
            handler: modinfo.action
        },
    ].forEach(i => {
        vscode.commands.registerCommand(i.command, (args) => i.handler(i.command, args))
    })

    vscode.languages.registerHoverProvider(allLanguageHoverProvider.language, allLanguageHoverProvider.provider)
}

export {
    activate,
}
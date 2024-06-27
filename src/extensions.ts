import * as vscode from "vscode";
//import { AMTCommands } from "./Action/index";
interface CommandHandlers {
    [key: string]: (...args: any[]) => any;
}

// Import Commands and assert its type
import * as rawCommands from './Action/index';
const Commands: CommandHandlers = rawCommands;

interface CommandContribution {
    command: string;
    title: string;
}

export function activate(context: vscode.ExtensionContext): any {
    console.log(vscode.extensions.getExtension ( 'Pnski.amt' ).packageJSON.contributes)
    console.error(vscode.extensions)
	const {commands} = vscode.extensions.getExtension ( 'Pnski.amt' ).packageJSON.contributes;

    commands.forEach(({ command, title }: CommandContribution) => {
        // Use plain JavaScript to get the last element of the split command
        const commandName = command.split('.').pop() as string;
        const handler = Commands[commandName];
        const disposable = vscode.commands.registerCommand(command, (args) => handler(args));

        context.subscriptions.push(disposable);

    });
}

export function deactivate() {}
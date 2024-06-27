import * as vscode from "vscode";
interface CommandHandlers {
    [key: string]: (...args: any[]) => any;
}

// Import Commands and assert its type
const Commands : CommandHandlers = require('./Action/index')

interface CommandContribution {
    command: string;
    title: string;
}

export function activate(context: vscode.ExtensionContext): any {
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
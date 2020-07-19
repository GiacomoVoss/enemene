// export function ActionForm(view: View<any>) {
//     return function (target, propertyKey, parameterIndex: number): void {
//         const parameters: Dictionary<any> = target.constructor.prototype.$parameters || {};
//
//         if (!parameters[propertyKey]) {
//             parameters[propertyKey] = [];
//         }
//         parameters[propertyKey][parameterIndex] = new ActionFormInput(view);
//         target.constructor.prototype.$parameters = parameters;
//     };
// }
//
// export class ActionFormInput {
//     constructor(public view: View<any>) {
//     }
// }
//
// export abstract class AbstractAction {
//
//     abstract async execute(...args: any): Promise<void>;
//
//     getInputs()
// }
//
// export class RegisterUserAction extends AbstractAction {
//
//     form: ActionFormInput = new ActionFormInput(RolesView);
//
//     async execute(currentUser, foo): Promise<void> {
//         return Promise.resolve(undefined);
//     }
// }

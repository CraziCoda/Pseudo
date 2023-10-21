import { S } from "@tauri-apps/api/dialog-20ff401c";
import store from "../redux/store/app";
import { VariableI, identifier_regex, pseudo_data_type } from "./program";

export function declare_variable(
	args: string,
	current_variables: VariableI[],
	current_scope: string
) {
	const args_s = args.split(" ");

	const type_v = args_s.pop() || "";
	const as_keyword = args_s.pop();

	const variables_s = args_s.join("");

	const comma_regex =
		/(?=(?:(?:[^"]*"){2})*[^"]*$)(?=(?:(?:[^']*'){2})*[^']*$),/;

	const variables_a = variables_s.split(comma_regex);
	const valid_var: string[] = [];

	variables_a.forEach((val) => {
		if (identifier_regex.test(val)) {
			const vars = current_variables.filter(
				(value) => value.name == val && value.scope == current_scope
			);

			if (vars.length == 0) {
				valid_var.push(val);
			} else {
			}
		} else {
			// raise an error
		}
	});
	const pseudo_vars: VariableI[] = [];

	if (as_keyword == "as") {
		if (pseudo_data_type.includes(type_v)) {
			valid_var.forEach((val) => {
				let value: any;
				switch (type_v) {
					case "integer":
					case "double":
					case "float":
						value = 0;
						break;
					case "char":
					case "string":
						value = "";
						break;
					case "bool":
					case "boolean":
						value = false;
				}

				const pseudo_var: VariableI = {
					name: val,
					type: type_v,
					scope: current_scope,
					value: value,
				};

				pseudo_vars.push(pseudo_var);
			});
		} else {
		}
	} else {
		//Raise error
	}

	current_variables.push(...pseudo_vars);
}

export function variable_assignment(
	args: string,
	current_variables: VariableI[],
	current_scope: string
) {
	const args_s = args.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g);

	console.log(args_s);

	// const pseudo_var = current_variables.find((val) => val.name == args_s[0]);

	// if (pseudo_var) {
	// 	console.log(args_s[1]);
	// } else {
	// }
}

export function print_to_screen() {}

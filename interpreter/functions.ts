import { S } from "@tauri-apps/api/dialog-20ff401c";
import store from "../redux/store/app";
import {
	VariableI,
	data_type_t,
	float_regex,
	identifier_regex,
	integer_regex,
	pseudo_data_type,
	string_regex,
} from "./program";

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
		if (pseudo_data_type.includes(type_v as data_type_t)) {
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
					type: type_v as data_type_t,
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

export function identify_data_type(value: string): data_type_t | "" {
	return "";
}

export function variable_assignment(
	args: string,
	current_variables: VariableI[],
	current_scope: string
) {
	const args_s = args.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g);

	if (args_s == null) return;

	const pseudo_var = current_variables.find((val) => val.name == args_s[0]);

	// remove identifyier
	const identifier = args_s.shift() as string;

	const value = args_s.join("");

	if (pseudo_var) {
		//edit variable if it is availabl

		// console.log(value);

		if (value != "") {
			if (integer_regex.test(value)) {
				if (
					pseudo_var.type == "integer" ||
					pseudo_var.type == "float" ||
					pseudo_var.type == "double"
				)
					pseudo_var.value = parseInt(value);
				pseudo_var.type = "integer";
			} else if (float_regex.test(value)) {
				if (
					pseudo_var.type == "integer" ||
					pseudo_var.type == "float" ||
					pseudo_var.type == "double"
				)
					pseudo_var.value = parseFloat(value);
				pseudo_var.type = "float";
			} else if (string_regex.test(value)) {
				if (pseudo_var.type == "string")
					pseudo_var.value = value.substring(1, value.length - 1);
			} else if (
				value.toLowerCase() == "false" ||
				value.toLowerCase() == "true"
			) {
				if (pseudo_var.type == "bool" || pseudo_var.type == "boolean")
					if (value.toLowerCase() == "true") pseudo_var.value = true;
					else if (value.toLowerCase() == "false") pseudo_var.value = false;
			}
		} else {
			// no value error
		}
	} else {
		// create new variable

		if (value != "") {
			if (integer_regex.test(value)) {
				const new_var: VariableI = {
					type: "integer",
					name: identifier,
					scope: current_scope,
					value: value,
				};
				current_variables.push(new_var);
			} else if (float_regex.test(value)) {
				const new_var: VariableI = {
					type: "float",
					name: identifier,
					scope: current_scope,
					value: value,
				};
				current_variables.push(new_var);
			} else if (string_regex.test(value)) {
				const new_var: VariableI = {
					type: "string",
					name: identifier,
					scope: current_scope,
					value: value,
				};
				current_variables.push(new_var);
			} else if (
				value.toLowerCase() == "false" ||
				value.toLowerCase() == "true"
			) {
				const new_var: VariableI = {
					type: "boolean",
					name: identifier,
					scope: current_scope,
					value: value,
				};
				current_variables.push(new_var);
			}
		} else {
			// no value error
		}
	}
}

export function print_to_screen(args: string) {}

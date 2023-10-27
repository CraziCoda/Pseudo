import {
	VariableI,
	comma_regex,
	data_type_t,
	float_regex,
	identifier_regex,
	integer_regex,
	pseudo_data_type,
	string_regex,
} from "./program";
import store from "../redux/store/app";
import {
	add_variable,
	add_variables,
	assign_variable,
} from "@/redux/reducers/interpreter";

export function declare_variable(
	args: string
	// current_variables: VariableI[],
	// current_scope: string
) {
	const args_s = args.split(" ");

	const current_scope = store.getState().interpreter.current_scope;
	const current_variables = store.getState().interpreter.variables;

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

	store.dispatch(add_variables(pseudo_vars));
}

export function variable_assignment(args: string) {
	const args_s = args.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g);

	const current_variables = store.getState().interpreter.variables;
	const current_scope = store.getState().interpreter.current_scope;

	if (args_s == null) return;

	const pseudo_var = current_variables.find((val) => val.name == args_s[0]);

	// remove identifyier
	const identifier = args_s.shift() as string;

	const value = args_s.join("");

	if (pseudo_var != undefined) {
		//edit variable if it is availab

		if (value != "") {
			if (integer_regex.test(value)) {
				if (
					pseudo_var.type == "integer" ||
					pseudo_var.type == "float" ||
					pseudo_var.type == "double"
				)
					store.dispatch(
						assign_variable({ name: identifier, type: "integer", value })
					);
			} else if (float_regex.test(value)) {
				if (
					pseudo_var.type == "integer" ||
					pseudo_var.type == "float" ||
					pseudo_var.type == "double"
				)
					store.dispatch(
						assign_variable({ name: identifier, type: "float", value })
					);
			} else if (string_regex.test(value)) {
				if (pseudo_var.type == "string")
					store.dispatch(
						assign_variable({
							name: identifier,
							type: "string",
							value: value.substring(1, value.length - 1),
						})
					);
			} else if (
				value.toLowerCase() == "false" ||
				value.toLowerCase() == "true"
			) {
				if (pseudo_var.type == "bool" || pseudo_var.type == "boolean")
					if (value.toLowerCase() == "true")
						store.dispatch(
							assign_variable({
								name: identifier,
								type: "bool",
								value: true,
							})
						);
					else if (value.toLowerCase() == "false")
						store.dispatch(
							assign_variable({
								name: identifier,
								type: "bool",
								value: false,
							})
						);
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
					value: parseInt(value),
				};
				store.dispatch(add_variable(new_var));
			} else if (float_regex.test(value)) {
				const new_var: VariableI = {
					type: "float",
					name: identifier,
					scope: current_scope,
					value: parseFloat(value),
				};
				store.dispatch(add_variable(new_var));
			} else if (string_regex.test(value)) {
				const new_var: VariableI = {
					type: "string",
					name: identifier,
					scope: current_scope,
					value: value.substring(1, value.length - 1),
				};
				store.dispatch(add_variable(new_var));
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
				store.dispatch(add_variable(new_var));
			}
		} else {
			// no value error
		}
	}
}

export function print_to_screen(args: string) {
	const args_s = args.split(comma_regex);
	const current_variables = store.getState().interpreter.variables;

	const print_values: any[] = [];

	args_s.forEach((val) => {
		let value = val.trim();

		if (value != "") {
			if (
				integer_regex.test(value) ||
				float_regex.test(value) ||
				string_regex.test(value)
			)
				print_values.push(
					(integer_regex.test(value) && parseInt(value)) ||
						(float_regex.test(value) && parseFloat(value)) ||
						value.substring(1, value.length - 1)
				);
			else if (value.toLowerCase() == "true" || value.toLowerCase() == "false")
				print_values.push(value.toLowerCase() == "true");
			else if (identifier_regex.test(value)) {
				const pseudo_var = current_variables.find((val) => val.name == value);
				if (pseudo_var) print_values.push(pseudo_var.value);
				else {
					// varaible doesn't exist error
				}
			}
		} else {
		}

		console.log(print_values);
	});

	console.log(print_values);
}

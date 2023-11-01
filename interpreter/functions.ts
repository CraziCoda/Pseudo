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
	interrupt_program,
} from "@/redux/reducers/interpreter";
import { add_to_list, list_type } from "@/redux/reducers/terminal";

export function declare_variable(
	args: string
	// current_variables: VariableI[],
	// current_scope: string
) {
	const args_s = args.split(" ");

	const current_scope = store.getState().interpreter.current_scope;
	const current_variables = store.getState().interpreter.variables;

	const type_v = args_s.pop()?.toLowerCase() || "";
	const as_keyword = args_s.pop()?.toLowerCase();

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

export function detect_data_type(data: string): data_type_t | null {
	if (string_regex.test(data)) return "string";
	else if (integer_regex.test(data)) return "integer";
	else if (float_regex.test(data)) return "float";
	else if (data.toLowerCase() == "true" || data.toLowerCase() == "false")
		return "bool";
	return null;
}

function assign_to_incoming_data_type(identifier: string, value: any) {
	const data_type = detect_data_type(value);

	if (data_type == "integer") value = parseInt(value);
	else if (data_type == "float") value = parseFloat(value);
	else if (value.toLowerCase() == "true" || value.toLowerCase() == "false")
		value = value.toLowerCase() == "true" || false;
	else if (data_type == "string") value = value.substring(1, value.length - 1);

	if (data_type)
		store.dispatch(
			assign_variable({
				name: identifier,
				type: data_type,
				value: value,
			})
		);
}

export function input_assignment(args: string) {
	const identifier = args.split(" ")[0];

	const var_values = args.substring(identifier.length, args.length).trim();

	if (integer_regex.test(var_values)) {
		variable_assignment(`${identifier} ${parseInt(var_values)}`);
	} else if (float_regex.test(var_values)) {
		variable_assignment(`${identifier} ${parseFloat(var_values)}`);
	} else {
		variable_assignment(`${identifier} ${'"' + var_values + '"'}`);
	}
}

export function variable_assignment(args: string) {
	const args_s = args.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g);

	const current_variables = store.getState().interpreter.variables;
	const current_scope = store.getState().interpreter.current_scope;

	if (args_s == null) return;

	const pseudo_var = current_variables.find((val) => val.name == args_s[0]);

	// remove identifyier
	const identifier = args_s.shift() as string;

	const value = args_s.join("").trim();

	if (pseudo_var != undefined) {
		//edit variable if it is available

		if (value != "") {
			if (integer_regex.test(value)) {
				if (
					pseudo_var.type == "integer" ||
					pseudo_var.type == "float" ||
					pseudo_var.type == "double"
				)
					store.dispatch(
						assign_variable({
							name: identifier,
							type: "integer",
							value: parseInt(value),
						})
					);
				else assign_to_incoming_data_type(identifier, value);
			} else if (float_regex.test(value)) {
				if (
					pseudo_var.type == "integer" ||
					pseudo_var.type == "float" ||
					pseudo_var.type == "double"
				)
					store.dispatch(
						assign_variable({
							name: identifier,
							type: "float",
							value: parseFloat(value),
						})
					);
				else assign_to_incoming_data_type(identifier, value);
			} else if (string_regex.test(value)) {
				if (pseudo_var.type == "string")
					store.dispatch(
						assign_variable({
							name: identifier,
							type: "string",
							value: value.substring(1, value.length - 1),
						})
					);
				else assign_to_incoming_data_type(identifier, value);
			} else if (
				value.toLowerCase() == "false" ||
				value.toLowerCase() == "true"
			) {
				if (value.toLowerCase() == "true" || value.toLowerCase() == "false") {
					if (pseudo_var.type == "bool" || pseudo_var.type == "boolean")
						store.dispatch(
							assign_variable({
								name: identifier,
								type: "bool",
								value: value.toLowerCase() == "true" || false,
							})
						);
					else assign_to_incoming_data_type(identifier, value);
				}
			} else if (identifier_regex.test(value)) {
				const var_ = current_variables.find((val) => val.name == value);

				if (var_) {
					// console.log(var_);
					store.dispatch(
						assign_variable({
							name: identifier,
							type: var_.type,
							value: var_.value,
						})
					);
				} else {
				}
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
			} else if (identifier_regex.test(value)) {
				const var_ = current_variables.find((val) => val.name == value);

				if (var_) {
					console.log(var_, value);
					const new_var: VariableI = {
						type: var_.type,
						name: identifier,
						scope: current_scope,
						value: var_.value,
					};
					store.dispatch(add_variable(new_var));
				} else {
				}
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
	});

	const output: list_type = {
		type: "output",
		values: print_values,
	};

	store.dispatch(add_to_list(output));
}

export function take_input(args: string) {
	const args_s = args.split(comma_regex);

	const input_vars: any[] = [];

	args_s.forEach((val) => {
		val = val.trim();
		if (identifier_regex.test(val)) {
			input_vars.push(val);
		} else {
		}
	});

	const input: list_type = {
		type: "input",
		values: input_vars,
	};

	store.dispatch(add_to_list(input));
	store.dispatch(interrupt_program());
}

import {
	VariableI,
	comma_regex,
	data_type_t,
	float_regex,
	fn_identifier_regex,
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
import { assign_var, place_in_variables } from "./var_functions";
import generic_error from "./error_functions";
import { work_on_operations } from "./useful_functions";

export function declare_variable(args: string) {
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
	// split characters by spaces except when space is in quotes
	const args_s = args.match(/["][^"]*["]|['][^']*[']|[^\s]+/g);

	if (args_s == null) return;

	// remove identifyier
	const identifier = args_s.shift() as string;

	const value = args_s.join("").trim();


	assign_var(identifier, value);
}

export function print_to_screen(args: string) {
	const args_s = args.split(comma_regex);
	const current_variables = store.getState().interpreter.variables;

	const print_values: any[] = [];

	for (let i = 0; i < args_s.length; i++) {
		const val = args_s[i];
		let value = val.trim();

		if (value != "") {
			if (
				integer_regex.test(value) ||
				float_regex.test(value) ||
				string_regex.test(value)
			) {
				print_values.push(
					(integer_regex.test(value) && parseInt(value)) ||
						(float_regex.test(value) && parseFloat(value)) ||
						value.substring(1, value.length - 1)
				);
			} else if (
				value.toLowerCase() == "true" ||
				value.toLowerCase() == "false"
			) {
				print_values.push(value.toLowerCase() == "true");
			} else if (identifier_regex.test(value)) {
				const pseudo_var = current_variables.find((val) => val.name == value);
				if (pseudo_var) print_values.push(pseudo_var.value);
				else {
					// varaible doesn't exist error
					generic_error(`Unknown (Undefined) variable is being used: ${value}`);
					return;
				}
			} else if (fn_identifier_regex.test(value)) {
				//function call
			} else {
				const operation = place_in_variables(value);
				print_values.push(operation);
			}
		} else {
			generic_error(`Excepted a value between the two commas`);
			return;
		}
	}

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

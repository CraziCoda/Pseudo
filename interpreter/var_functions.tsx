import { add_variable, assign_variable } from "@/redux/reducers/interpreter";
import store from "../redux/store/app";
import {
	VariableI,
	data_type_t,
	float_regex,
	fn_identifier_regex,
	identifier_regex,
	integer_regex,
	pseudo_keywords,
	string_regex,
} from "./program";
import { work_on_operations } from "./useful_functions";
import generic_error from "./error_functions";

export function assign_var(identifier: string, value: any) {
	const current_variables = store.getState().interpreter.variables;
	const current_scope = store.getState().interpreter.current_scope;

	const pseudo_var = current_variables.find((val) => val.name == identifier);

	if (pseudo_var) {
		if (value !== "" ) {
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
			} else if (fn_identifier_regex.test(value)) {
			} else {
				// console.log(value);
				const op_value = place_in_variables(value);
				// console.log(op_value, pseudo_var);
				const op_value_type = detect_data_type(op_value);

				store.dispatch(
					assign_variable({
						name: identifier,
						type: op_value_type || "string",
						value: op_value,
					})
				);
			}
		} else {
			// no value error
			console.log(value);
			generic_error("Expected a value after '='");
		}
	} else {
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
					// console.log(var_, value);
					const new_var: VariableI = {
						type: var_.type,
						name: identifier,
						scope: current_scope,
						value: var_.value,
					};
					store.dispatch(add_variable(new_var));
				} else {
				}
			} else if (fn_identifier_regex.test(value)) {
				// console.log(value);
			} else {
				// console.log(value);
				const op_value = place_in_variables(value);
				const op_value_type = detect_data_type(op_value);

				const new_var: VariableI = {
					type: op_value_type || "string",
					name: identifier,
					scope: current_scope,
					value: op_value,
				};
				store.dispatch(add_variable(new_var));
			}
		} else {
			// no value error
			generic_error("Expected a value after '='");
			return;
		}
	}
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

function detect_data_type(data: string): data_type_t | null {
	if (string_regex.test(data)) return "string";
	else if (integer_regex.test(data)) return "integer";
	else if (float_regex.test(data)) return "float";
	else if (data.toLowerCase() == "true" || data.toLowerCase() == "false")
		return "bool";
	return null;
}

export function place_in_variables(operation: string): string {
	const op_spaced = operation?.replace(
		/([^\w"']+|["][^"]*["]|['][^']*['])/g,
		" $1 "
	);
	const op_values = op_spaced?.match(/["][^"]*["]|['][^']*[']|[^\s]+/g);

	if (op_values == null) return "";

	const current_variables = store.getState().interpreter.variables;

	for (let i = 0; i < op_values.length; i++) {
		const value = op_values[i];

		if (
			identifier_regex.test(value) &&
			!pseudo_keywords.includes(value.toLowerCase())
		) {
			const variable = current_variables.find((val) => val.name == value);
			if (variable) {
				if (variable.type == "string") {
					op_values[i] = `"${variable.value}"`;
					continue;
				}
				op_values[i] = variable.value;
			} else {
				generic_error(`Unknown (Undefined) variable is being used: ${value}`);
				return "";
			}
		} else if (pseudo_keywords.includes(value.toLowerCase())) {
			if (value.toLowerCase() == "true" || value.toLowerCase() == "false")
				op_values[i] = value.toLowerCase();
			else {
				// raise an error
				generic_error(`Unexpected use of a keyword: ${value}`);
				return "";
			}
		}
	}

	const op = op_values.join("");

	return work_on_operations(op);
}

/*
 Copyright (c) 2023 Pextra Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy of
 this software and associated documentation files (the "Software"), to deal in
 the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import {OpenAPIDefinition, OpenAPIType} from '../types/openapi';
import {SourceFile} from 'ts-morph';
import {GetPrimitiveTypeFromOpenAPIType} from './primitive';
import {OpenAPIDefinitionProperty} from '../types/openapi/definition';

const BACKTICKS = '```';

const GetType = (
	file: SourceFile,
	name: string,
	key: string,
	value: OpenAPIDefinitionProperty<OpenAPIType>
): string => {
	if (value.type === 'array' && value.items) {
		return `Array<${GetType(file, name, key, value.items)}>`;
	}

	if (value.enum) {
		return `${name}${key}`;
	}

	if (value.type === 'object' && value.properties) {
		const jsonPropertyObject: {[key: string]: unknown} = {};
		Object.keys(value.properties).forEach(propKey => {
			const propVal = value.properties![propKey];
			if (propVal.enum) {
				CreateEnumFromDefinition(file, `${name}${propKey}`, propVal);
			}

			jsonPropertyObject[propKey] = GetType(file, name, propKey, propVal);
		});

		return JSON.stringify(jsonPropertyObject, null).replace(/["']/g, '');
	}

	if (value['$ref']) {
		return value['$ref'].replace(/#\/definitions\//, '');
	}

	return GetPrimitiveTypeFromOpenAPIType(value.type);
};

const GetDescriptionFromDefinition = (
	definition:
		| OpenAPIDefinition<OpenAPIType>
		| OpenAPIDefinitionProperty<OpenAPIType>
) => {
	let description = '\n';
	if (definition.description) {
		description += `${definition.description}\n`;
	}

	if (definition.example) {
		description += '\nExample:';

		switch (definition.type) {
			case 'array':
			case 'object':
				description += `\n${BACKTICKS}json\n${JSON.stringify(
					definition.example,
					null,
					'\t'
				)}\n${BACKTICKS}`;
				break;
			case 'string':
				description += ` "${definition.example}"`;
				break;
			case 'integer':
			case 'boolean':
				description += ` ${definition.example.toString()}`;
				break;
		}
	}

	return description !== '' ? [description] : undefined;
};

const CreateEnumFromDefinition = (
	file: SourceFile,
	name: string,
	definition:
		| OpenAPIDefinition<OpenAPIType>
		| OpenAPIDefinitionProperty<OpenAPIType>
) => {
	if (file.getEnum(name)) {
		return;
	}

	file.addEnum({
		name: name,
		isExported: true,
		docs: definition.description ? [definition.description] : undefined,
		members: definition.enum!.map(value => {
			let enumName = value.toString();

			// Account for enum values that start with a number or are blank
			if (enumName.match(/^\d/) || enumName === '') {
				enumName = `_${enumName}`;
			}

			return {
				name: enumName,
				value,
			};
		}),
	});
};

const CreateTypeFromDefinition = <T extends OpenAPIType>(
	name: string,
	definition: OpenAPIDefinition<T>,
	file: SourceFile
) => {
	if (definition.enum) {
		return CreateEnumFromDefinition(file, name, definition);
	}

	const statement = file.addInterface({
		name,
		isExported: true,
		docs: GetDescriptionFromDefinition(definition),
		properties: [],
	});

	let properties = definition.properties;
	if (definition.allOf) {
		properties = definition.allOf[1].properties;
	} else if (definition.additionalProperties) {
		properties = definition.additionalProperties;
	}

	if (properties) {
		Object.keys(properties).forEach(key => {
			const value = properties![key]; // TODO x-nullable
			key = key.replace(/[.-]/g, '_');

			if (value.enum) {
				CreateEnumFromDefinition(file, `${name}${key}`, value);
			}

			statement.addProperty({
				name: key,
				type: value.enum
					? `${name}${key}`
					: GetType(file, name, key, value),
				docs: GetDescriptionFromDefinition(value),
				hasQuestionToken: value.x_nullable,
			});
		});
	} else if (definition.items) {
		statement.addProperty({
			name: 'items',
			type: GetType(file, name, 'items', definition.items),
			docs: GetDescriptionFromDefinition(definition.items),
			hasQuestionToken: definition.items.x_nullable,
		});
	}
};

export {CreateTypeFromDefinition};

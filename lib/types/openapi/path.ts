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
import {OpenAPIType, OpenAPIParameterType} from './common';

export type OpenAPIPathParameter<
	T extends OpenAPIType,
	U extends OpenAPIParameterType,
> = {
	name: string;
	type: U;
	in: T;
	description: string;
	required: boolean;
};

export type OpenAPIPathResponse = {
	description: string;
	schema: {
		type: OpenAPIType;
		$ref: string; // Reference to a definition TODO
	};
	examples?: {
		[key: string]: string; // MIME type
	};
};

export type OpenAPIPathOperation = {
	summary: string;
	description: string;
	operationId: string;
	produces: Array<string>; // MIME type
	parameters: Array<OpenAPIPathParameter<OpenAPIType, OpenAPIParameterType>>;
	responses: {
		[key: string]: OpenAPIPathResponse;
	};
	tags?: Array<string>;
};

export type OpenAPIPath = {
	get?: OpenAPIPathOperation;
	post?: OpenAPIPathOperation;
	put?: OpenAPIPathOperation;
	patch?: OpenAPIPathOperation;
	delete?: OpenAPIPathOperation;
};

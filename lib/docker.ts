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
//import {DockerImage} from './components/image';
import {DockerConnectionOptions} from './types/docker';

class Docker {
	options: DockerConnectionOptions;

	constructor(
		options: DockerConnectionOptions = {host: 'localhost', port: 2375}
	) {
		if (
			(options.socket !== undefined &&
				options.host !== undefined &&
				options.port !== undefined) ||
			(options.socket === undefined &&
				options.host === undefined &&
				options.port === undefined)
		) {
			throw new Error(
				'Either `socket` or `host` and `port` must be specified'
			);
		} else if (options.socket !== undefined) {
			this.options = {socket: options.socket};
		} else {
			this.options = {
				host: options.host || 'localhost',
				port: options.port || 2375,
			};
		}

		this.options = options;
	}

	/**
	 * Returns the Docker connection options.
	 */
	GetConnectionOptions(): DockerConnectionOptions {
		return this.options;
	}

	/**
	 * Returns the Docker socket path.
	 */
	GetSocket(): string | undefined {
		return this.options.socket;
	}

	/**
	 * Returns the Docker host.
	 */
	GetHost(): string | undefined {
		return this.options.host;
	}

	/**
	 * Returns the Docker port.
	 */
	GetPort(): number | undefined {
		return this.options.port;
	}

	/**
	 * Returns whether the connection is made via a socket.
	 */
	IsSocket(): boolean {
		return this.options.socket !== undefined;
	}

	/**
	 * Returns whether the connection is made via a host/port combination.
	 */
	IsHost(): boolean {
		return (
			this.options.host !== undefined && this.options.port !== undefined
		);
	}

	/**
	 * Docker image component.
	 */
	//image = DockerImage;

	/**
	 * Docker container component.
	 */
	// container = DockerContainer;

	/**
	 * Docker volume component.
	 */
	// volume = DockerVolume;

	/**
	 * Docker network component.
	 */
	// network = DockerNetwork;
}

export default Docker;

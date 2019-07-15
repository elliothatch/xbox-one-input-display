#!/usr/bin/env node
const readline = require('readline');
const child_process = require('child_process');
const Path = require('path');

const termkit = require('terminal-kit');

const evtest = child_process.spawn('evtest');

evtest.stderr.pipe(process.stdout);
process.stdin.pipe(evtest.stdin);

const controllerEvents = readline.createInterface({
    input: evtest.stdout,
    output: process.stdout,
    terminal: false
});

const term = termkit.terminal;
term.fullscreen(true);
// term.grabInput();

const screenBuffer = new termkit.ScreenBuffer({
	dst: term,
	x: 1,
	y: 1,
});

const controllerImage = `
      __                        __
     |__|___                ___|__|
    /_______|______________|_______\\
   /               __               \\
  /      ___      /\\/\\               \\
  |     /   \\     \\/\\/        _      |
  |     |   |    _    _    _ |_| _   |
  |     \\___/   |_|  |_|  |_| _ |_|  |
 /            _        ___   |_|     \\
 |          _| |_     /   \\           |
 |         |_   _|    |   |           |
 |           |_|      \\___/           |
/          __________________          \\
|         /                  \\         |
|        /                    \\        |
|       /                      \\       |
 \\_____/                        \\_____/
`;

const buttons = {
	BTN_SOUTH: {
		position: {
			x: 30,
			y: 9
		},
		state: '0',
	},
	BTN_C: {
		position: {
			x: 27,
			y: 8
		},
		state: '0',
	},
	BTN_NORTH: {
		position: {
			x: 30,
			y: 7
		},
		state: '0',
	},
	BTN_EAST: {
		position: {
			x: 33,
			y: 8
		},
		state: '0',
	},
	// left stick
	BTN_TL2: {
		position: {
			x: 10,
			y: 7,
		},
		state: '0',
	},
	// right stick
	BTN_TR2: {
		position: {
			x: 24,
			y: 11,
		},
		state: '0',
	},
	BTN_TR: {
		position: {
			x: 22,
			y: 8
		},
		state: '0',
	},
	BTN_TL: {
		position: {
			x: 17,
			y: 8
		},
		state: '0',
	},
	// xbox button
	KEY_HOMEPAGE: {
		position: {
			x: 20,
			y: 5
		},
		state: '0',
	},
	// left shoulder
	BTN_WEST: {
		position: {
			x: 5,
			y: 3,
		},
		state: '0',
	},
	// right shoulder
	BTN_Z: {
		position: {
			x: 28,
			y: 3,
		},
		state: '0',
	},
	/*
	ABS_HAT0Y: {
		position: {
		},
		state: '0',
	},
	ABS_HAT0X: {
		position: {
		},
		state: '0',
	},
	*/
};

function draw() {
	screenBuffer.draw({
		position: {
			x: 0,
			y: 0,
		}
	});

	screenBuffer.drawCursor();
}

function exit(error) {
	evtest.kill();
	term.fullscreen(false);
	if(error) {
		console.error(error);
	}
	process.exit();
}

term.on('key', (name, matches, data) => {
	try {
		if(name === 'CTRL_C') {
			exit();
		}
		else if(name === 'ENTER') {
			term.clear()
			drawController();
		}

	}
	catch(err) {
		exit(err);
	}
});

evtest.on('close', (code, signal) => {
	exit(`${code}: ${signal}`);
});

evtest.on('error', (err) => {
	exit(err);
});

controllerEvents.on('line', function(line) {
    try {
		if(line.startsWith('Event')) {
			const buttonRegex =  /(\(([^)]*)\))/g;
			const buttonMatch = buttonRegex.exec(line);
			if(buttonMatch) {
				const eventType = buttonMatch[2];
				const eventButton = buttonRegex.exec(line)[2];
				const eventValue = line.match(/value (.*)/)[1];
				if(buttons[eventButton]) {
					buttons[eventButton].state = eventValue;
					drawController();
				}
			}
		}
    }
    catch(err) {
    	exit(err);
    }
});

function drawController() {
	controllerImage.split('\n').forEach((line, idx) => {
		screenBuffer.moveTo(0,idx);
		screenBuffer.put({}, line);
	});
	/*
	screenBuffer.clear();
	screenBuffer.moveTo(0,0);
	screenBuffer.put({
		position: {
			x: 0,
			y: 0,
		}
	}, controllerImage);
	*/
	Object.keys(buttons).forEach((buttonName) => {
		const button = buttons[buttonName];
		screenBuffer.moveTo(button.position.x, button.position.y);
		// screenBuffer.delete(1);
		screenBuffer.put({
			position: button.position,
			attr: {
				bgColor: button.state === '0'? 'black': 'white'
			}
		}, '_');
	});

	screenBuffer.moveTo(0, 0);
	draw();
}

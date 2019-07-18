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
		state: 0,
	},
	BTN_C: {
		position: {
			x: 27,
			y: 8
		},
		state: 0,
	},
	BTN_NORTH: {
		position: {
			x: 30,
			y: 7
		},
		state: 0,
	},
	BTN_EAST: {
		position: {
			x: 33,
			y: 8
		},
		state: 0,
	},
	// left stick
	BTN_TL2: {
		position: {
			x: 10,
			y: 7,
		},
		state: 0,
	},
	// right stick
	BTN_TR2: {
		position: {
			x: 24,
			y: 11,
		},
		state: 0,
	},
	// start
	BTN_TR: {
		position: {
			x: 22,
			y: 8
		},
		state: 0,
	},
	// back
	BTN_TL: {
		position: {
			x: 17,
			y: 8
		},
		state: 0,
	},
	// xbox button
	KEY_HOMEPAGE: {
		position: {
			x: 20,
			y: 5
		},
		state: 0,
	},
	// left shoulder
	BTN_WEST: {
		position: {
			x: 5,
			y: 3,
		},
		state: 0,
	},
	// right shoulder
	BTN_Z: {
		position: {
			x: 28,
			y: 3,
		},
		state: 0,
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

const dpadButtons = {
	ABS_HAT0X: {
		positionPos: {
			x: 16,
			y: 11,
		},
		positionNeg: {
			x: 12,
			y: 11,
		},
		state: 0,
	},
	ABS_HAT0Y: {
		positionPos: {
			x: 14,
			y: 12,
		},
		positionNeg: {
			x: 14,
			y: 10,
		},
		state: 0,
	}
};

const analogSticks = {
	ABS_X: {
		position: {
			x: 10,
			y: 7,
		},
		state: 65536/2,
		compliment: 'ABS_Y',
		direction: 'x',
	},
	ABS_Y: {
		position: {
			x: 10,
			y: 7,
		},
		state: 65536/2,
		compliment: 'ABS_X',
		direction: 'y',
	},
	ABS_RX: {
		position: {
			x: 24,
			y: 11,
		},
		state: 65536/2,
		compliment: 'ABS_RY',
		direction: 'x',
	},
	ABS_RY: {
		position: {
			x: 24,
			y: 11,
		},
		state: 65536/2,
		compliment: 'ABS_RX',
		direction: 'y',
	},
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
				const eventValue = parseInt(line.match(/value (.*)/)[1]);
				if(buttons[eventButton]) {
					buttons[eventButton].state = eventValue;
					drawController();
				}
				else if(dpadButtons[eventButton]) {
					dpadButtons[eventButton].state = eventValue;
					drawController();
				}
				else if(analogSticks[eventButton]) {
					analogSticks[eventButton].state = eventValue;
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
				bgColor: button.state === 1? 'white': 'black'
			}
		}, '_');
	});

	Object.keys(dpadButtons).forEach((axisName) => {
		const axis = dpadButtons[axisName];
		screenBuffer.moveTo(axis.positionPos.x, axis.positionPos.y);
		screenBuffer.put({
			position: axis.positionPos,
			attr: {
				bgColor: axis.state === 1? 'white': 'black'
			}
		}, '_');

		screenBuffer.moveTo(axis.positionNeg.x, axis.positionNeg.y);
		screenBuffer.put({
			position: axis.positionNeg,
			attr: {
				bgColor: axis.state === -1? 'white': 'black'
			}
		}, '_');
	});

	const maxAnalogValue = 65536 - 1;
	const midAnalogValue = 65536/2;
	Object.keys(analogSticks).forEach((axisName) => {
		const axis = analogSticks[axisName];

		const normalizedState = 2*(axis.state/maxAnalogValue)-1;

		const position1 = {
			x: axis.position.x + (axis.direction === 'x'? -1: 0),
			y: axis.position.y + (axis.direction === 'y'? -1: 0),
		};

		const position2 = {
			x: axis.position.x + (axis.direction === 'x'? 1: 0),
			y: axis.position.y + (axis.direction === 'y'? 1: 0),
		};

		const opacity = Math.floor(255*(axis.state / maxAnalogValue));

		screenBuffer.moveTo(position1.x, position1.y);
		screenBuffer.put({
			position: position1,
			attr: {
				bgColor: normalizedState < -0.1? 'white': 'black',
			}
		}, ' ');

		screenBuffer.moveTo(position2.x, position2.y);
		screenBuffer.put({
			position: position2,
			attr: {
				bgColor: normalizedState > 0.1? 'white': 'black',
			}
		}, ' ');
	});

	const maxTriggerValue = 1024 - 1;

	screenBuffer.moveTo(0, 0);
	draw();
}

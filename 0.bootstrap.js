(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[0],{

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var wasm_game_of_life__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! wasm-game-of-life */ \"./pkg/wasm_game_of_life.js\");\n/* harmony import */ var wasm_game_of_life_wasm_game_of_life_bg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! wasm-game-of-life/wasm_game_of_life_bg */ \"./pkg/wasm_game_of_life_bg.wasm\");\n\n\n\nconst CELL_SIZE = 15; // px\nconst GRID_COLOR = \"#CCCCCC\";\nconst DEAD_COLOR = \"#FFFFFF\";\nconst ALIVE_COLOR = \"#3273ff\";\n\nconst width = Math.floor(document.getElementById(\"game-of-life-canvas\").width / 5);\nconst height = Math.floor(document.getElementById(\"game-of-life-canvas\").height / 5 );\n\nconst universe = wasm_game_of_life__WEBPACK_IMPORTED_MODULE_0__[\"Universe\"].new_with_parameters(width, height);\n\n// Give the canvas room for all of our cells and a 1px border\n// around each of them.\nconst canvas = document.getElementById(\"game-of-life-canvas\");\ncanvas.height = (CELL_SIZE + 1) * height + 1;\ncanvas.width = (CELL_SIZE + 1) * width + 1;\n\nconst ctx = canvas.getContext('2d');\n\nlet animationId = null;\n\nconst renderLoop = () => {\n    // debugger; // Stop after every iteration of the loop\n    // fps.render(); // to measure performance\n\n    universe.tick();\n    drawGrid();\n    drawCells();\n\n    animationId = requestAnimationFrame(renderLoop);\n};\n\nconst gameIsPaused = () => {\n    return animationId === null;\n}\n\n\nconst speedSlider = document.getElementById(\"speed-slider\");\n\nspeedSlider.addEventListener(\"input\", event => {\n    universe.set_speed(21 - event.target.value);\n});\n\n\nconst resetButton = document.getElementById(\"reset-button\");\nresetButton.textContent = \"Reset\";\n\nresetButton.addEventListener(\"click\", event => {\n    universe.set_initial_cells_dead();\n    draw();\n});\n\n\nconst randomButton = document.getElementById(\"random-button\");\nrandomButton.textContent = \"Random\";\n\nrandomButton.addEventListener(\"click\", event => {\n    universe.set_random_cells();\n    draw();\n});\n\n\nconst playPauseButton = document.getElementById(\"play-pause\");\n\nplayPauseButton.addEventListener(\"click\", event => {\n    if (gameIsPaused()) {\n        play();\n    } else {\n        pause();\n    }\n});\n\n\nconst play = () => {\n    playPauseButton.textContent = \"Pause\";\n    renderLoop();\n}\n\nconst pause = () => {\n    playPauseButton.textContent = \"Play\";\n    cancelAnimationFrame(animationId);\n    animationId = null;\n}\n\n\ncanvas.addEventListener(\"click\", event => {\n    const boundingRect = canvas.getBoundingClientRect();\n\n    const scaleX = canvas.width / boundingRect.width;\n    const scaleY = canvas.height / boundingRect.height;\n\n    const canvasLeft = (event.clientX - boundingRect.left) * scaleX;\n    const canvasTop = (event.clientY - boundingRect.top) * scaleY;\n\n    const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1);\n    const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1);\n\n    universe.toggle_cell(row, col);\n    draw();\n});\n\nconst draw = () => {\n    drawGrid();\n    drawCells();\n}\n\nconst drawGrid = () => {\n    ctx.beginPath();\n    ctx.strokeStyle = GRID_COLOR;\n\n    // Vertical lines\n    for (let i = 0; i <= width; i++) {\n        ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);\n        ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);\n    }\n\n    // Horizontal lines\n    for (let j = 0; j <= height; j++) {\n        ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);\n        ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);\n    }\n\n    ctx.stroke();\n}\n\nconst drawCells = () => {\n    const cellsPtr = universe.cells();\n    // We divide by 8 because we are now using FixedBitSet, so each cell is one bit\n    const cells = new Uint8Array(wasm_game_of_life_wasm_game_of_life_bg__WEBPACK_IMPORTED_MODULE_1__[\"memory\"].buffer, cellsPtr, width * height / 8);\n\n    ctx.beginPath();\n\n    ctx.fillStyle = ALIVE_COLOR;\n    for (let row = 0; row < height; row++) {\n        for (let col = 0; col < width; col++) {\n            const idx = getIndex(row, col);\n            if (!bitIsSet(idx, cells)) {\n                continue;\n            }\n\n            ctx.fillRect(\n                col * (CELL_SIZE + 1) + 1,\n                row * (CELL_SIZE + 1) + 1,\n                CELL_SIZE,\n                CELL_SIZE\n            );\n        }\n    }\n\n    ctx.fillStyle = DEAD_COLOR;\n    for (let row = 0; row < height; row++) {\n        for (let col = 0; col < width; col++) {\n            const idx = getIndex(row, col);\n            if (bitIsSet(idx, cells)) {\n                continue;\n            }\n\n            ctx.fillRect(\n                col * (CELL_SIZE + 1) + 1,\n                row * (CELL_SIZE + 1) + 1,\n                CELL_SIZE,\n                CELL_SIZE\n            );\n        }\n    }\n    ctx.stroke();\n}\n\nconst bitIsSet = (n, arr) => {\n    const byte = Math.floor(n / 8);\n    const mask = 1 << (n % 8);\n    return (arr[byte] & mask) === mask;\n};\n\nconst getIndex = (row, column) => {\n    return row * width + column;\n};\n\n\n// To measure performance\nconst fps = new class {\n    constructor() {\n        this.fps = document.getElementById(\"fps\");\n        this.frames = [];\n        this.lastFrameTimeStamp = performance.now();\n    }\n\n    render() {\n        // Convert the delta time since the last frame render into a measure\n        // of frames per second.\n        const now = performance.now();\n        const delta = now - this.lastFrameTimeStamp;\n        this.lastFrameTimeStamp = now;\n        const fps = 1 / delta * 1000;\n\n        // Save only the latest 100 timings.\n        this.frames.push(fps);\n        if (this.frames.length > 100) {\n            this.frames.shift();\n        }\n\n        // Find the max, min, and mean of our 100 latest timings.\n        let min = Infinity;\n        let max = -Infinity;\n        let sum = 0;\n        for (let i = 0; i < this.frames.length; i++) {\n            sum += this.frames[i];\n            min = Math.min(this.frames[i], min);\n            max = Math.max(this.frames[i], max);\n        }\n        let mean = sum / this.frames.length;\n\n        // Render the statistics.\n        this.fps.textContent = `\nFrames per Second:\n         latest = ${Math.round(fps)}\navg of last 100 = ${Math.round(mean)}\nmin of last 100 = ${Math.round(min)}\nmax of last 100 = ${Math.round(max)}\n`.trim();\n    }\n};\n\ndraw();\npause();\n\n\n//# sourceURL=webpack:///./index.js?");

/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("var g;\n\n// This works in non-strict mode\ng = (function() {\n\treturn this;\n})();\n\ntry {\n\t// This works if eval is allowed (see CSP)\n\tg = g || new Function(\"return this\")();\n} catch (e) {\n\t// This works if the window reference is available\n\tif (typeof window === \"object\") g = window;\n}\n\n// g can still be undefined, but nothing to do about it...\n// We return undefined, instead of nothing here, so it's\n// easier to handle this case. if(!global) { ...}\n\nmodule.exports = g;\n\n\n//# sourceURL=webpack:///(webpack)/buildin/global.js?");

/***/ }),

/***/ "./node_modules/webpack/buildin/harmony-module.js":
/*!*******************************************!*\
  !*** (webpack)/buildin/harmony-module.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = function(originalModule) {\n\tif (!originalModule.webpackPolyfill) {\n\t\tvar module = Object.create(originalModule);\n\t\t// module.parent = undefined by default\n\t\tif (!module.children) module.children = [];\n\t\tObject.defineProperty(module, \"loaded\", {\n\t\t\tenumerable: true,\n\t\t\tget: function() {\n\t\t\t\treturn module.l;\n\t\t\t}\n\t\t});\n\t\tObject.defineProperty(module, \"id\", {\n\t\t\tenumerable: true,\n\t\t\tget: function() {\n\t\t\t\treturn module.i;\n\t\t\t}\n\t\t});\n\t\tObject.defineProperty(module, \"exports\", {\n\t\t\tenumerable: true\n\t\t});\n\t\tmodule.webpackPolyfill = 1;\n\t}\n\treturn module;\n};\n\n\n//# sourceURL=webpack:///(webpack)/buildin/harmony-module.js?");

/***/ }),

/***/ "./pkg/wasm_game_of_life.js":
/*!**********************************!*\
  !*** ./pkg/wasm_game_of_life.js ***!
  \**********************************/
/*! exports provided: __wbg_set_wasm, Universe, __wbindgen_string_new, __wbindgen_object_drop_ref, __wbg_crypto_d05b68a3572bb8ca, __wbindgen_is_object, __wbg_process_b02b3570280d0366, __wbg_versions_c1cb42213cedf0f5, __wbg_node_43b1089f407e4ec2, __wbindgen_is_string, __wbg_require_9a7e0f667ead4995, __wbg_msCrypto_10fc94afee92bd76, __wbg_randomFillSync_b70ccbdf4926a99d, __wbg_getRandomValues_7e42b4fb8779dc6d, __wbg_log_9dfb3879776dd797, __wbindgen_is_function, __wbg_newnoargs_5859b6d41c6fe9f7, __wbg_call_a79f1973a4f07d5e, __wbg_self_086b5302bcafb962, __wbg_window_132fa5d7546f1de5, __wbg_globalThis_e5f801a37ad7d07b, __wbg_global_f9a61fce4af6b7c1, __wbindgen_is_undefined, __wbg_call_f6a2bc58c19c53c6, __wbg_buffer_5d1b598a01b41a42, __wbg_newwithbyteoffsetandlength_d695c7957788f922, __wbg_new_ace717933ad7117f, __wbg_set_74906aa30864df5a, __wbg_newwithlength_728575f3bba9959b, __wbg_subarray_7f7a652672800851, __wbindgen_object_clone_ref, __wbindgen_throw, __wbindgen_memory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _wasm_game_of_life_bg_wasm__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./wasm_game_of_life_bg.wasm */ \"./pkg/wasm_game_of_life_bg.wasm\");\n/* harmony import */ var _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./wasm_game_of_life_bg.js */ \"./pkg/wasm_game_of_life_bg.js\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbg_set_wasm\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbg_set_wasm\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"Universe\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"Universe\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbindgen_string_new\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbindgen_string_new\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbindgen_object_drop_ref\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbindgen_object_drop_ref\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbg_crypto_d05b68a3572bb8ca\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbg_crypto_d05b68a3572bb8ca\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbindgen_is_object\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbindgen_is_object\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbg_process_b02b3570280d0366\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbg_process_b02b3570280d0366\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbg_versions_c1cb42213cedf0f5\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbg_versions_c1cb42213cedf0f5\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbg_node_43b1089f407e4ec2\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbg_node_43b1089f407e4ec2\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbindgen_is_string\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbindgen_is_string\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbg_require_9a7e0f667ead4995\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbg_require_9a7e0f667ead4995\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbg_msCrypto_10fc94afee92bd76\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbg_msCrypto_10fc94afee92bd76\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbg_randomFillSync_b70ccbdf4926a99d\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbg_randomFillSync_b70ccbdf4926a99d\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbg_getRandomValues_7e42b4fb8779dc6d\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbg_getRandomValues_7e42b4fb8779dc6d\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbg_log_9dfb3879776dd797\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbg_log_9dfb3879776dd797\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbindgen_is_function\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbindgen_is_function\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbg_newnoargs_5859b6d41c6fe9f7\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbg_newnoargs_5859b6d41c6fe9f7\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbg_call_a79f1973a4f07d5e\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbg_call_a79f1973a4f07d5e\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbg_self_086b5302bcafb962\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbg_self_086b5302bcafb962\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbg_window_132fa5d7546f1de5\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbg_window_132fa5d7546f1de5\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbg_globalThis_e5f801a37ad7d07b\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbg_globalThis_e5f801a37ad7d07b\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbg_global_f9a61fce4af6b7c1\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbg_global_f9a61fce4af6b7c1\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbindgen_is_undefined\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbindgen_is_undefined\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbg_call_f6a2bc58c19c53c6\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbg_call_f6a2bc58c19c53c6\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbg_buffer_5d1b598a01b41a42\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbg_buffer_5d1b598a01b41a42\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbg_newwithbyteoffsetandlength_d695c7957788f922\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbg_newwithbyteoffsetandlength_d695c7957788f922\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbg_new_ace717933ad7117f\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbg_new_ace717933ad7117f\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbg_set_74906aa30864df5a\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbg_set_74906aa30864df5a\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbg_newwithlength_728575f3bba9959b\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbg_newwithlength_728575f3bba9959b\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbg_subarray_7f7a652672800851\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbg_subarray_7f7a652672800851\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbindgen_object_clone_ref\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbindgen_object_clone_ref\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbindgen_throw\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbindgen_throw\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"__wbindgen_memory\", function() { return _wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbindgen_memory\"]; });\n\n\n\nObject(_wasm_game_of_life_bg_js__WEBPACK_IMPORTED_MODULE_1__[\"__wbg_set_wasm\"])(_wasm_game_of_life_bg_wasm__WEBPACK_IMPORTED_MODULE_0__);\n\n\n\n//# sourceURL=webpack:///./pkg/wasm_game_of_life.js?");

/***/ }),

/***/ "./pkg/wasm_game_of_life_bg.js":
/*!*************************************!*\
  !*** ./pkg/wasm_game_of_life_bg.js ***!
  \*************************************/
/*! exports provided: __wbg_set_wasm, Universe, __wbindgen_string_new, __wbindgen_object_drop_ref, __wbg_crypto_d05b68a3572bb8ca, __wbindgen_is_object, __wbg_process_b02b3570280d0366, __wbg_versions_c1cb42213cedf0f5, __wbg_node_43b1089f407e4ec2, __wbindgen_is_string, __wbg_require_9a7e0f667ead4995, __wbg_msCrypto_10fc94afee92bd76, __wbg_randomFillSync_b70ccbdf4926a99d, __wbg_getRandomValues_7e42b4fb8779dc6d, __wbg_log_9dfb3879776dd797, __wbindgen_is_function, __wbg_newnoargs_5859b6d41c6fe9f7, __wbg_call_a79f1973a4f07d5e, __wbg_self_086b5302bcafb962, __wbg_window_132fa5d7546f1de5, __wbg_globalThis_e5f801a37ad7d07b, __wbg_global_f9a61fce4af6b7c1, __wbindgen_is_undefined, __wbg_call_f6a2bc58c19c53c6, __wbg_buffer_5d1b598a01b41a42, __wbg_newwithbyteoffsetandlength_d695c7957788f922, __wbg_new_ace717933ad7117f, __wbg_set_74906aa30864df5a, __wbg_newwithlength_728575f3bba9959b, __wbg_subarray_7f7a652672800851, __wbindgen_object_clone_ref, __wbindgen_throw, __wbindgen_memory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* WEBPACK VAR INJECTION */(function(module, global) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbg_set_wasm\", function() { return __wbg_set_wasm; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Universe\", function() { return Universe; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbindgen_string_new\", function() { return __wbindgen_string_new; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbindgen_object_drop_ref\", function() { return __wbindgen_object_drop_ref; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbg_crypto_d05b68a3572bb8ca\", function() { return __wbg_crypto_d05b68a3572bb8ca; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbindgen_is_object\", function() { return __wbindgen_is_object; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbg_process_b02b3570280d0366\", function() { return __wbg_process_b02b3570280d0366; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbg_versions_c1cb42213cedf0f5\", function() { return __wbg_versions_c1cb42213cedf0f5; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbg_node_43b1089f407e4ec2\", function() { return __wbg_node_43b1089f407e4ec2; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbindgen_is_string\", function() { return __wbindgen_is_string; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbg_require_9a7e0f667ead4995\", function() { return __wbg_require_9a7e0f667ead4995; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbg_msCrypto_10fc94afee92bd76\", function() { return __wbg_msCrypto_10fc94afee92bd76; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbg_randomFillSync_b70ccbdf4926a99d\", function() { return __wbg_randomFillSync_b70ccbdf4926a99d; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbg_getRandomValues_7e42b4fb8779dc6d\", function() { return __wbg_getRandomValues_7e42b4fb8779dc6d; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbg_log_9dfb3879776dd797\", function() { return __wbg_log_9dfb3879776dd797; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbindgen_is_function\", function() { return __wbindgen_is_function; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbg_newnoargs_5859b6d41c6fe9f7\", function() { return __wbg_newnoargs_5859b6d41c6fe9f7; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbg_call_a79f1973a4f07d5e\", function() { return __wbg_call_a79f1973a4f07d5e; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbg_self_086b5302bcafb962\", function() { return __wbg_self_086b5302bcafb962; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbg_window_132fa5d7546f1de5\", function() { return __wbg_window_132fa5d7546f1de5; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbg_globalThis_e5f801a37ad7d07b\", function() { return __wbg_globalThis_e5f801a37ad7d07b; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbg_global_f9a61fce4af6b7c1\", function() { return __wbg_global_f9a61fce4af6b7c1; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbindgen_is_undefined\", function() { return __wbindgen_is_undefined; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbg_call_f6a2bc58c19c53c6\", function() { return __wbg_call_f6a2bc58c19c53c6; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbg_buffer_5d1b598a01b41a42\", function() { return __wbg_buffer_5d1b598a01b41a42; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbg_newwithbyteoffsetandlength_d695c7957788f922\", function() { return __wbg_newwithbyteoffsetandlength_d695c7957788f922; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbg_new_ace717933ad7117f\", function() { return __wbg_new_ace717933ad7117f; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbg_set_74906aa30864df5a\", function() { return __wbg_set_74906aa30864df5a; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbg_newwithlength_728575f3bba9959b\", function() { return __wbg_newwithlength_728575f3bba9959b; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbg_subarray_7f7a652672800851\", function() { return __wbg_subarray_7f7a652672800851; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbindgen_object_clone_ref\", function() { return __wbindgen_object_clone_ref; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbindgen_throw\", function() { return __wbindgen_throw; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"__wbindgen_memory\", function() { return __wbindgen_memory; });\nlet wasm;\nfunction __wbg_set_wasm(val) {\n    wasm = val;\n}\n\n\nconst lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;\n\nlet cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });\n\ncachedTextDecoder.decode();\n\nlet cachedUint8Memory0 = null;\n\nfunction getUint8Memory0() {\n    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {\n        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);\n    }\n    return cachedUint8Memory0;\n}\n\nfunction getStringFromWasm0(ptr, len) {\n    ptr = ptr >>> 0;\n    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));\n}\n\nconst heap = new Array(128).fill(undefined);\n\nheap.push(undefined, null, true, false);\n\nlet heap_next = heap.length;\n\nfunction addHeapObject(obj) {\n    if (heap_next === heap.length) heap.push(heap.length + 1);\n    const idx = heap_next;\n    heap_next = heap[idx];\n\n    heap[idx] = obj;\n    return idx;\n}\n\nfunction getObject(idx) { return heap[idx]; }\n\nfunction dropObject(idx) {\n    if (idx < 132) return;\n    heap[idx] = heap_next;\n    heap_next = idx;\n}\n\nfunction takeObject(idx) {\n    const ret = getObject(idx);\n    dropObject(idx);\n    return ret;\n}\n\nfunction handleError(f, args) {\n    try {\n        return f.apply(this, args);\n    } catch (e) {\n        wasm.__wbindgen_exn_store(addHeapObject(e));\n    }\n}\n/**\n*/\nclass Universe {\n\n    static __wrap(ptr) {\n        ptr = ptr >>> 0;\n        const obj = Object.create(Universe.prototype);\n        obj.__wbg_ptr = ptr;\n\n        return obj;\n    }\n\n    __destroy_into_raw() {\n        const ptr = this.__wbg_ptr;\n        this.__wbg_ptr = 0;\n\n        return ptr;\n    }\n\n    free() {\n        const ptr = this.__destroy_into_raw();\n        wasm.__wbg_universe_free(ptr);\n    }\n    /**\n    * @returns {Universe}\n    */\n    static new() {\n        const ret = wasm.universe_new();\n        return Universe.__wrap(ret);\n    }\n    /**\n    * @param {number} width\n    * @param {number} height\n    * @returns {Universe}\n    */\n    static new_with_parameters(width, height) {\n        const ret = wasm.universe_new_with_parameters(width, height);\n        return Universe.__wrap(ret);\n    }\n    /**\n    */\n    set_initial_cells_dead() {\n        wasm.universe_set_initial_cells_dead(this.__wbg_ptr);\n    }\n    /**\n    */\n    set_random_cells() {\n        wasm.universe_set_random_cells(this.__wbg_ptr);\n    }\n    /**\n    * @returns {number}\n    */\n    width() {\n        const ret = wasm.universe_width(this.__wbg_ptr);\n        return ret >>> 0;\n    }\n    /**\n    * Set the width of the universe.\n    *\n    * Resets all cells to the dead state.\n    * @param {number} width\n    */\n    set_width(width) {\n        wasm.universe_set_width(this.__wbg_ptr, width);\n    }\n    /**\n    * Set the speed of the universe.\n    * @param {number} speed\n    */\n    set_speed(speed) {\n        wasm.universe_set_speed(this.__wbg_ptr, speed);\n    }\n    /**\n    * @returns {number}\n    */\n    height() {\n        const ret = wasm.universe_height(this.__wbg_ptr);\n        return ret >>> 0;\n    }\n    /**\n    * Set the height of the universe.\n    *\n    * Resets all cells to the dead state.\n    * @param {number} height\n    */\n    set_height(height) {\n        wasm.universe_set_height(this.__wbg_ptr, height);\n    }\n    /**\n    * @returns {number}\n    */\n    cells() {\n        const ret = wasm.universe_cells(this.__wbg_ptr);\n        return ret >>> 0;\n    }\n    /**\n    * @param {number} row\n    * @param {number} column\n    */\n    toggle_cell(row, column) {\n        wasm.universe_toggle_cell(this.__wbg_ptr, row, column);\n    }\n    /**\n    */\n    tick() {\n        wasm.universe_tick(this.__wbg_ptr);\n    }\n}\n\nfunction __wbindgen_string_new(arg0, arg1) {\n    const ret = getStringFromWasm0(arg0, arg1);\n    return addHeapObject(ret);\n};\n\nfunction __wbindgen_object_drop_ref(arg0) {\n    takeObject(arg0);\n};\n\nfunction __wbg_crypto_d05b68a3572bb8ca(arg0) {\n    const ret = getObject(arg0).crypto;\n    return addHeapObject(ret);\n};\n\nfunction __wbindgen_is_object(arg0) {\n    const val = getObject(arg0);\n    const ret = typeof(val) === 'object' && val !== null;\n    return ret;\n};\n\nfunction __wbg_process_b02b3570280d0366(arg0) {\n    const ret = getObject(arg0).process;\n    return addHeapObject(ret);\n};\n\nfunction __wbg_versions_c1cb42213cedf0f5(arg0) {\n    const ret = getObject(arg0).versions;\n    return addHeapObject(ret);\n};\n\nfunction __wbg_node_43b1089f407e4ec2(arg0) {\n    const ret = getObject(arg0).node;\n    return addHeapObject(ret);\n};\n\nfunction __wbindgen_is_string(arg0) {\n    const ret = typeof(getObject(arg0)) === 'string';\n    return ret;\n};\n\nfunction __wbg_require_9a7e0f667ead4995() { return handleError(function () {\n    const ret = module.require;\n    return addHeapObject(ret);\n}, arguments) };\n\nfunction __wbg_msCrypto_10fc94afee92bd76(arg0) {\n    const ret = getObject(arg0).msCrypto;\n    return addHeapObject(ret);\n};\n\nfunction __wbg_randomFillSync_b70ccbdf4926a99d() { return handleError(function (arg0, arg1) {\n    getObject(arg0).randomFillSync(takeObject(arg1));\n}, arguments) };\n\nfunction __wbg_getRandomValues_7e42b4fb8779dc6d() { return handleError(function (arg0, arg1) {\n    getObject(arg0).getRandomValues(getObject(arg1));\n}, arguments) };\n\nfunction __wbg_log_9dfb3879776dd797(arg0) {\n    console.log(getObject(arg0));\n};\n\nfunction __wbindgen_is_function(arg0) {\n    const ret = typeof(getObject(arg0)) === 'function';\n    return ret;\n};\n\nfunction __wbg_newnoargs_5859b6d41c6fe9f7(arg0, arg1) {\n    const ret = new Function(getStringFromWasm0(arg0, arg1));\n    return addHeapObject(ret);\n};\n\nfunction __wbg_call_a79f1973a4f07d5e() { return handleError(function (arg0, arg1) {\n    const ret = getObject(arg0).call(getObject(arg1));\n    return addHeapObject(ret);\n}, arguments) };\n\nfunction __wbg_self_086b5302bcafb962() { return handleError(function () {\n    const ret = self.self;\n    return addHeapObject(ret);\n}, arguments) };\n\nfunction __wbg_window_132fa5d7546f1de5() { return handleError(function () {\n    const ret = window.window;\n    return addHeapObject(ret);\n}, arguments) };\n\nfunction __wbg_globalThis_e5f801a37ad7d07b() { return handleError(function () {\n    const ret = globalThis.globalThis;\n    return addHeapObject(ret);\n}, arguments) };\n\nfunction __wbg_global_f9a61fce4af6b7c1() { return handleError(function () {\n    const ret = global.global;\n    return addHeapObject(ret);\n}, arguments) };\n\nfunction __wbindgen_is_undefined(arg0) {\n    const ret = getObject(arg0) === undefined;\n    return ret;\n};\n\nfunction __wbg_call_f6a2bc58c19c53c6() { return handleError(function (arg0, arg1, arg2) {\n    const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));\n    return addHeapObject(ret);\n}, arguments) };\n\nfunction __wbg_buffer_5d1b598a01b41a42(arg0) {\n    const ret = getObject(arg0).buffer;\n    return addHeapObject(ret);\n};\n\nfunction __wbg_newwithbyteoffsetandlength_d695c7957788f922(arg0, arg1, arg2) {\n    const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);\n    return addHeapObject(ret);\n};\n\nfunction __wbg_new_ace717933ad7117f(arg0) {\n    const ret = new Uint8Array(getObject(arg0));\n    return addHeapObject(ret);\n};\n\nfunction __wbg_set_74906aa30864df5a(arg0, arg1, arg2) {\n    getObject(arg0).set(getObject(arg1), arg2 >>> 0);\n};\n\nfunction __wbg_newwithlength_728575f3bba9959b(arg0) {\n    const ret = new Uint8Array(arg0 >>> 0);\n    return addHeapObject(ret);\n};\n\nfunction __wbg_subarray_7f7a652672800851(arg0, arg1, arg2) {\n    const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);\n    return addHeapObject(ret);\n};\n\nfunction __wbindgen_object_clone_ref(arg0) {\n    const ret = getObject(arg0);\n    return addHeapObject(ret);\n};\n\nfunction __wbindgen_throw(arg0, arg1) {\n    throw new Error(getStringFromWasm0(arg0, arg1));\n};\n\nfunction __wbindgen_memory() {\n    const ret = wasm.memory;\n    return addHeapObject(ret);\n};\n\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/harmony-module.js */ \"./node_modules/webpack/buildin/harmony-module.js\")(module), __webpack_require__(/*! ./../node_modules/webpack/buildin/global.js */ \"./node_modules/webpack/buildin/global.js\")))\n\n//# sourceURL=webpack:///./pkg/wasm_game_of_life_bg.js?");

/***/ }),

/***/ "./pkg/wasm_game_of_life_bg.wasm":
/*!***************************************!*\
  !*** ./pkg/wasm_game_of_life_bg.wasm ***!
  \***************************************/
/*! exports provided: memory, __wbg_universe_free, universe_new, universe_new_with_parameters, universe_set_initial_cells_dead, universe_set_random_cells, universe_width, universe_set_width, universe_set_speed, universe_height, universe_set_height, universe_cells, universe_toggle_cell, universe_tick, __wbindgen_exn_store */
/***/ (function(module, exports, __webpack_require__) {

eval("\"use strict\";\n// Instantiate WebAssembly module\nvar wasmExports = __webpack_require__.w[module.i];\n__webpack_require__.r(exports);\n// export exports from WebAssembly module\nfor(var name in wasmExports) if(name != \"__webpack_init__\") exports[name] = wasmExports[name];\n// exec imports from WebAssembly module (for esm order)\n/* harmony import */ var m0 = __webpack_require__(/*! ./wasm_game_of_life_bg.js */ \"./pkg/wasm_game_of_life_bg.js\");\n\n\n// exec wasm module\nwasmExports[\"__webpack_init__\"]()\n\n//# sourceURL=webpack:///./pkg/wasm_game_of_life_bg.wasm?");

/***/ })

}]);
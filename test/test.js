const { BLOCK } = require("@randumbpurson/notion-api-helper");
const {monitor} = require("../index");

test_monitor = new monitor();

test_monitor.start('localhost:3000/test');
test_monitor.add_block(BLOCK, "55674e0b64054b3d862699f788d80378#c244b4b9239143aeafb8321e2260944a");
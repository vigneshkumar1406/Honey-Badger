const fs = require("fs");
const path = require("path");
const file = path.join(process.cwd(), "data", "orders.json");
fs.writeFileSync(file, "[]", "utf-8");
console.log("Cleared data/orders.json");

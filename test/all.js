const runner = require("./runner");
const system = require("system");

exports.testCollectionManyToMany = require("./collection_manytomany_test");
exports.testCollection = require("./collection_test");
exports.testCollectionCache = require("./collection_cache_test");
exports.testIndex = require("./index_test");
exports.testJSON = require("./json_test");
exports.testLifecycle = require("./lifecycle_test");
exports.testMapping = require("./mapping_test");
exports.testObject = require("./object_test");
exports.testStore = require("./store_test");
exports.testRollback = require("./rollback_test");
exports.testTransaction = require("./transaction_test");
exports.testQuery = require("./query/all");
exports.testDatabase = require("./database/all");

if (arguments.slice(0).indexOf("postgresql") > 0) {
    exports.testPostgreSQL = require("./postgresql/all");
}

if (arguments.slice(0).indexOf("postgresql") > 0) {
    exports.testPostgreSQL = require("./postgresql/all");
}

if (require.main == module.id) {
    system.exit(runner.run(exports, arguments));
}

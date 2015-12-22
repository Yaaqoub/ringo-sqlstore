/**
 * Contains the opening quote character used to quote table and column names
 * @type String
 */
exports.openQuote = '"';
/**
 * Contains the closing quote character used to quote table and column names
 * @type String
 */
exports.closeQuote = '"';

exports.getColumnSql = function(mapping) {
    if (!this.hasOwnProperty("dataTypes") || this.dataTypes == undefined) {
        throw new Error("No data types defined for dialect");
    }
    var dataType = this.dataTypes[mapping.type];
    if (typeof(dataType) !== "function") {
        throw new Error("Missing or invalid dialect data type " + mapping.type);
    }
    return dataType(mapping);
};

/**
 * Returns the storage engine type. This is only needed for MySQL databases
 * @returns The storage engine type
 * @type String
 */
exports.getEngineType = function() {
    return null;
};

/**
 * Returns the string passed as argument enclosed in quotes
 * @param {String} str The string to enclose in quotes
 * @param {String} prefix Optional prefix which is also quoted
 * @returns {String} The string enclosed in quotes
 */
exports.quote = function(str, prefix) {
    var buf = [];
    if (prefix != undefined) {
        buf.push(this.openQuote, prefix, this.closeQuote, ".");
    }
    buf.push(this.openQuote, str, this.closeQuote);
    return buf.join("");
};

/** @ignore */
exports.toString = function() {
    return "[BaseDialect]";
};

/**
 * True if the underlying database supports sequences. Dialect
 * implementations should override this. Defaults to false.
 * @type Boolean
 */
exports.hasSequenceSupport = false;

/**
 * Returns the SQL statement for retrieving the next value of a sequence. Dialect
 * implementations should override this.
 * @param {String} sequenceName The name of the sequence
 * @returns {String} The SQL statement
 */
exports.getSqlNextSequenceValue = function(sequenceName) {
    throw new Error("No sequence support");
};

/**
 * Extends the SQL statement passed as argument with a limit restriction. Dialect
 * implementations should override this.
 * @param {String} sql The SQL statement to add the limit restriction to
 * @param {Number} limit The limit
 * @returns {String} The SQL statement
 */
exports.addSqlLimit = function(sql, limit) {
    throw new Error("Limit not implemented");
};

/**
 * Extends the SQL statement passed as argument with an offset restriction. Dialect
 * implementations should override this.
 * @param {String} sql The SQL statement to add the offset restriction to
 * @param {Number} offset The offset
 * @returns {String} The SQL statement
 */
exports.addSqlOffset = function(sql, offset) {
    throw new Error("Offset not implemented");
};

/**
 * Extends the SQL statement passed as argument with a range restriction. Dialect
 * implementations should override this.
 * @param {String} sql The SQL statement to add the range restriction to
 * @param {Number} offset The offset
 * @param {Number} limit The limit
 * @returns {String} The SQL statement
 */
exports.addSqlRange = function(sql, offset, limit) {
    throw new Error("Range not implemented");
};

/**
 * Returns the name of the default schema. Dialect implementations can override this.
 * @param {java.sql.Connection} conn The connection to use
 * @returns {String} The name of the default schema
 */
exports.getDefaultSchema = function(conn) {
    return null;
};
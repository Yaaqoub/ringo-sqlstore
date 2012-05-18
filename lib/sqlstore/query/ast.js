var Node = function Node() {
    return this;
};

Node.prototype.toString = function() {
    return "[" + this.constructor.name + "]";
};

Node.prototype.accept = function(visitor) {
    throw new Error(this.constructor.name + " doesn't implement accept(visitor)");
};


var Value = exports.Value = function Value() {
    return this;
};
Value.prototype = Object.create(Node.prototype);
Value.prototype.constructor = Value;

Value.prototype.accept = function(visitor) {
    return visitor.visitValue(this);
};


// values

var StringValue = exports.StringValue = function StringValue(value) {
    Object.defineProperties(this, {
        "type": {"value": "string", "enumerable": true},
        "value": {"value": value, "enumerable": true}
    });
    return this;
};
StringValue.prototype = Object.create(Value.prototype);
StringValue.prototype.constructor = StringValue;

var IntValue = exports.IntValue = function IntValue(value) {
    Object.defineProperties(this, {
        "type": {"value": "long", "enumerable": true},
        "value": {"value": value, "enumerable": true}
    });
    return this;
};
IntValue.prototype = Object.create(Value.prototype);
IntValue.prototype.constructor = IntValue;

var DecimalValue = exports.DecimalValue = function DecimalValue(value) {
    Object.defineProperties(this, {
        "type": {"value": "float", "enumerable": true},
        "value": {"value": value, "enumerable": true}
    });
    return this;
};
DecimalValue.prototype = Object.create(Value.prototype);
DecimalValue.prototype.constructor = DecimalValue;

var BooleanValue = exports.BooleanValue = function BooleanValue(value) {
    Object.defineProperties(this, {
        "type": {"value": "boolean", "enumerable": true},
        "value": {"value": value, "enumerable": true}
    });
    return this;
};
BooleanValue.prototype = Object.create(Value.prototype);
BooleanValue.prototype.constructor = BooleanValue;

var NullValue = exports.NullValue = function NullValue() {
    Object.defineProperties(this, {
        "type": {"value": "null", "enumerable": true},
        "value": {"value": null, "enumerable": true}
    });
    return this;
};
NullValue.prototype = Object.create(Value.prototype);
NullValue.prototype.constructor = NullValue;

var ParameterValue = exports.ParameterValue = function ParameterValue(name) {
    Object.defineProperties(this, {
        "type": {"value": "parameter", "enumerable": true},
        "value": {"value": name, "enumerable": true}
    });
    return this;
};
ParameterValue.prototype = Object.create(Value.prototype);
ParameterValue.prototype.constructor = ParameterValue;

ParameterValue.prototype.accept = function(visitor) {
    return visitor.visitParameterValue(this);
};


// entity

var Entity = exports.Entity = function Entity(entity) {
    Object.defineProperties(this, {
        "entity": {"value": entity, "enumerable": true},
        "property": {"value": "id", "enumerable": true}
    });
    return this;
};
Entity.prototype = Object.create(Node.prototype);
Entity.prototype.constructor = Entity;

Entity.prototype.accept = function(visitor) {
    return visitor.visitEntity(this);
};

Entity.prototype.getEntityMapping = function(visitor) {
    return visitor.getEntityMapping(this.entity);
};

Entity.prototype.getPropertyMapping = function(visitor) {
    return visitor.getEntityMapping(this.entity).getMapping(this.property);
};

// ident

var Ident = exports.Ident = function Ident(entity, property) {
    Object.defineProperties(this, {
        "entity": {"value": entity, "enumerable": true},
        "property": {"value": property || null, "enumerable": true}
    });
    return this;
};
Ident.prototype = Object.create(Node.prototype);
Ident.prototype.constructor = Ident;

Ident.prototype.accept = function(visitor) {
    return visitor.visitIdent(this);
};

Ident.prototype.getEntityMapping = function(visitor) {
    return visitor.getEntityMapping(this.entity);
};

Ident.prototype.getPropertyMapping = function(visitor) {
    return this.getEntityMapping(visitor).getMapping(this.property);
};

Ident.prototype.getResultPropertyName = function() {
    return this.entity + "." + this.property;
};

var AliasIdent = exports.AliasIdent = function AliasIdent(alias, property) {
    Object.defineProperties(this, {
        "alias": {"value": alias, "enumerable": true},
        "property": {"value": property || null, "enumerable": true}
    });
    return this;
};
AliasIdent.prototype = Object.create(Node.prototype);
AliasIdent.prototype.constructor = AliasIdent;

AliasIdent.prototype.accept = function(visitor) {
    return visitor.visitAliasIdent(this);
};

AliasIdent.prototype.getEntityMapping = function(visitor) {
    return visitor.getEntityMapping(this.alias);
};

AliasIdent.prototype.getPropertyMapping = function(visitor) {
    return this.getEntityMapping(visitor).getMapping(this.property);
};

AliasIdent.prototype.getResultPropertyName = function() {
    return this.alias + "." + this.property;
};

var AliasEntity = exports.AliasEntity = function(alias, loadAggressive) {
    Object.defineProperties(this, {
        "alias": {"value": alias, "enumerable": true},
        "property": {"value": "id", "enumerable": true},
        "loadAggressive": {"value": loadAggressive === true, "enumerable": true}
    });
};
AliasEntity.prototype = Object.create(Node.prototype);
AliasEntity.prototype.constructor = AliasEntity;

AliasEntity.prototype.accept = function(visitor) {
    return visitor.visitAliasEntity(this);
};

AliasEntity.prototype.getEntityMapping = function(visitor) {
    return visitor.getEntityMapping(this.alias);
};

AliasEntity.prototype.getPropertyMapping = function(visitor) {
    return this.getEntityMapping(visitor).getMapping(this.property);
};

AliasEntity.prototype.getResultPropertyName = function() {
    return this.alias;
};


// comparison

var Comparison = exports.Comparison = function Comparison(operator, value) {
    Object.defineProperties(this, {
        "operator": {"value": operator, "enumerable": true},
        "value": {"value": value, "enumerable": true}
    });
    return this;
};
Comparison.prototype = Object.create(Node.prototype);
Comparison.prototype.constructor = Comparison;

Comparison.prototype.accept = function(visitor) {
    return visitor.visitComparison(this);
};


// condition

var Condition = exports.Condition = function Condition(left, right) {
    Object.defineProperties(this, {
        "left": {"value": left, "enumerable": true},
        "right": {"value": right, "enumerable": true}
    });
    return this;
};
Condition.prototype = Object.create(Node.prototype);
Condition.prototype.constructor = Condition;

Condition.prototype.accept = function(visitor) {
    return visitor.visitCondition(this);
};


var NotCondition = exports.NotCondition = function NotCondition(value) {
    Object.defineProperties(this, {
        "value": {"value": value, "enumerable": true}
    });
    return this;
};
NotCondition.prototype = Object.create(Node.prototype);
NotCondition.prototype.constructor = NotCondition;

NotCondition.prototype.accept = function(visitor) {
    return visitor.visitNotCondition(this);
};

var ExistsCondition = exports.ExistsCondition = function ExistsCondition(select) {
    Object.defineProperties(this, {
        "select": {"value": select, "enumerable": true}
    });
    return this;
};
ExistsCondition.prototype = Object.create(Node.prototype);
ExistsCondition.prototype.constructor = ExistsCondition;

ExistsCondition.prototype.accept = function(visitor) {
    return visitor.visitExistCondition(this);
};


var IsNullCondition = exports.IsNullCondition = function IsNullCondition(not) {
    Object.defineProperties(this, {
        "isNot": {"value": not === true, "enumerable": true}
    });
    return this;
};
IsNullCondition.prototype = Object.create(Node.prototype);
IsNullCondition.prototype.constructor = IsNullCondition;

IsNullCondition.prototype.accept = function(visitor) {
    return visitor.visitIsNullCondition(this);
};


var BetweenCondition = exports.BetweenCondition = function BetweenCondition(start, end) {
    Object.defineProperties(this, {
        "start": {"value": start, "enumerable": true},
        "end": {"value": end, "enumerable": true}
    });
    return this;
};
BetweenCondition.prototype = Object.create(Node.prototype);
BetweenCondition.prototype.constructor = BetweenCondition;

BetweenCondition.prototype.accept = function(visitor) {
    return visitor.visitBetweenCondition(this);
};


var InCondition = exports.InCondition = function InCondition(values) {
    Object.defineProperties(this, {
        "values": {"value": values, "enumerable": true}
    });
    return this;
};
InCondition.prototype = Object.create(Node.prototype);
InCondition.prototype.constructor = InCondition;

InCondition.prototype.accept = function(visitor) {
    return visitor.visitInCondition(this);
};


var LikeCondition = exports.LikeCondition = function LikeCondition(value, not) {
    Object.defineProperties(this, {
        "isNot": {"value": not === true, "enumerable": true},
        "value": {"value": value, "enumerable": true}
    });
    return this;
};
LikeCondition.prototype = Object.create(Node.prototype);
LikeCondition.prototype.constructor = LikeCondition;

LikeCondition.prototype.accept = function(visitor) {
    return visitor.visitLikeCondition(this);
};


// condition list
var ConditionList = exports.ConditionList = function ConditionList(conditions) {
    Object.defineProperties(this, {
        "conditions": {"value": conditions, "enumerable": true},
        "length": {
            "get": function() {
                return conditions.length;
            },
            "enumerable": true
        }
    });
    return this;
};

ConditionList.prototype = Object.create(Node.prototype);
ConditionList.prototype.constructor = ConditionList;

ConditionList.prototype.accept = function(visitor) {
    return visitor.visitConditionList(this);
};


// expression

var Expression = exports.Expression = function Expression(andConditions, orConditions) {
    Object.defineProperties(this, {
        "andConditions": {"value": andConditions, "enumerable": true},
        "orConditions": {"value": orConditions, "enumerable": true}
    });
    return this;
};
Expression.prototype = Object.create(Node.prototype);
Expression.prototype.constructor = Expression;

Expression.prototype.accept = function(visitor) {
    return visitor.visitExpression(this);
};


// having clause

var HavingClause = exports.HavingClause = function HavingClause(expression) {
    Object.defineProperties(this, {
        "value": {"value": expression, "enumerable": true}
    });
    return this;
};
HavingClause.prototype = Object.create(Node.prototype);
HavingClause.prototype.constructor = HavingClause;

HavingClause.prototype.accept = function(visitor) {
    return visitor.visitHavingClause(this);
};


// order by

var OrderBy = exports.OrderBy = function OrderBy(ident, isReverse) {
    Object.defineProperties(this, {
        "value": {"value": ident, "enumerable": true},
        "isReverse": {"value": isReverse, "enumerable": true}
    });
    return this;
};
OrderBy.prototype = Object.create(Node.prototype);
OrderBy.prototype.constructor = OrderBy;

OrderBy.prototype.accept = function(visitor) {
    return visitor.visitOrderBy(this);
};


// order by clause

var OrderByClause = exports.OrderByClause = function OrderByClause(list) {
    Object.defineProperties(this, {
        "list": {"value": list, "enumerable": true}
    });
    return this;
};
OrderByClause.prototype = Object.create(Node.prototype);
OrderByClause.prototype.constructor = OrderByClause;

OrderByClause.prototype.accept = function(visitor) {
    return visitor.visitOrderByClause(this);
};


// group by clause

var GroupByClause = exports.GroupByClause = function GroupByClause(list) {
    Object.defineProperties(this, {
        "list": {"value": list, "enumerable": true}
    });
    return this;
};
GroupByClause.prototype = Object.create(Node.prototype);
GroupByClause.prototype.constructor = GroupByClause;

GroupByClause.prototype.accept = function(visitor) {
    return visitor.visitGroupByClause(this);
};


// where clause

var WhereClause = exports.WhereClause = function WhereClause(expression) {
    Object.defineProperties(this, {
        "value": {"value": expression, "enumerable": true}
    });
    return this;
};
WhereClause.prototype = Object.create(Node.prototype);
WhereClause.prototype.constructor = WhereClause;

WhereClause.prototype.accept = function(visitor) {
    return visitor.visitWhereClause(this);
};


// from clause

var FromClause = exports.FromClause = function FromClause(list) {
    var aliases = {};
    for each (let expression in list) {
        if (expression.alias != null) {
            aliases[expression.alias] = expression.entity.entity;
        }
    }
    Object.defineProperties(this, {
        "list": {"value": list, "enumerable": true},
        "get": {
            "value": function(idx) {
                return list[idx];
            },
            "enumerable": true
        },
        "length": {
            "get": function() {
                return list.length;
            },
            "enumerable": true
        },
        "aliases": {"value": aliases, "enumerable": true}
    });
    return this;
};
FromClause.prototype = Object.create(Node.prototype);
FromClause.prototype.constructor = FromClause;

FromClause.prototype.accept = function(visitor) {
    return visitor.visitFromClause(this);
};


var FromExpression = exports.FromExpression = function FromExpression(entity, alias) {
    Object.defineProperties(this, {
        "entity": {"value": entity, "enumerable": true},
        "alias": {"value": alias, "enumerable": true}
    });
    return this;
};

FromExpression.prototype = Object.create(Node.prototype);
FromExpression.prototype.constructor = FromExpression;

FromExpression.prototype.accept = function(visitor) {
    return visitor.visitFromExpression(this);
};


// inner join clause

var InnerJoinClause = exports.InnerJoinClause = function InnerJoinClause(entities, predicate) {
    Object.defineProperties(this, {
        "entities": {"value": entities, "enumerable": true},
        "predicate": {"value": predicate, "enumerable": true}
    });
    return this;
};
InnerJoinClause.prototype = Object.create(Node.prototype);
InnerJoinClause.prototype.constructor = InnerJoinClause;

InnerJoinClause.prototype.accept = function(visitor) {
    return visitor.visitInnerJoinClause(this);
};


// (left/right) outer join clause

var OuterJoinClause = exports.OuterJoinClause = function OuterJoinClause(side, entities, predicate) {
    Object.defineProperties(this, {
        "side": {"value": side, "enumerable": true},
        "entities": {"value": entities, "enumerable": true},
        "predicate": {"value": predicate, "enumerable": true}
    });
    return this;
};
OuterJoinClause.prototype = Object.create(Node.prototype);
OuterJoinClause.prototype.constructor = OuterJoinClause;

OuterJoinClause.prototype.accept = function(visitor) {
    return visitor.visitOuterJoinClause(this);
};


// range clause
var RangeClause = exports.RangeClause = function RangeClause(offset, limit) {
    Object.defineProperties(this, {
        "offset": {"value": offset || 0, "enumerable": true},
        "limit": {"value": limit || 0, "enumerable": true}
    });
    return this;
};
RangeClause.prototype = Object.create(Node.prototype);
RangeClause.prototype.constructor = RangeClause;

RangeClause.prototype.accept = function(visitor) {
    return visitor.visitRangeClause(this);
};


// select clause

var SelectClause = exports.SelectClause = function SelectClause(list) {
    Object.defineProperties(this, {
        "list": {"value": list, "enumerable": true},
        "get": {
            "value": function(idx) {
                return list[idx];
            },
            "enumerable": true
        },
        "length": {
            "get": function() {
                return list.length;
            },
            "enumerable": true
        }
    });
    return this;
};
SelectClause.prototype = Object.create(Node.prototype);
SelectClause.prototype.constructor = SelectClause;

SelectClause.prototype.accept = function(visitor) {
    return visitor.visitSelectClause(this);
};

SelectClause.prototype.isEntityQuery = function() {
    if (this.length === 1) {
        return this.get(0).expression instanceof SelectEntity ||
                this.get(0).expression instanceof AliasEntity;
    }
    return false;
};

var SelectEntity = exports.SelectEntity = function SelectEntity(entity, loadAggressive) {
    Object.defineProperties(this, {
        "entity": {"value": entity, "enumerable": true},
        "property": {"value": "id", "enumerable": true},
        "loadAggressive": {"value": loadAggressive === true, "enumerable": true}
    });
    return this;
};
SelectEntity.prototype = Object.create(Node.prototype);
SelectEntity.prototype.constructor = SelectEntity;

SelectEntity.prototype.accept = function(visitor) {
    return visitor.visitSelectEntity(this);
};

SelectEntity.prototype.getEntityMapping = function(visitor) {
    return visitor.getEntityMapping(this.entity);
};

SelectEntity.prototype.getPropertyMapping = function(visitor) {
    return visitor.getEntityMapping(this.entity).getMapping(this.property);
};

SelectEntity.prototype.getResultPropertyName = function() {
    return this.entity;
};



var SelectExpression = exports.SelectExpression = function SelectExpression(expression, alias) {
    Object.defineProperties(this, {
        "expression": {"value": expression, "enumerable": true},
        "alias": {"value": alias, "enumerable": true}
    });
    return this;
};
SelectExpression.prototype = Object.create(Node.prototype);
SelectExpression.prototype.constructor = SelectExpression;

SelectExpression.prototype.accept = function(visitor) {
    return visitor.visitSelectExpression(this);
};

SelectExpression.prototype.getEntityMapping = function(visitor) {
    return this.expression.getEntityMapping(visitor);
};

SelectExpression.prototype.getPropertyMapping = function(visitor) {
    return this.expression.getPropertyMapping(visitor);
};

SelectExpression.prototype.getResultPropertyName = function() {
    return this.alias || this.expression.getResultPropertyName();
};


// aggregation

var Aggregation = exports.Aggregation = function Aggregation(type, ident) {
    Object.defineProperties(this, {
        "type": {"value": type, "enumerable": true},
        "value": {"value": ident, "enumerable": true}
    });
    return this;
};
Aggregation.MAX = "MAX";
Aggregation.MIN = "MIN";
Aggregation.SUM = "SUM";
Aggregation.COUNT = "COUNT";
Aggregation.prototype = Object.create(Node.prototype);
Aggregation.prototype.constructor = Aggregation;

Aggregation.prototype.accept = function(visitor) {
    return visitor.visitAggregation(this);
};

Aggregation.prototype.getPropertyMapping = function(visitor) {
    return this.value.getPropertyMapping(visitor);
};

Aggregation.prototype.getResultPropertyName = function() {
    return this.type + "_" + this.value.getResultPropertyName();
};


// select

var Select = exports.Select = function Select(select, from, join, where, groupBy, having, orderBy, range, isDistinct) {
    Object.defineProperties(this, {
        "select": {"value": select, "enumerable": true},
        "from": {"value": from, "enumerable": true},
        "join": {"value": join, "enumerable": true},
        "where": {"value": where, "enumerable": true},
        "groupBy": {"value": groupBy, "enumerable": true},
        "having": {"value": having, "enumerable": true},
        "orderBy": {"value": orderBy, "enumerable": true},
        "range": {"value": range, "enumerable": true},
        "isDistinct": {"value": isDistinct === true, "enumerable": true}
    });
    return this;
};
Select.prototype = Object.create(Node.prototype);
Select.prototype.constructor = Select;

Select.prototype.accept = function(visitor) {
    return visitor.visitSelect(this);
};

Select.prototype.isEntityQuery = function() {
    return this.select.isEntityQuery();
};
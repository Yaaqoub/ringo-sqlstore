{

    // NOTE: whenever the parser is regenerated, manually place the following
    // on top of the parser.js module:
    //
    // var ast = require("./ast");
    //
    // (see https://github.com/grob/ringo-sqlstore/commit/fc0e0bdfd245)

    var toArray = function(head, tail) {
        if (!Array.isArray(head)) {
            head = [head];
        }
        if (tail.length > 0) {
            return head.concat(tail.map(function(part) {
                return part[1];
            }));
        }
        return head;
    }

}

// START
start =
    select / expression

select =
    sc:selectClause? fc:fromClause jc:joinClause? wc:whereClause? gc:groupByClause? hc:havingClause? oc:orderByClause? rc:rangeClause? {
        if (!sc) {
            sc = new ast.SelectClause(fc.list.map(function(entity) {
                var ident = new ast.Ident(entity.alias || entity.name);
                return new ast.SelectExpression(ident, null);
            }));
        }
        return new ast.Select(sc, fc, jc || null, wc || null, gc || null, hc || null, oc || null, rc || null);
    }

selectClause =
    SELECT sm:selectModifier? head:selectExpression tail:( comma selectExpression )* {
        return new ast.SelectClause(toArray(head, tail), sm);
    }

selectModifier =
    mod:(DISTINCT / ALL) {
        return mod;
    }

selectExpression =
    expression:operand alias:alias? ws {
        return new ast.SelectExpression(expression, alias || null);
    }

selectEntity =
    entity:name dot star ws {
        return new ast.SelectEntity(entity);
    }
    / star:star {
        return new ast.SelectEntity(star);
    }


aggregation =
    type:(MAX / MIN / SUM / AVG / COUNT) LPAREN d:DISTINCT? ident:ident RPAREN {
        return new ast.Aggregation(type, ident, d);
    }

alias =
    AS? !(comma / EOF / FROM / WHERE / INNER / OUTER / LEFT / RIGHT / JOIN / ON / GROUP / HAVING / ORDER / OFFSET / LIMIT) alias:name ws {
        return alias;
    }

fromClause =
    FROM head:entity tail:( comma entity )* {
        return new ast.FromClause(toArray(head, tail));
    }

joinClause =
    joins:(innerJoin / outerJoin)+ {
        return new ast.JoinClause(joins);
    }

innerJoin =
    INNER? JOIN entity:entity predicate:joinPredicate {
        return new ast.InnerJoin(entity, predicate);
    }

outerJoin =
    side:(LEFT / RIGHT) OUTER? JOIN entity:entity predicate:joinPredicate {
        return new ast.OuterJoin(entity, predicate, side);
    }
    / OUTER JOIN entity:entity predicate:joinPredicate {
        return new ast.OuterJoin(entity, predicate, ast.OuterJoin.LEFT);
    }


joinPredicate =
    ON expr:expression {
        return expr;
    }

whereClause =
    WHERE expr:expression {
        return new ast.WhereClause(expr);
    }

groupByClause =
    GROUPBY head:ident tail:( comma ident )* {
        return new ast.GroupByClause(toArray(head, tail));
    }

havingClause =
    HAVING expr:expression {
        return new ast.HavingClause(expr);
    }

orderByClause =
    ORDERBY head:order tail:( comma order )* {
        return new ast.OrderByClause(toArray(head, tail));
    }

rangeClause =
    ov:offset lv:limit? {
        return new ast.RangeClause(ov, lv);
    }
    / lv:limit ov:offset? {
        return new ast.RangeClause(ov, lv);
    }

offset =
    OFFSET value:(digit / value_parameter) ws {
        return value;
    }

limit =
    LIMIT value:(digit / value_parameter) ws {
        return value;
    }

expression =
    and:condition_and or:( OR condition_and )* {
        if (or.length > 0) {
            or = new ast.ConditionList(or.map(function(c) {
                return c[1];
            }), "OR");
            // merge a single AND condition into the ORs
            if (and.conditions.length === 1) {
                or = new ast.ConditionList(and.conditions.concat(or.conditions), "OR");
                and = null;
            }
        } else {
            or = null;
        }
        return new ast.Expression(and, or);
    }

condition_and =
    head:condition tail:( AND condition )* {
        return new ast.ConditionList(toArray(head, tail), "AND");
    }

condition =
    NOT c:condition {
        return new ast.NotCondition(c);
    }
    / EXISTS LPAREN s:select RPAREN {
        return new ast.ExistsCondition(new ast.SubSelect(s));
    }
    / left:operand right:condition_rhs? {
        return new ast.Condition(left, right || null);
    }

operand =
    head:summand tail:( dpipe summand )* {
        if (tail.length > 0) {
            return new ast.Operand(toArray(head, tail));
        }
        return head;
    }

summand =
    left:factor right:summand_rhs? {
        if (right) {
            return new ast.Summand(left, right[0], right[1]);
        }
        return left;
    }

summand_rhs =
    oper:(PLUS / MINUS) right:factor {
        return [oper, right];
    }

factor =
    left:term right:factor_rhs? {
        if (right) {
            return new ast.Factor(left, right[0], right[1]);
        }
        return left;
    }

factor_rhs =
    oper:(MULTIPLY / DIVISION / MODULO) right:term {
        return [oper, right];
    }

term =
    LPAREN expr:expression RPAREN {
        return expr;
    }
    / select:select {
        return new ast.SubSelect(select);
    }
    / aggregation
    / selectEntity
    / value
    / ident

condition_rhs =
    IS not:NOT? NULL {
        return new ast.IsNullCondition(not !== null);
    }
    / not:NOT? BETWEEN start:term AND end:term {
        return new ast.BetweenCondition(start, end, not !== null);
    }
    / not:NOT? IN LPAREN values:( select / valueList ) RPAREN {
        return new ast.InCondition(values, not !== null);
    }
    / compare:compare rhs:compare_rhs {
        return new ast.Comparison(compare, rhs);
    }
    / not:NOT? LIKE term:term {
        return new ast.LikeCondition(term, not !== null);
    }

compare_rhs =
    range:(ALL / ANY / SOME)? LPAREN select:select RPAREN {
        return new ast.SubSelect(select, range);
    }
    / operand

valueList =
    head:expression tail:( comma expression)* {
        return toArray(head, tail);
    }

compare =
    lg / le / ge / eq / lower / greater / neq

order =
    expr:expression sort:( ASC / DESC )? nulls:nulls? {
        return new ast.OrderBy(expr, sort === -1, nulls);
    }

nulls =
    NULLS order:( FIRST / LAST ) {
        return order;
    }

entity =
    entity:name_entity alias:alias? {
        return new ast.Entity(entity, alias || null);
    }

ident =
    entity:name dot property:name_property ws {
        return new ast.Ident(entity, property);
    }
    / entity:name ws {
        return new ast.Ident(entity, null);
    }


name_entity =
    first:char_uppercase chars:name? ws {
        return first + chars
    }

name_property =
    first:char_lowercase chars:name? ws {
        return first + chars
    }

value =
    v:(value_string / value_numeric / boolean / NULL / value_parameter) ws {
        return v;
    }

value_string =
    s:( squote ( squote_escaped / [^'] )* squote
        / dquote ( dquote_escaped / [^"] )* dquote )
    {
        return new ast.StringValue(s[1].join(""));
    }

value_numeric =
    value_decimal / value_int

value_int =
    n:( ( plus / minus )? digit exponent? )
    {
        return new ast.IntValue(parseFloat(n[0] + n[1] + n[2], 10));
    }

value_decimal =
    d:( ( plus / minus )? decimal exponent? )
    {
        return new ast.DecimalValue(parseFloat(d[0] + d[1] + d[2], 10));
    }

value_parameter =
    colon name:name
    {
        return new ast.ParameterValue(name);
    }


// comparison operators
lg          = lg:"<>" ws { return lg; }
le          = le:"<=" ws { return le; }
ge          = ge:">=" ws { return ge; }
eq          = eq:"=" ws { return eq; }
lower       = l:"<" ws { return l; }
greater     = g:">" ws { return g; }
neq         = neq:"!=" ws { return neq; }

ws          = c:wsm? { return c; }
wsm         = [ \t\r\n]+ { return " "; }
escape_char = "\\"
squote      = "'"
dquote      = '"'
squote_escaped =
    s:( escape_char squote )
    { return s.join("") }
dquote_escaped =
    s:( escape_char dquote )
    { return s.join("") }
plus        = "+" ws { return "+"; }
minus       = "-" ws { return "-"; }
dot         = "."
colon       = ":"
comma       = "," ws { return ","; }
star        = "*" ws { return "*"; }
digit =
    n: [0-9]+
    { return parseInt(n.join(""), 10) }
decimal =
    f:( digit dot digit
         / dot digit )
    { return parseFloat(f.join(""), 10) }
exponent =
    e:(E ( plus / minus )? digit )
    { return e.join("") }
boolean =
    b:( TRUE / FALSE )
    {
        return new ast.BooleanValue(b);
    }

char_uppercase = [A-Z]
char_lowercase = [a-z]
name =
    str:[A-Za-z0-9_\-]+
    { return str.join("") }
dpipe = "||" ws

// terminals
E           = [Ee] { return "e"; }
TRUE        = "true"i ws { return true; }
FALSE       = "false"i ws { return false; }
NULL        = "null"i ws { return new ast.NullValue(); }
IS          = "is"i wsm { return "IS"; }
IN          = "in"i ws &LPAREN { return "IN"; }
NOT         = "not"i wsm { return "NOT"; }
LIKE        = "like"i ws { return "LIKE"; }
AND         = "and"i wsm { return "AND"; }
OR          = "or"i wsm { return "OR"; }
LPAREN      = "(" ws { return "("; }
RPAREN      = ")" ws { return ")"; }
BETWEEN     = "between"i wsm { return "BETWEEN"; }
GROUP       = "group"i wsm { return "GROUP"; }
BY          = "by"i wsm { return "BY"; }
WHERE       = "where"i wsm { return "WHERE"; }
GROUPBY     = GROUP BY { return "GROUP BY" }
ORDER       = "order"i wsm { return "ORDER"; }
ORDERBY     = ORDER BY { return "ORDER BY"; }
ASC         = "asc"i ws { return 1; }
DESC        = "desc"i ws { return -1; }
NULLS       = "nulls"i ws { return "NULLS"; }
FIRST       = "first"i ws { return -1; }
LAST        = "last"i ws { return 1; }
HAVING      = "having"i wsm { return "HAVING"; }
SELECT      = "select"i wsm { return "SELECT"; }
DISTINCT    = "distinct"i ws { return "DISTINCT"; }
FROM        = "from"i wsm { return "FROM"; }
EXISTS      = "exists"i ws &LPAREN { return "EXISTS"; }
INNER       = "inner"i wsm { return "INNER"; }
LEFT        = "left"i wsm { return "LEFT"; }
RIGHT       = "right"i wsm { return "RIGHT"; }
OUTER       = "outer"i wsm { return "OUTER"; }
JOIN        = "join"i wsm { return "JOIN"; }
ON          = "on"i wsm { return "ON"; }
MAX         = "max"i ws &LPAREN { return "MAX"; }
MIN         = "min"i ws &LPAREN { return "MIN"; }
SUM         = "sum"i ws &LPAREN { return "SUM"; }
AVG         = "avg"i ws &LPAREN { return "AVG"; }
COUNT       = "count"i ws &LPAREN { return "COUNT"; }
OFFSET      = "offset"i wsm { return "OFFSET"; }
LIMIT       = "limit"i wsm { return "LIMIT"; }
AS          = "as"i wsm { return "AS"; }
PLUS        = "+" ws { return "+"; }
MINUS       = "-" ws { return "-"; }
MULTIPLY    = "*" ws { return "*"; }
DIVISION    = "/" ws { return "/"; }
MODULO      = "%" ws { return "%"; }
ALL         = "all"i (wsm / &LPAREN) { return "ALL"; }
ANY         = "any"i ws &LPAREN { return "ANY"; }
SOME        = "some"i ws &LPAREN { return "SOME"; }
EOF         = !.
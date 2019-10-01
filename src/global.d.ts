declare module 'sqliterally' {
    class Literal {
        pieces: any[];
        values: any[];
        delimiter: string;
        text: string;
        sql: string;
        constructor(pieces?: string[], values?: any[], delimiter?: string);
        clone(): Literal;
        append(literal: string | Literal, delimiter?: string): Literal;
        prefix(string?: string): Literal;
        suffix(string?: string): Literal;
    }

    class Query {
        constructor(clauses?: any[]);

        build(delimited?: string): Literal;

        select(pieces: TemplateStringsArray, ...values: any[]): Query;
        update(pieces: TemplateStringsArray, ...values: any[]): Query;
        set(pieces: TemplateStringsArray, ...values: any[]): Query;
        from(pieces: TemplateStringsArray, ...values: any[]): Query;
        join(pieces: TemplateStringsArray, ...values: any[]): Query;
        leftJoin(pieces: TemplateStringsArray, ...values: any[]): Query;
        where(pieces: TemplateStringsArray, ...values: any[]): Query;
        orWhere(pieces: TemplateStringsArray, ...values: any[]): Query;
        having(pieces: TemplateStringsArray, ...values: any[]): Query;
        orHaving(pieces: TemplateStringsArray, ...values: any[]): Query;
        groupBy(pieces: TemplateStringsArray, ...values: any[]): Query;
        orderBy(pieces: TemplateStringsArray, ...values: any[]): Query;
        update(pieces: TemplateStringsArray, ...values: any[]): Query;
        limit(pieces: TemplateStringsArray, ...values: any[]): Query;
        returning(pieces: TemplateStringsArray, ...values: any[]): Query;
        lockInShareMode: Query;
        forUpdate: Query;
    }

    export const query: Query;

    type Sql = (pieces: TemplateStringsArray, ...values: any[]) => Literal;

    export const sql: Sql;
}

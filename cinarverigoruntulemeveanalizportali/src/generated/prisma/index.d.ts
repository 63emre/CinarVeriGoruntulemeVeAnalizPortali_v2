
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Workspace
 * 
 */
export type Workspace = $Result.DefaultSelection<Prisma.$WorkspacePayload>
/**
 * Model WorkspaceUser
 * 
 */
export type WorkspaceUser = $Result.DefaultSelection<Prisma.$WorkspaceUserPayload>
/**
 * Model DataTable
 * 
 */
export type DataTable = $Result.DefaultSelection<Prisma.$DataTablePayload>
/**
 * Model Formula
 * 
 */
export type Formula = $Result.DefaultSelection<Prisma.$FormulaPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const UserRole: {
  USER: 'USER',
  ADMIN: 'ADMIN'
};

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

}

export type UserRole = $Enums.UserRole

export const UserRole: typeof $Enums.UserRole

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.workspace`: Exposes CRUD operations for the **Workspace** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Workspaces
    * const workspaces = await prisma.workspace.findMany()
    * ```
    */
  get workspace(): Prisma.WorkspaceDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.workspaceUser`: Exposes CRUD operations for the **WorkspaceUser** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WorkspaceUsers
    * const workspaceUsers = await prisma.workspaceUser.findMany()
    * ```
    */
  get workspaceUser(): Prisma.WorkspaceUserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.dataTable`: Exposes CRUD operations for the **DataTable** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DataTables
    * const dataTables = await prisma.dataTable.findMany()
    * ```
    */
  get dataTable(): Prisma.DataTableDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.formula`: Exposes CRUD operations for the **Formula** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Formulas
    * const formulas = await prisma.formula.findMany()
    * ```
    */
  get formula(): Prisma.FormulaDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.8.2
   * Query Engine version: 2060c79ba17c6bb9f5823312b6f6b7f4a845738e
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Workspace: 'Workspace',
    WorkspaceUser: 'WorkspaceUser',
    DataTable: 'DataTable',
    Formula: 'Formula'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "workspace" | "workspaceUser" | "dataTable" | "formula"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Workspace: {
        payload: Prisma.$WorkspacePayload<ExtArgs>
        fields: Prisma.WorkspaceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WorkspaceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkspacePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WorkspaceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkspacePayload>
          }
          findFirst: {
            args: Prisma.WorkspaceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkspacePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WorkspaceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkspacePayload>
          }
          findMany: {
            args: Prisma.WorkspaceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkspacePayload>[]
          }
          create: {
            args: Prisma.WorkspaceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkspacePayload>
          }
          createMany: {
            args: Prisma.WorkspaceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WorkspaceCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkspacePayload>[]
          }
          delete: {
            args: Prisma.WorkspaceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkspacePayload>
          }
          update: {
            args: Prisma.WorkspaceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkspacePayload>
          }
          deleteMany: {
            args: Prisma.WorkspaceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WorkspaceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WorkspaceUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkspacePayload>[]
          }
          upsert: {
            args: Prisma.WorkspaceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkspacePayload>
          }
          aggregate: {
            args: Prisma.WorkspaceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWorkspace>
          }
          groupBy: {
            args: Prisma.WorkspaceGroupByArgs<ExtArgs>
            result: $Utils.Optional<WorkspaceGroupByOutputType>[]
          }
          count: {
            args: Prisma.WorkspaceCountArgs<ExtArgs>
            result: $Utils.Optional<WorkspaceCountAggregateOutputType> | number
          }
        }
      }
      WorkspaceUser: {
        payload: Prisma.$WorkspaceUserPayload<ExtArgs>
        fields: Prisma.WorkspaceUserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WorkspaceUserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkspaceUserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WorkspaceUserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkspaceUserPayload>
          }
          findFirst: {
            args: Prisma.WorkspaceUserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkspaceUserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WorkspaceUserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkspaceUserPayload>
          }
          findMany: {
            args: Prisma.WorkspaceUserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkspaceUserPayload>[]
          }
          create: {
            args: Prisma.WorkspaceUserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkspaceUserPayload>
          }
          createMany: {
            args: Prisma.WorkspaceUserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WorkspaceUserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkspaceUserPayload>[]
          }
          delete: {
            args: Prisma.WorkspaceUserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkspaceUserPayload>
          }
          update: {
            args: Prisma.WorkspaceUserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkspaceUserPayload>
          }
          deleteMany: {
            args: Prisma.WorkspaceUserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WorkspaceUserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WorkspaceUserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkspaceUserPayload>[]
          }
          upsert: {
            args: Prisma.WorkspaceUserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkspaceUserPayload>
          }
          aggregate: {
            args: Prisma.WorkspaceUserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWorkspaceUser>
          }
          groupBy: {
            args: Prisma.WorkspaceUserGroupByArgs<ExtArgs>
            result: $Utils.Optional<WorkspaceUserGroupByOutputType>[]
          }
          count: {
            args: Prisma.WorkspaceUserCountArgs<ExtArgs>
            result: $Utils.Optional<WorkspaceUserCountAggregateOutputType> | number
          }
        }
      }
      DataTable: {
        payload: Prisma.$DataTablePayload<ExtArgs>
        fields: Prisma.DataTableFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DataTableFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataTablePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DataTableFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataTablePayload>
          }
          findFirst: {
            args: Prisma.DataTableFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataTablePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DataTableFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataTablePayload>
          }
          findMany: {
            args: Prisma.DataTableFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataTablePayload>[]
          }
          create: {
            args: Prisma.DataTableCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataTablePayload>
          }
          createMany: {
            args: Prisma.DataTableCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DataTableCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataTablePayload>[]
          }
          delete: {
            args: Prisma.DataTableDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataTablePayload>
          }
          update: {
            args: Prisma.DataTableUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataTablePayload>
          }
          deleteMany: {
            args: Prisma.DataTableDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DataTableUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DataTableUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataTablePayload>[]
          }
          upsert: {
            args: Prisma.DataTableUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataTablePayload>
          }
          aggregate: {
            args: Prisma.DataTableAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDataTable>
          }
          groupBy: {
            args: Prisma.DataTableGroupByArgs<ExtArgs>
            result: $Utils.Optional<DataTableGroupByOutputType>[]
          }
          count: {
            args: Prisma.DataTableCountArgs<ExtArgs>
            result: $Utils.Optional<DataTableCountAggregateOutputType> | number
          }
        }
      }
      Formula: {
        payload: Prisma.$FormulaPayload<ExtArgs>
        fields: Prisma.FormulaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FormulaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormulaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FormulaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormulaPayload>
          }
          findFirst: {
            args: Prisma.FormulaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormulaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FormulaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormulaPayload>
          }
          findMany: {
            args: Prisma.FormulaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormulaPayload>[]
          }
          create: {
            args: Prisma.FormulaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormulaPayload>
          }
          createMany: {
            args: Prisma.FormulaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FormulaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormulaPayload>[]
          }
          delete: {
            args: Prisma.FormulaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormulaPayload>
          }
          update: {
            args: Prisma.FormulaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormulaPayload>
          }
          deleteMany: {
            args: Prisma.FormulaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FormulaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.FormulaUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormulaPayload>[]
          }
          upsert: {
            args: Prisma.FormulaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FormulaPayload>
          }
          aggregate: {
            args: Prisma.FormulaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFormula>
          }
          groupBy: {
            args: Prisma.FormulaGroupByArgs<ExtArgs>
            result: $Utils.Optional<FormulaGroupByOutputType>[]
          }
          count: {
            args: Prisma.FormulaCountArgs<ExtArgs>
            result: $Utils.Optional<FormulaCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    workspace?: WorkspaceOmit
    workspaceUser?: WorkspaceUserOmit
    dataTable?: DataTableOmit
    formula?: FormulaOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    workspaces: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    workspaces?: boolean | UserCountOutputTypeCountWorkspacesArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountWorkspacesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WorkspaceUserWhereInput
  }


  /**
   * Count Type WorkspaceCountOutputType
   */

  export type WorkspaceCountOutputType = {
    users: number
    tables: number
    formulas: number
  }

  export type WorkspaceCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | WorkspaceCountOutputTypeCountUsersArgs
    tables?: boolean | WorkspaceCountOutputTypeCountTablesArgs
    formulas?: boolean | WorkspaceCountOutputTypeCountFormulasArgs
  }

  // Custom InputTypes
  /**
   * WorkspaceCountOutputType without action
   */
  export type WorkspaceCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkspaceCountOutputType
     */
    select?: WorkspaceCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * WorkspaceCountOutputType without action
   */
  export type WorkspaceCountOutputTypeCountUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WorkspaceUserWhereInput
  }

  /**
   * WorkspaceCountOutputType without action
   */
  export type WorkspaceCountOutputTypeCountTablesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DataTableWhereInput
  }

  /**
   * WorkspaceCountOutputType without action
   */
  export type WorkspaceCountOutputTypeCountFormulasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FormulaWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    password: string | null
    role: $Enums.UserRole | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    password: string | null
    role: $Enums.UserRole | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    name: number
    password: number
    role: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    name?: true
    password?: true
    role?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    name?: true
    password?: true
    role?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    name?: true
    password?: true
    role?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    name: string | null
    password: string
    role: $Enums.UserRole
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    workspaces?: boolean | User$workspacesArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "name" | "password" | "role" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    workspaces?: boolean | User$workspacesArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      workspaces: Prisma.$WorkspaceUserPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      name: string | null
      password: string
      role: $Enums.UserRole
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    workspaces<T extends User$workspacesArgs<ExtArgs> = {}>(args?: Subset<T, User$workspacesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkspaceUserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'UserRole'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.workspaces
   */
  export type User$workspacesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkspaceUser
     */
    select?: WorkspaceUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkspaceUser
     */
    omit?: WorkspaceUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceUserInclude<ExtArgs> | null
    where?: WorkspaceUserWhereInput
    orderBy?: WorkspaceUserOrderByWithRelationInput | WorkspaceUserOrderByWithRelationInput[]
    cursor?: WorkspaceUserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: WorkspaceUserScalarFieldEnum | WorkspaceUserScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Workspace
   */

  export type AggregateWorkspace = {
    _count: WorkspaceCountAggregateOutputType | null
    _min: WorkspaceMinAggregateOutputType | null
    _max: WorkspaceMaxAggregateOutputType | null
  }

  export type WorkspaceMinAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    createdAt: Date | null
    updatedAt: Date | null
    createdBy: string | null
  }

  export type WorkspaceMaxAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    createdAt: Date | null
    updatedAt: Date | null
    createdBy: string | null
  }

  export type WorkspaceCountAggregateOutputType = {
    id: number
    name: number
    description: number
    createdAt: number
    updatedAt: number
    createdBy: number
    _all: number
  }


  export type WorkspaceMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    createdAt?: true
    updatedAt?: true
    createdBy?: true
  }

  export type WorkspaceMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    createdAt?: true
    updatedAt?: true
    createdBy?: true
  }

  export type WorkspaceCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    createdAt?: true
    updatedAt?: true
    createdBy?: true
    _all?: true
  }

  export type WorkspaceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Workspace to aggregate.
     */
    where?: WorkspaceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Workspaces to fetch.
     */
    orderBy?: WorkspaceOrderByWithRelationInput | WorkspaceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WorkspaceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Workspaces from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Workspaces.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Workspaces
    **/
    _count?: true | WorkspaceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WorkspaceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WorkspaceMaxAggregateInputType
  }

  export type GetWorkspaceAggregateType<T extends WorkspaceAggregateArgs> = {
        [P in keyof T & keyof AggregateWorkspace]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWorkspace[P]>
      : GetScalarType<T[P], AggregateWorkspace[P]>
  }




  export type WorkspaceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WorkspaceWhereInput
    orderBy?: WorkspaceOrderByWithAggregationInput | WorkspaceOrderByWithAggregationInput[]
    by: WorkspaceScalarFieldEnum[] | WorkspaceScalarFieldEnum
    having?: WorkspaceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WorkspaceCountAggregateInputType | true
    _min?: WorkspaceMinAggregateInputType
    _max?: WorkspaceMaxAggregateInputType
  }

  export type WorkspaceGroupByOutputType = {
    id: string
    name: string
    description: string | null
    createdAt: Date
    updatedAt: Date
    createdBy: string
    _count: WorkspaceCountAggregateOutputType | null
    _min: WorkspaceMinAggregateOutputType | null
    _max: WorkspaceMaxAggregateOutputType | null
  }

  type GetWorkspaceGroupByPayload<T extends WorkspaceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WorkspaceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WorkspaceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WorkspaceGroupByOutputType[P]>
            : GetScalarType<T[P], WorkspaceGroupByOutputType[P]>
        }
      >
    >


  export type WorkspaceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
    users?: boolean | Workspace$usersArgs<ExtArgs>
    tables?: boolean | Workspace$tablesArgs<ExtArgs>
    formulas?: boolean | Workspace$formulasArgs<ExtArgs>
    _count?: boolean | WorkspaceCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["workspace"]>

  export type WorkspaceSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
  }, ExtArgs["result"]["workspace"]>

  export type WorkspaceSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
  }, ExtArgs["result"]["workspace"]>

  export type WorkspaceSelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
  }

  export type WorkspaceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "description" | "createdAt" | "updatedAt" | "createdBy", ExtArgs["result"]["workspace"]>
  export type WorkspaceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | Workspace$usersArgs<ExtArgs>
    tables?: boolean | Workspace$tablesArgs<ExtArgs>
    formulas?: boolean | Workspace$formulasArgs<ExtArgs>
    _count?: boolean | WorkspaceCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type WorkspaceIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type WorkspaceIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $WorkspacePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Workspace"
    objects: {
      users: Prisma.$WorkspaceUserPayload<ExtArgs>[]
      tables: Prisma.$DataTablePayload<ExtArgs>[]
      formulas: Prisma.$FormulaPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      description: string | null
      createdAt: Date
      updatedAt: Date
      createdBy: string
    }, ExtArgs["result"]["workspace"]>
    composites: {}
  }

  type WorkspaceGetPayload<S extends boolean | null | undefined | WorkspaceDefaultArgs> = $Result.GetResult<Prisma.$WorkspacePayload, S>

  type WorkspaceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WorkspaceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WorkspaceCountAggregateInputType | true
    }

  export interface WorkspaceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Workspace'], meta: { name: 'Workspace' } }
    /**
     * Find zero or one Workspace that matches the filter.
     * @param {WorkspaceFindUniqueArgs} args - Arguments to find a Workspace
     * @example
     * // Get one Workspace
     * const workspace = await prisma.workspace.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WorkspaceFindUniqueArgs>(args: SelectSubset<T, WorkspaceFindUniqueArgs<ExtArgs>>): Prisma__WorkspaceClient<$Result.GetResult<Prisma.$WorkspacePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Workspace that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WorkspaceFindUniqueOrThrowArgs} args - Arguments to find a Workspace
     * @example
     * // Get one Workspace
     * const workspace = await prisma.workspace.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WorkspaceFindUniqueOrThrowArgs>(args: SelectSubset<T, WorkspaceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WorkspaceClient<$Result.GetResult<Prisma.$WorkspacePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Workspace that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkspaceFindFirstArgs} args - Arguments to find a Workspace
     * @example
     * // Get one Workspace
     * const workspace = await prisma.workspace.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WorkspaceFindFirstArgs>(args?: SelectSubset<T, WorkspaceFindFirstArgs<ExtArgs>>): Prisma__WorkspaceClient<$Result.GetResult<Prisma.$WorkspacePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Workspace that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkspaceFindFirstOrThrowArgs} args - Arguments to find a Workspace
     * @example
     * // Get one Workspace
     * const workspace = await prisma.workspace.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WorkspaceFindFirstOrThrowArgs>(args?: SelectSubset<T, WorkspaceFindFirstOrThrowArgs<ExtArgs>>): Prisma__WorkspaceClient<$Result.GetResult<Prisma.$WorkspacePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Workspaces that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkspaceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Workspaces
     * const workspaces = await prisma.workspace.findMany()
     * 
     * // Get first 10 Workspaces
     * const workspaces = await prisma.workspace.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const workspaceWithIdOnly = await prisma.workspace.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WorkspaceFindManyArgs>(args?: SelectSubset<T, WorkspaceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkspacePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Workspace.
     * @param {WorkspaceCreateArgs} args - Arguments to create a Workspace.
     * @example
     * // Create one Workspace
     * const Workspace = await prisma.workspace.create({
     *   data: {
     *     // ... data to create a Workspace
     *   }
     * })
     * 
     */
    create<T extends WorkspaceCreateArgs>(args: SelectSubset<T, WorkspaceCreateArgs<ExtArgs>>): Prisma__WorkspaceClient<$Result.GetResult<Prisma.$WorkspacePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Workspaces.
     * @param {WorkspaceCreateManyArgs} args - Arguments to create many Workspaces.
     * @example
     * // Create many Workspaces
     * const workspace = await prisma.workspace.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WorkspaceCreateManyArgs>(args?: SelectSubset<T, WorkspaceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Workspaces and returns the data saved in the database.
     * @param {WorkspaceCreateManyAndReturnArgs} args - Arguments to create many Workspaces.
     * @example
     * // Create many Workspaces
     * const workspace = await prisma.workspace.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Workspaces and only return the `id`
     * const workspaceWithIdOnly = await prisma.workspace.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WorkspaceCreateManyAndReturnArgs>(args?: SelectSubset<T, WorkspaceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkspacePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Workspace.
     * @param {WorkspaceDeleteArgs} args - Arguments to delete one Workspace.
     * @example
     * // Delete one Workspace
     * const Workspace = await prisma.workspace.delete({
     *   where: {
     *     // ... filter to delete one Workspace
     *   }
     * })
     * 
     */
    delete<T extends WorkspaceDeleteArgs>(args: SelectSubset<T, WorkspaceDeleteArgs<ExtArgs>>): Prisma__WorkspaceClient<$Result.GetResult<Prisma.$WorkspacePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Workspace.
     * @param {WorkspaceUpdateArgs} args - Arguments to update one Workspace.
     * @example
     * // Update one Workspace
     * const workspace = await prisma.workspace.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WorkspaceUpdateArgs>(args: SelectSubset<T, WorkspaceUpdateArgs<ExtArgs>>): Prisma__WorkspaceClient<$Result.GetResult<Prisma.$WorkspacePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Workspaces.
     * @param {WorkspaceDeleteManyArgs} args - Arguments to filter Workspaces to delete.
     * @example
     * // Delete a few Workspaces
     * const { count } = await prisma.workspace.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WorkspaceDeleteManyArgs>(args?: SelectSubset<T, WorkspaceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Workspaces.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkspaceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Workspaces
     * const workspace = await prisma.workspace.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WorkspaceUpdateManyArgs>(args: SelectSubset<T, WorkspaceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Workspaces and returns the data updated in the database.
     * @param {WorkspaceUpdateManyAndReturnArgs} args - Arguments to update many Workspaces.
     * @example
     * // Update many Workspaces
     * const workspace = await prisma.workspace.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Workspaces and only return the `id`
     * const workspaceWithIdOnly = await prisma.workspace.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends WorkspaceUpdateManyAndReturnArgs>(args: SelectSubset<T, WorkspaceUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkspacePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Workspace.
     * @param {WorkspaceUpsertArgs} args - Arguments to update or create a Workspace.
     * @example
     * // Update or create a Workspace
     * const workspace = await prisma.workspace.upsert({
     *   create: {
     *     // ... data to create a Workspace
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Workspace we want to update
     *   }
     * })
     */
    upsert<T extends WorkspaceUpsertArgs>(args: SelectSubset<T, WorkspaceUpsertArgs<ExtArgs>>): Prisma__WorkspaceClient<$Result.GetResult<Prisma.$WorkspacePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Workspaces.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkspaceCountArgs} args - Arguments to filter Workspaces to count.
     * @example
     * // Count the number of Workspaces
     * const count = await prisma.workspace.count({
     *   where: {
     *     // ... the filter for the Workspaces we want to count
     *   }
     * })
    **/
    count<T extends WorkspaceCountArgs>(
      args?: Subset<T, WorkspaceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WorkspaceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Workspace.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkspaceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends WorkspaceAggregateArgs>(args: Subset<T, WorkspaceAggregateArgs>): Prisma.PrismaPromise<GetWorkspaceAggregateType<T>>

    /**
     * Group by Workspace.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkspaceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends WorkspaceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WorkspaceGroupByArgs['orderBy'] }
        : { orderBy?: WorkspaceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WorkspaceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWorkspaceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Workspace model
   */
  readonly fields: WorkspaceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Workspace.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WorkspaceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    users<T extends Workspace$usersArgs<ExtArgs> = {}>(args?: Subset<T, Workspace$usersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkspaceUserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    tables<T extends Workspace$tablesArgs<ExtArgs> = {}>(args?: Subset<T, Workspace$tablesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DataTablePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    formulas<T extends Workspace$formulasArgs<ExtArgs> = {}>(args?: Subset<T, Workspace$formulasArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FormulaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Workspace model
   */
  interface WorkspaceFieldRefs {
    readonly id: FieldRef<"Workspace", 'String'>
    readonly name: FieldRef<"Workspace", 'String'>
    readonly description: FieldRef<"Workspace", 'String'>
    readonly createdAt: FieldRef<"Workspace", 'DateTime'>
    readonly updatedAt: FieldRef<"Workspace", 'DateTime'>
    readonly createdBy: FieldRef<"Workspace", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Workspace findUnique
   */
  export type WorkspaceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Workspace
     */
    select?: WorkspaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Workspace
     */
    omit?: WorkspaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceInclude<ExtArgs> | null
    /**
     * Filter, which Workspace to fetch.
     */
    where: WorkspaceWhereUniqueInput
  }

  /**
   * Workspace findUniqueOrThrow
   */
  export type WorkspaceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Workspace
     */
    select?: WorkspaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Workspace
     */
    omit?: WorkspaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceInclude<ExtArgs> | null
    /**
     * Filter, which Workspace to fetch.
     */
    where: WorkspaceWhereUniqueInput
  }

  /**
   * Workspace findFirst
   */
  export type WorkspaceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Workspace
     */
    select?: WorkspaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Workspace
     */
    omit?: WorkspaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceInclude<ExtArgs> | null
    /**
     * Filter, which Workspace to fetch.
     */
    where?: WorkspaceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Workspaces to fetch.
     */
    orderBy?: WorkspaceOrderByWithRelationInput | WorkspaceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Workspaces.
     */
    cursor?: WorkspaceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Workspaces from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Workspaces.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Workspaces.
     */
    distinct?: WorkspaceScalarFieldEnum | WorkspaceScalarFieldEnum[]
  }

  /**
   * Workspace findFirstOrThrow
   */
  export type WorkspaceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Workspace
     */
    select?: WorkspaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Workspace
     */
    omit?: WorkspaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceInclude<ExtArgs> | null
    /**
     * Filter, which Workspace to fetch.
     */
    where?: WorkspaceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Workspaces to fetch.
     */
    orderBy?: WorkspaceOrderByWithRelationInput | WorkspaceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Workspaces.
     */
    cursor?: WorkspaceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Workspaces from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Workspaces.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Workspaces.
     */
    distinct?: WorkspaceScalarFieldEnum | WorkspaceScalarFieldEnum[]
  }

  /**
   * Workspace findMany
   */
  export type WorkspaceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Workspace
     */
    select?: WorkspaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Workspace
     */
    omit?: WorkspaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceInclude<ExtArgs> | null
    /**
     * Filter, which Workspaces to fetch.
     */
    where?: WorkspaceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Workspaces to fetch.
     */
    orderBy?: WorkspaceOrderByWithRelationInput | WorkspaceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Workspaces.
     */
    cursor?: WorkspaceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Workspaces from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Workspaces.
     */
    skip?: number
    distinct?: WorkspaceScalarFieldEnum | WorkspaceScalarFieldEnum[]
  }

  /**
   * Workspace create
   */
  export type WorkspaceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Workspace
     */
    select?: WorkspaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Workspace
     */
    omit?: WorkspaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceInclude<ExtArgs> | null
    /**
     * The data needed to create a Workspace.
     */
    data: XOR<WorkspaceCreateInput, WorkspaceUncheckedCreateInput>
  }

  /**
   * Workspace createMany
   */
  export type WorkspaceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Workspaces.
     */
    data: WorkspaceCreateManyInput | WorkspaceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Workspace createManyAndReturn
   */
  export type WorkspaceCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Workspace
     */
    select?: WorkspaceSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Workspace
     */
    omit?: WorkspaceOmit<ExtArgs> | null
    /**
     * The data used to create many Workspaces.
     */
    data: WorkspaceCreateManyInput | WorkspaceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Workspace update
   */
  export type WorkspaceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Workspace
     */
    select?: WorkspaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Workspace
     */
    omit?: WorkspaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceInclude<ExtArgs> | null
    /**
     * The data needed to update a Workspace.
     */
    data: XOR<WorkspaceUpdateInput, WorkspaceUncheckedUpdateInput>
    /**
     * Choose, which Workspace to update.
     */
    where: WorkspaceWhereUniqueInput
  }

  /**
   * Workspace updateMany
   */
  export type WorkspaceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Workspaces.
     */
    data: XOR<WorkspaceUpdateManyMutationInput, WorkspaceUncheckedUpdateManyInput>
    /**
     * Filter which Workspaces to update
     */
    where?: WorkspaceWhereInput
    /**
     * Limit how many Workspaces to update.
     */
    limit?: number
  }

  /**
   * Workspace updateManyAndReturn
   */
  export type WorkspaceUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Workspace
     */
    select?: WorkspaceSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Workspace
     */
    omit?: WorkspaceOmit<ExtArgs> | null
    /**
     * The data used to update Workspaces.
     */
    data: XOR<WorkspaceUpdateManyMutationInput, WorkspaceUncheckedUpdateManyInput>
    /**
     * Filter which Workspaces to update
     */
    where?: WorkspaceWhereInput
    /**
     * Limit how many Workspaces to update.
     */
    limit?: number
  }

  /**
   * Workspace upsert
   */
  export type WorkspaceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Workspace
     */
    select?: WorkspaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Workspace
     */
    omit?: WorkspaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceInclude<ExtArgs> | null
    /**
     * The filter to search for the Workspace to update in case it exists.
     */
    where: WorkspaceWhereUniqueInput
    /**
     * In case the Workspace found by the `where` argument doesn't exist, create a new Workspace with this data.
     */
    create: XOR<WorkspaceCreateInput, WorkspaceUncheckedCreateInput>
    /**
     * In case the Workspace was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WorkspaceUpdateInput, WorkspaceUncheckedUpdateInput>
  }

  /**
   * Workspace delete
   */
  export type WorkspaceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Workspace
     */
    select?: WorkspaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Workspace
     */
    omit?: WorkspaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceInclude<ExtArgs> | null
    /**
     * Filter which Workspace to delete.
     */
    where: WorkspaceWhereUniqueInput
  }

  /**
   * Workspace deleteMany
   */
  export type WorkspaceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Workspaces to delete
     */
    where?: WorkspaceWhereInput
    /**
     * Limit how many Workspaces to delete.
     */
    limit?: number
  }

  /**
   * Workspace.users
   */
  export type Workspace$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkspaceUser
     */
    select?: WorkspaceUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkspaceUser
     */
    omit?: WorkspaceUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceUserInclude<ExtArgs> | null
    where?: WorkspaceUserWhereInput
    orderBy?: WorkspaceUserOrderByWithRelationInput | WorkspaceUserOrderByWithRelationInput[]
    cursor?: WorkspaceUserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: WorkspaceUserScalarFieldEnum | WorkspaceUserScalarFieldEnum[]
  }

  /**
   * Workspace.tables
   */
  export type Workspace$tablesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataTable
     */
    select?: DataTableSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataTable
     */
    omit?: DataTableOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DataTableInclude<ExtArgs> | null
    where?: DataTableWhereInput
    orderBy?: DataTableOrderByWithRelationInput | DataTableOrderByWithRelationInput[]
    cursor?: DataTableWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DataTableScalarFieldEnum | DataTableScalarFieldEnum[]
  }

  /**
   * Workspace.formulas
   */
  export type Workspace$formulasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formula
     */
    select?: FormulaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Formula
     */
    omit?: FormulaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaInclude<ExtArgs> | null
    where?: FormulaWhereInput
    orderBy?: FormulaOrderByWithRelationInput | FormulaOrderByWithRelationInput[]
    cursor?: FormulaWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FormulaScalarFieldEnum | FormulaScalarFieldEnum[]
  }

  /**
   * Workspace without action
   */
  export type WorkspaceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Workspace
     */
    select?: WorkspaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Workspace
     */
    omit?: WorkspaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceInclude<ExtArgs> | null
  }


  /**
   * Model WorkspaceUser
   */

  export type AggregateWorkspaceUser = {
    _count: WorkspaceUserCountAggregateOutputType | null
    _min: WorkspaceUserMinAggregateOutputType | null
    _max: WorkspaceUserMaxAggregateOutputType | null
  }

  export type WorkspaceUserMinAggregateOutputType = {
    id: string | null
    userId: string | null
    workspaceId: string | null
    addedAt: Date | null
  }

  export type WorkspaceUserMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    workspaceId: string | null
    addedAt: Date | null
  }

  export type WorkspaceUserCountAggregateOutputType = {
    id: number
    userId: number
    workspaceId: number
    addedAt: number
    _all: number
  }


  export type WorkspaceUserMinAggregateInputType = {
    id?: true
    userId?: true
    workspaceId?: true
    addedAt?: true
  }

  export type WorkspaceUserMaxAggregateInputType = {
    id?: true
    userId?: true
    workspaceId?: true
    addedAt?: true
  }

  export type WorkspaceUserCountAggregateInputType = {
    id?: true
    userId?: true
    workspaceId?: true
    addedAt?: true
    _all?: true
  }

  export type WorkspaceUserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WorkspaceUser to aggregate.
     */
    where?: WorkspaceUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkspaceUsers to fetch.
     */
    orderBy?: WorkspaceUserOrderByWithRelationInput | WorkspaceUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WorkspaceUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkspaceUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkspaceUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WorkspaceUsers
    **/
    _count?: true | WorkspaceUserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WorkspaceUserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WorkspaceUserMaxAggregateInputType
  }

  export type GetWorkspaceUserAggregateType<T extends WorkspaceUserAggregateArgs> = {
        [P in keyof T & keyof AggregateWorkspaceUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWorkspaceUser[P]>
      : GetScalarType<T[P], AggregateWorkspaceUser[P]>
  }




  export type WorkspaceUserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WorkspaceUserWhereInput
    orderBy?: WorkspaceUserOrderByWithAggregationInput | WorkspaceUserOrderByWithAggregationInput[]
    by: WorkspaceUserScalarFieldEnum[] | WorkspaceUserScalarFieldEnum
    having?: WorkspaceUserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WorkspaceUserCountAggregateInputType | true
    _min?: WorkspaceUserMinAggregateInputType
    _max?: WorkspaceUserMaxAggregateInputType
  }

  export type WorkspaceUserGroupByOutputType = {
    id: string
    userId: string
    workspaceId: string
    addedAt: Date
    _count: WorkspaceUserCountAggregateOutputType | null
    _min: WorkspaceUserMinAggregateOutputType | null
    _max: WorkspaceUserMaxAggregateOutputType | null
  }

  type GetWorkspaceUserGroupByPayload<T extends WorkspaceUserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WorkspaceUserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WorkspaceUserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WorkspaceUserGroupByOutputType[P]>
            : GetScalarType<T[P], WorkspaceUserGroupByOutputType[P]>
        }
      >
    >


  export type WorkspaceUserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    workspaceId?: boolean
    addedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    workspace?: boolean | WorkspaceDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["workspaceUser"]>

  export type WorkspaceUserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    workspaceId?: boolean
    addedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    workspace?: boolean | WorkspaceDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["workspaceUser"]>

  export type WorkspaceUserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    workspaceId?: boolean
    addedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    workspace?: boolean | WorkspaceDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["workspaceUser"]>

  export type WorkspaceUserSelectScalar = {
    id?: boolean
    userId?: boolean
    workspaceId?: boolean
    addedAt?: boolean
  }

  export type WorkspaceUserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "workspaceId" | "addedAt", ExtArgs["result"]["workspaceUser"]>
  export type WorkspaceUserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    workspace?: boolean | WorkspaceDefaultArgs<ExtArgs>
  }
  export type WorkspaceUserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    workspace?: boolean | WorkspaceDefaultArgs<ExtArgs>
  }
  export type WorkspaceUserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    workspace?: boolean | WorkspaceDefaultArgs<ExtArgs>
  }

  export type $WorkspaceUserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WorkspaceUser"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      workspace: Prisma.$WorkspacePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      workspaceId: string
      addedAt: Date
    }, ExtArgs["result"]["workspaceUser"]>
    composites: {}
  }

  type WorkspaceUserGetPayload<S extends boolean | null | undefined | WorkspaceUserDefaultArgs> = $Result.GetResult<Prisma.$WorkspaceUserPayload, S>

  type WorkspaceUserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WorkspaceUserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WorkspaceUserCountAggregateInputType | true
    }

  export interface WorkspaceUserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WorkspaceUser'], meta: { name: 'WorkspaceUser' } }
    /**
     * Find zero or one WorkspaceUser that matches the filter.
     * @param {WorkspaceUserFindUniqueArgs} args - Arguments to find a WorkspaceUser
     * @example
     * // Get one WorkspaceUser
     * const workspaceUser = await prisma.workspaceUser.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WorkspaceUserFindUniqueArgs>(args: SelectSubset<T, WorkspaceUserFindUniqueArgs<ExtArgs>>): Prisma__WorkspaceUserClient<$Result.GetResult<Prisma.$WorkspaceUserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one WorkspaceUser that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WorkspaceUserFindUniqueOrThrowArgs} args - Arguments to find a WorkspaceUser
     * @example
     * // Get one WorkspaceUser
     * const workspaceUser = await prisma.workspaceUser.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WorkspaceUserFindUniqueOrThrowArgs>(args: SelectSubset<T, WorkspaceUserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WorkspaceUserClient<$Result.GetResult<Prisma.$WorkspaceUserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WorkspaceUser that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkspaceUserFindFirstArgs} args - Arguments to find a WorkspaceUser
     * @example
     * // Get one WorkspaceUser
     * const workspaceUser = await prisma.workspaceUser.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WorkspaceUserFindFirstArgs>(args?: SelectSubset<T, WorkspaceUserFindFirstArgs<ExtArgs>>): Prisma__WorkspaceUserClient<$Result.GetResult<Prisma.$WorkspaceUserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WorkspaceUser that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkspaceUserFindFirstOrThrowArgs} args - Arguments to find a WorkspaceUser
     * @example
     * // Get one WorkspaceUser
     * const workspaceUser = await prisma.workspaceUser.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WorkspaceUserFindFirstOrThrowArgs>(args?: SelectSubset<T, WorkspaceUserFindFirstOrThrowArgs<ExtArgs>>): Prisma__WorkspaceUserClient<$Result.GetResult<Prisma.$WorkspaceUserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more WorkspaceUsers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkspaceUserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WorkspaceUsers
     * const workspaceUsers = await prisma.workspaceUser.findMany()
     * 
     * // Get first 10 WorkspaceUsers
     * const workspaceUsers = await prisma.workspaceUser.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const workspaceUserWithIdOnly = await prisma.workspaceUser.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WorkspaceUserFindManyArgs>(args?: SelectSubset<T, WorkspaceUserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkspaceUserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a WorkspaceUser.
     * @param {WorkspaceUserCreateArgs} args - Arguments to create a WorkspaceUser.
     * @example
     * // Create one WorkspaceUser
     * const WorkspaceUser = await prisma.workspaceUser.create({
     *   data: {
     *     // ... data to create a WorkspaceUser
     *   }
     * })
     * 
     */
    create<T extends WorkspaceUserCreateArgs>(args: SelectSubset<T, WorkspaceUserCreateArgs<ExtArgs>>): Prisma__WorkspaceUserClient<$Result.GetResult<Prisma.$WorkspaceUserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many WorkspaceUsers.
     * @param {WorkspaceUserCreateManyArgs} args - Arguments to create many WorkspaceUsers.
     * @example
     * // Create many WorkspaceUsers
     * const workspaceUser = await prisma.workspaceUser.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WorkspaceUserCreateManyArgs>(args?: SelectSubset<T, WorkspaceUserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WorkspaceUsers and returns the data saved in the database.
     * @param {WorkspaceUserCreateManyAndReturnArgs} args - Arguments to create many WorkspaceUsers.
     * @example
     * // Create many WorkspaceUsers
     * const workspaceUser = await prisma.workspaceUser.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WorkspaceUsers and only return the `id`
     * const workspaceUserWithIdOnly = await prisma.workspaceUser.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WorkspaceUserCreateManyAndReturnArgs>(args?: SelectSubset<T, WorkspaceUserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkspaceUserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a WorkspaceUser.
     * @param {WorkspaceUserDeleteArgs} args - Arguments to delete one WorkspaceUser.
     * @example
     * // Delete one WorkspaceUser
     * const WorkspaceUser = await prisma.workspaceUser.delete({
     *   where: {
     *     // ... filter to delete one WorkspaceUser
     *   }
     * })
     * 
     */
    delete<T extends WorkspaceUserDeleteArgs>(args: SelectSubset<T, WorkspaceUserDeleteArgs<ExtArgs>>): Prisma__WorkspaceUserClient<$Result.GetResult<Prisma.$WorkspaceUserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one WorkspaceUser.
     * @param {WorkspaceUserUpdateArgs} args - Arguments to update one WorkspaceUser.
     * @example
     * // Update one WorkspaceUser
     * const workspaceUser = await prisma.workspaceUser.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WorkspaceUserUpdateArgs>(args: SelectSubset<T, WorkspaceUserUpdateArgs<ExtArgs>>): Prisma__WorkspaceUserClient<$Result.GetResult<Prisma.$WorkspaceUserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more WorkspaceUsers.
     * @param {WorkspaceUserDeleteManyArgs} args - Arguments to filter WorkspaceUsers to delete.
     * @example
     * // Delete a few WorkspaceUsers
     * const { count } = await prisma.workspaceUser.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WorkspaceUserDeleteManyArgs>(args?: SelectSubset<T, WorkspaceUserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WorkspaceUsers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkspaceUserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WorkspaceUsers
     * const workspaceUser = await prisma.workspaceUser.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WorkspaceUserUpdateManyArgs>(args: SelectSubset<T, WorkspaceUserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WorkspaceUsers and returns the data updated in the database.
     * @param {WorkspaceUserUpdateManyAndReturnArgs} args - Arguments to update many WorkspaceUsers.
     * @example
     * // Update many WorkspaceUsers
     * const workspaceUser = await prisma.workspaceUser.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more WorkspaceUsers and only return the `id`
     * const workspaceUserWithIdOnly = await prisma.workspaceUser.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends WorkspaceUserUpdateManyAndReturnArgs>(args: SelectSubset<T, WorkspaceUserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkspaceUserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one WorkspaceUser.
     * @param {WorkspaceUserUpsertArgs} args - Arguments to update or create a WorkspaceUser.
     * @example
     * // Update or create a WorkspaceUser
     * const workspaceUser = await prisma.workspaceUser.upsert({
     *   create: {
     *     // ... data to create a WorkspaceUser
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WorkspaceUser we want to update
     *   }
     * })
     */
    upsert<T extends WorkspaceUserUpsertArgs>(args: SelectSubset<T, WorkspaceUserUpsertArgs<ExtArgs>>): Prisma__WorkspaceUserClient<$Result.GetResult<Prisma.$WorkspaceUserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of WorkspaceUsers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkspaceUserCountArgs} args - Arguments to filter WorkspaceUsers to count.
     * @example
     * // Count the number of WorkspaceUsers
     * const count = await prisma.workspaceUser.count({
     *   where: {
     *     // ... the filter for the WorkspaceUsers we want to count
     *   }
     * })
    **/
    count<T extends WorkspaceUserCountArgs>(
      args?: Subset<T, WorkspaceUserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WorkspaceUserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WorkspaceUser.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkspaceUserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends WorkspaceUserAggregateArgs>(args: Subset<T, WorkspaceUserAggregateArgs>): Prisma.PrismaPromise<GetWorkspaceUserAggregateType<T>>

    /**
     * Group by WorkspaceUser.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkspaceUserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends WorkspaceUserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WorkspaceUserGroupByArgs['orderBy'] }
        : { orderBy?: WorkspaceUserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WorkspaceUserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWorkspaceUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WorkspaceUser model
   */
  readonly fields: WorkspaceUserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WorkspaceUser.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WorkspaceUserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    workspace<T extends WorkspaceDefaultArgs<ExtArgs> = {}>(args?: Subset<T, WorkspaceDefaultArgs<ExtArgs>>): Prisma__WorkspaceClient<$Result.GetResult<Prisma.$WorkspacePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the WorkspaceUser model
   */
  interface WorkspaceUserFieldRefs {
    readonly id: FieldRef<"WorkspaceUser", 'String'>
    readonly userId: FieldRef<"WorkspaceUser", 'String'>
    readonly workspaceId: FieldRef<"WorkspaceUser", 'String'>
    readonly addedAt: FieldRef<"WorkspaceUser", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * WorkspaceUser findUnique
   */
  export type WorkspaceUserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkspaceUser
     */
    select?: WorkspaceUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkspaceUser
     */
    omit?: WorkspaceUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceUserInclude<ExtArgs> | null
    /**
     * Filter, which WorkspaceUser to fetch.
     */
    where: WorkspaceUserWhereUniqueInput
  }

  /**
   * WorkspaceUser findUniqueOrThrow
   */
  export type WorkspaceUserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkspaceUser
     */
    select?: WorkspaceUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkspaceUser
     */
    omit?: WorkspaceUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceUserInclude<ExtArgs> | null
    /**
     * Filter, which WorkspaceUser to fetch.
     */
    where: WorkspaceUserWhereUniqueInput
  }

  /**
   * WorkspaceUser findFirst
   */
  export type WorkspaceUserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkspaceUser
     */
    select?: WorkspaceUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkspaceUser
     */
    omit?: WorkspaceUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceUserInclude<ExtArgs> | null
    /**
     * Filter, which WorkspaceUser to fetch.
     */
    where?: WorkspaceUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkspaceUsers to fetch.
     */
    orderBy?: WorkspaceUserOrderByWithRelationInput | WorkspaceUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WorkspaceUsers.
     */
    cursor?: WorkspaceUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkspaceUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkspaceUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WorkspaceUsers.
     */
    distinct?: WorkspaceUserScalarFieldEnum | WorkspaceUserScalarFieldEnum[]
  }

  /**
   * WorkspaceUser findFirstOrThrow
   */
  export type WorkspaceUserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkspaceUser
     */
    select?: WorkspaceUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkspaceUser
     */
    omit?: WorkspaceUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceUserInclude<ExtArgs> | null
    /**
     * Filter, which WorkspaceUser to fetch.
     */
    where?: WorkspaceUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkspaceUsers to fetch.
     */
    orderBy?: WorkspaceUserOrderByWithRelationInput | WorkspaceUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WorkspaceUsers.
     */
    cursor?: WorkspaceUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkspaceUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkspaceUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WorkspaceUsers.
     */
    distinct?: WorkspaceUserScalarFieldEnum | WorkspaceUserScalarFieldEnum[]
  }

  /**
   * WorkspaceUser findMany
   */
  export type WorkspaceUserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkspaceUser
     */
    select?: WorkspaceUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkspaceUser
     */
    omit?: WorkspaceUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceUserInclude<ExtArgs> | null
    /**
     * Filter, which WorkspaceUsers to fetch.
     */
    where?: WorkspaceUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkspaceUsers to fetch.
     */
    orderBy?: WorkspaceUserOrderByWithRelationInput | WorkspaceUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WorkspaceUsers.
     */
    cursor?: WorkspaceUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkspaceUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkspaceUsers.
     */
    skip?: number
    distinct?: WorkspaceUserScalarFieldEnum | WorkspaceUserScalarFieldEnum[]
  }

  /**
   * WorkspaceUser create
   */
  export type WorkspaceUserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkspaceUser
     */
    select?: WorkspaceUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkspaceUser
     */
    omit?: WorkspaceUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceUserInclude<ExtArgs> | null
    /**
     * The data needed to create a WorkspaceUser.
     */
    data: XOR<WorkspaceUserCreateInput, WorkspaceUserUncheckedCreateInput>
  }

  /**
   * WorkspaceUser createMany
   */
  export type WorkspaceUserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WorkspaceUsers.
     */
    data: WorkspaceUserCreateManyInput | WorkspaceUserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WorkspaceUser createManyAndReturn
   */
  export type WorkspaceUserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkspaceUser
     */
    select?: WorkspaceUserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WorkspaceUser
     */
    omit?: WorkspaceUserOmit<ExtArgs> | null
    /**
     * The data used to create many WorkspaceUsers.
     */
    data: WorkspaceUserCreateManyInput | WorkspaceUserCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceUserIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * WorkspaceUser update
   */
  export type WorkspaceUserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkspaceUser
     */
    select?: WorkspaceUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkspaceUser
     */
    omit?: WorkspaceUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceUserInclude<ExtArgs> | null
    /**
     * The data needed to update a WorkspaceUser.
     */
    data: XOR<WorkspaceUserUpdateInput, WorkspaceUserUncheckedUpdateInput>
    /**
     * Choose, which WorkspaceUser to update.
     */
    where: WorkspaceUserWhereUniqueInput
  }

  /**
   * WorkspaceUser updateMany
   */
  export type WorkspaceUserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WorkspaceUsers.
     */
    data: XOR<WorkspaceUserUpdateManyMutationInput, WorkspaceUserUncheckedUpdateManyInput>
    /**
     * Filter which WorkspaceUsers to update
     */
    where?: WorkspaceUserWhereInput
    /**
     * Limit how many WorkspaceUsers to update.
     */
    limit?: number
  }

  /**
   * WorkspaceUser updateManyAndReturn
   */
  export type WorkspaceUserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkspaceUser
     */
    select?: WorkspaceUserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WorkspaceUser
     */
    omit?: WorkspaceUserOmit<ExtArgs> | null
    /**
     * The data used to update WorkspaceUsers.
     */
    data: XOR<WorkspaceUserUpdateManyMutationInput, WorkspaceUserUncheckedUpdateManyInput>
    /**
     * Filter which WorkspaceUsers to update
     */
    where?: WorkspaceUserWhereInput
    /**
     * Limit how many WorkspaceUsers to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceUserIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * WorkspaceUser upsert
   */
  export type WorkspaceUserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkspaceUser
     */
    select?: WorkspaceUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkspaceUser
     */
    omit?: WorkspaceUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceUserInclude<ExtArgs> | null
    /**
     * The filter to search for the WorkspaceUser to update in case it exists.
     */
    where: WorkspaceUserWhereUniqueInput
    /**
     * In case the WorkspaceUser found by the `where` argument doesn't exist, create a new WorkspaceUser with this data.
     */
    create: XOR<WorkspaceUserCreateInput, WorkspaceUserUncheckedCreateInput>
    /**
     * In case the WorkspaceUser was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WorkspaceUserUpdateInput, WorkspaceUserUncheckedUpdateInput>
  }

  /**
   * WorkspaceUser delete
   */
  export type WorkspaceUserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkspaceUser
     */
    select?: WorkspaceUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkspaceUser
     */
    omit?: WorkspaceUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceUserInclude<ExtArgs> | null
    /**
     * Filter which WorkspaceUser to delete.
     */
    where: WorkspaceUserWhereUniqueInput
  }

  /**
   * WorkspaceUser deleteMany
   */
  export type WorkspaceUserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WorkspaceUsers to delete
     */
    where?: WorkspaceUserWhereInput
    /**
     * Limit how many WorkspaceUsers to delete.
     */
    limit?: number
  }

  /**
   * WorkspaceUser without action
   */
  export type WorkspaceUserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkspaceUser
     */
    select?: WorkspaceUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkspaceUser
     */
    omit?: WorkspaceUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkspaceUserInclude<ExtArgs> | null
  }


  /**
   * Model DataTable
   */

  export type AggregateDataTable = {
    _count: DataTableCountAggregateOutputType | null
    _min: DataTableMinAggregateOutputType | null
    _max: DataTableMaxAggregateOutputType | null
  }

  export type DataTableMinAggregateOutputType = {
    id: string | null
    name: string | null
    sheetName: string | null
    workspaceId: string | null
    uploadedAt: Date | null
    updatedAt: Date | null
  }

  export type DataTableMaxAggregateOutputType = {
    id: string | null
    name: string | null
    sheetName: string | null
    workspaceId: string | null
    uploadedAt: Date | null
    updatedAt: Date | null
  }

  export type DataTableCountAggregateOutputType = {
    id: number
    name: number
    sheetName: number
    workspaceId: number
    uploadedAt: number
    updatedAt: number
    columns: number
    data: number
    _all: number
  }


  export type DataTableMinAggregateInputType = {
    id?: true
    name?: true
    sheetName?: true
    workspaceId?: true
    uploadedAt?: true
    updatedAt?: true
  }

  export type DataTableMaxAggregateInputType = {
    id?: true
    name?: true
    sheetName?: true
    workspaceId?: true
    uploadedAt?: true
    updatedAt?: true
  }

  export type DataTableCountAggregateInputType = {
    id?: true
    name?: true
    sheetName?: true
    workspaceId?: true
    uploadedAt?: true
    updatedAt?: true
    columns?: true
    data?: true
    _all?: true
  }

  export type DataTableAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DataTable to aggregate.
     */
    where?: DataTableWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DataTables to fetch.
     */
    orderBy?: DataTableOrderByWithRelationInput | DataTableOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DataTableWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DataTables from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DataTables.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DataTables
    **/
    _count?: true | DataTableCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DataTableMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DataTableMaxAggregateInputType
  }

  export type GetDataTableAggregateType<T extends DataTableAggregateArgs> = {
        [P in keyof T & keyof AggregateDataTable]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDataTable[P]>
      : GetScalarType<T[P], AggregateDataTable[P]>
  }




  export type DataTableGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DataTableWhereInput
    orderBy?: DataTableOrderByWithAggregationInput | DataTableOrderByWithAggregationInput[]
    by: DataTableScalarFieldEnum[] | DataTableScalarFieldEnum
    having?: DataTableScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DataTableCountAggregateInputType | true
    _min?: DataTableMinAggregateInputType
    _max?: DataTableMaxAggregateInputType
  }

  export type DataTableGroupByOutputType = {
    id: string
    name: string
    sheetName: string
    workspaceId: string
    uploadedAt: Date
    updatedAt: Date
    columns: JsonValue
    data: JsonValue
    _count: DataTableCountAggregateOutputType | null
    _min: DataTableMinAggregateOutputType | null
    _max: DataTableMaxAggregateOutputType | null
  }

  type GetDataTableGroupByPayload<T extends DataTableGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DataTableGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DataTableGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DataTableGroupByOutputType[P]>
            : GetScalarType<T[P], DataTableGroupByOutputType[P]>
        }
      >
    >


  export type DataTableSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    sheetName?: boolean
    workspaceId?: boolean
    uploadedAt?: boolean
    updatedAt?: boolean
    columns?: boolean
    data?: boolean
    workspace?: boolean | WorkspaceDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["dataTable"]>

  export type DataTableSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    sheetName?: boolean
    workspaceId?: boolean
    uploadedAt?: boolean
    updatedAt?: boolean
    columns?: boolean
    data?: boolean
    workspace?: boolean | WorkspaceDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["dataTable"]>

  export type DataTableSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    sheetName?: boolean
    workspaceId?: boolean
    uploadedAt?: boolean
    updatedAt?: boolean
    columns?: boolean
    data?: boolean
    workspace?: boolean | WorkspaceDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["dataTable"]>

  export type DataTableSelectScalar = {
    id?: boolean
    name?: boolean
    sheetName?: boolean
    workspaceId?: boolean
    uploadedAt?: boolean
    updatedAt?: boolean
    columns?: boolean
    data?: boolean
  }

  export type DataTableOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "sheetName" | "workspaceId" | "uploadedAt" | "updatedAt" | "columns" | "data", ExtArgs["result"]["dataTable"]>
  export type DataTableInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    workspace?: boolean | WorkspaceDefaultArgs<ExtArgs>
  }
  export type DataTableIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    workspace?: boolean | WorkspaceDefaultArgs<ExtArgs>
  }
  export type DataTableIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    workspace?: boolean | WorkspaceDefaultArgs<ExtArgs>
  }

  export type $DataTablePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DataTable"
    objects: {
      workspace: Prisma.$WorkspacePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      sheetName: string
      workspaceId: string
      uploadedAt: Date
      updatedAt: Date
      columns: Prisma.JsonValue
      data: Prisma.JsonValue
    }, ExtArgs["result"]["dataTable"]>
    composites: {}
  }

  type DataTableGetPayload<S extends boolean | null | undefined | DataTableDefaultArgs> = $Result.GetResult<Prisma.$DataTablePayload, S>

  type DataTableCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DataTableFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DataTableCountAggregateInputType | true
    }

  export interface DataTableDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DataTable'], meta: { name: 'DataTable' } }
    /**
     * Find zero or one DataTable that matches the filter.
     * @param {DataTableFindUniqueArgs} args - Arguments to find a DataTable
     * @example
     * // Get one DataTable
     * const dataTable = await prisma.dataTable.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DataTableFindUniqueArgs>(args: SelectSubset<T, DataTableFindUniqueArgs<ExtArgs>>): Prisma__DataTableClient<$Result.GetResult<Prisma.$DataTablePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DataTable that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DataTableFindUniqueOrThrowArgs} args - Arguments to find a DataTable
     * @example
     * // Get one DataTable
     * const dataTable = await prisma.dataTable.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DataTableFindUniqueOrThrowArgs>(args: SelectSubset<T, DataTableFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DataTableClient<$Result.GetResult<Prisma.$DataTablePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DataTable that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataTableFindFirstArgs} args - Arguments to find a DataTable
     * @example
     * // Get one DataTable
     * const dataTable = await prisma.dataTable.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DataTableFindFirstArgs>(args?: SelectSubset<T, DataTableFindFirstArgs<ExtArgs>>): Prisma__DataTableClient<$Result.GetResult<Prisma.$DataTablePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DataTable that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataTableFindFirstOrThrowArgs} args - Arguments to find a DataTable
     * @example
     * // Get one DataTable
     * const dataTable = await prisma.dataTable.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DataTableFindFirstOrThrowArgs>(args?: SelectSubset<T, DataTableFindFirstOrThrowArgs<ExtArgs>>): Prisma__DataTableClient<$Result.GetResult<Prisma.$DataTablePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DataTables that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataTableFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DataTables
     * const dataTables = await prisma.dataTable.findMany()
     * 
     * // Get first 10 DataTables
     * const dataTables = await prisma.dataTable.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const dataTableWithIdOnly = await prisma.dataTable.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DataTableFindManyArgs>(args?: SelectSubset<T, DataTableFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DataTablePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DataTable.
     * @param {DataTableCreateArgs} args - Arguments to create a DataTable.
     * @example
     * // Create one DataTable
     * const DataTable = await prisma.dataTable.create({
     *   data: {
     *     // ... data to create a DataTable
     *   }
     * })
     * 
     */
    create<T extends DataTableCreateArgs>(args: SelectSubset<T, DataTableCreateArgs<ExtArgs>>): Prisma__DataTableClient<$Result.GetResult<Prisma.$DataTablePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DataTables.
     * @param {DataTableCreateManyArgs} args - Arguments to create many DataTables.
     * @example
     * // Create many DataTables
     * const dataTable = await prisma.dataTable.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DataTableCreateManyArgs>(args?: SelectSubset<T, DataTableCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DataTables and returns the data saved in the database.
     * @param {DataTableCreateManyAndReturnArgs} args - Arguments to create many DataTables.
     * @example
     * // Create many DataTables
     * const dataTable = await prisma.dataTable.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DataTables and only return the `id`
     * const dataTableWithIdOnly = await prisma.dataTable.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DataTableCreateManyAndReturnArgs>(args?: SelectSubset<T, DataTableCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DataTablePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DataTable.
     * @param {DataTableDeleteArgs} args - Arguments to delete one DataTable.
     * @example
     * // Delete one DataTable
     * const DataTable = await prisma.dataTable.delete({
     *   where: {
     *     // ... filter to delete one DataTable
     *   }
     * })
     * 
     */
    delete<T extends DataTableDeleteArgs>(args: SelectSubset<T, DataTableDeleteArgs<ExtArgs>>): Prisma__DataTableClient<$Result.GetResult<Prisma.$DataTablePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DataTable.
     * @param {DataTableUpdateArgs} args - Arguments to update one DataTable.
     * @example
     * // Update one DataTable
     * const dataTable = await prisma.dataTable.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DataTableUpdateArgs>(args: SelectSubset<T, DataTableUpdateArgs<ExtArgs>>): Prisma__DataTableClient<$Result.GetResult<Prisma.$DataTablePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DataTables.
     * @param {DataTableDeleteManyArgs} args - Arguments to filter DataTables to delete.
     * @example
     * // Delete a few DataTables
     * const { count } = await prisma.dataTable.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DataTableDeleteManyArgs>(args?: SelectSubset<T, DataTableDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DataTables.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataTableUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DataTables
     * const dataTable = await prisma.dataTable.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DataTableUpdateManyArgs>(args: SelectSubset<T, DataTableUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DataTables and returns the data updated in the database.
     * @param {DataTableUpdateManyAndReturnArgs} args - Arguments to update many DataTables.
     * @example
     * // Update many DataTables
     * const dataTable = await prisma.dataTable.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DataTables and only return the `id`
     * const dataTableWithIdOnly = await prisma.dataTable.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DataTableUpdateManyAndReturnArgs>(args: SelectSubset<T, DataTableUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DataTablePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DataTable.
     * @param {DataTableUpsertArgs} args - Arguments to update or create a DataTable.
     * @example
     * // Update or create a DataTable
     * const dataTable = await prisma.dataTable.upsert({
     *   create: {
     *     // ... data to create a DataTable
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DataTable we want to update
     *   }
     * })
     */
    upsert<T extends DataTableUpsertArgs>(args: SelectSubset<T, DataTableUpsertArgs<ExtArgs>>): Prisma__DataTableClient<$Result.GetResult<Prisma.$DataTablePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DataTables.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataTableCountArgs} args - Arguments to filter DataTables to count.
     * @example
     * // Count the number of DataTables
     * const count = await prisma.dataTable.count({
     *   where: {
     *     // ... the filter for the DataTables we want to count
     *   }
     * })
    **/
    count<T extends DataTableCountArgs>(
      args?: Subset<T, DataTableCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DataTableCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DataTable.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataTableAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DataTableAggregateArgs>(args: Subset<T, DataTableAggregateArgs>): Prisma.PrismaPromise<GetDataTableAggregateType<T>>

    /**
     * Group by DataTable.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataTableGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DataTableGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DataTableGroupByArgs['orderBy'] }
        : { orderBy?: DataTableGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DataTableGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDataTableGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DataTable model
   */
  readonly fields: DataTableFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DataTable.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DataTableClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    workspace<T extends WorkspaceDefaultArgs<ExtArgs> = {}>(args?: Subset<T, WorkspaceDefaultArgs<ExtArgs>>): Prisma__WorkspaceClient<$Result.GetResult<Prisma.$WorkspacePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DataTable model
   */
  interface DataTableFieldRefs {
    readonly id: FieldRef<"DataTable", 'String'>
    readonly name: FieldRef<"DataTable", 'String'>
    readonly sheetName: FieldRef<"DataTable", 'String'>
    readonly workspaceId: FieldRef<"DataTable", 'String'>
    readonly uploadedAt: FieldRef<"DataTable", 'DateTime'>
    readonly updatedAt: FieldRef<"DataTable", 'DateTime'>
    readonly columns: FieldRef<"DataTable", 'Json'>
    readonly data: FieldRef<"DataTable", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * DataTable findUnique
   */
  export type DataTableFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataTable
     */
    select?: DataTableSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataTable
     */
    omit?: DataTableOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DataTableInclude<ExtArgs> | null
    /**
     * Filter, which DataTable to fetch.
     */
    where: DataTableWhereUniqueInput
  }

  /**
   * DataTable findUniqueOrThrow
   */
  export type DataTableFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataTable
     */
    select?: DataTableSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataTable
     */
    omit?: DataTableOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DataTableInclude<ExtArgs> | null
    /**
     * Filter, which DataTable to fetch.
     */
    where: DataTableWhereUniqueInput
  }

  /**
   * DataTable findFirst
   */
  export type DataTableFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataTable
     */
    select?: DataTableSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataTable
     */
    omit?: DataTableOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DataTableInclude<ExtArgs> | null
    /**
     * Filter, which DataTable to fetch.
     */
    where?: DataTableWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DataTables to fetch.
     */
    orderBy?: DataTableOrderByWithRelationInput | DataTableOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DataTables.
     */
    cursor?: DataTableWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DataTables from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DataTables.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DataTables.
     */
    distinct?: DataTableScalarFieldEnum | DataTableScalarFieldEnum[]
  }

  /**
   * DataTable findFirstOrThrow
   */
  export type DataTableFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataTable
     */
    select?: DataTableSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataTable
     */
    omit?: DataTableOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DataTableInclude<ExtArgs> | null
    /**
     * Filter, which DataTable to fetch.
     */
    where?: DataTableWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DataTables to fetch.
     */
    orderBy?: DataTableOrderByWithRelationInput | DataTableOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DataTables.
     */
    cursor?: DataTableWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DataTables from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DataTables.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DataTables.
     */
    distinct?: DataTableScalarFieldEnum | DataTableScalarFieldEnum[]
  }

  /**
   * DataTable findMany
   */
  export type DataTableFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataTable
     */
    select?: DataTableSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataTable
     */
    omit?: DataTableOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DataTableInclude<ExtArgs> | null
    /**
     * Filter, which DataTables to fetch.
     */
    where?: DataTableWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DataTables to fetch.
     */
    orderBy?: DataTableOrderByWithRelationInput | DataTableOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DataTables.
     */
    cursor?: DataTableWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DataTables from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DataTables.
     */
    skip?: number
    distinct?: DataTableScalarFieldEnum | DataTableScalarFieldEnum[]
  }

  /**
   * DataTable create
   */
  export type DataTableCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataTable
     */
    select?: DataTableSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataTable
     */
    omit?: DataTableOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DataTableInclude<ExtArgs> | null
    /**
     * The data needed to create a DataTable.
     */
    data: XOR<DataTableCreateInput, DataTableUncheckedCreateInput>
  }

  /**
   * DataTable createMany
   */
  export type DataTableCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DataTables.
     */
    data: DataTableCreateManyInput | DataTableCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DataTable createManyAndReturn
   */
  export type DataTableCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataTable
     */
    select?: DataTableSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DataTable
     */
    omit?: DataTableOmit<ExtArgs> | null
    /**
     * The data used to create many DataTables.
     */
    data: DataTableCreateManyInput | DataTableCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DataTableIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * DataTable update
   */
  export type DataTableUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataTable
     */
    select?: DataTableSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataTable
     */
    omit?: DataTableOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DataTableInclude<ExtArgs> | null
    /**
     * The data needed to update a DataTable.
     */
    data: XOR<DataTableUpdateInput, DataTableUncheckedUpdateInput>
    /**
     * Choose, which DataTable to update.
     */
    where: DataTableWhereUniqueInput
  }

  /**
   * DataTable updateMany
   */
  export type DataTableUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DataTables.
     */
    data: XOR<DataTableUpdateManyMutationInput, DataTableUncheckedUpdateManyInput>
    /**
     * Filter which DataTables to update
     */
    where?: DataTableWhereInput
    /**
     * Limit how many DataTables to update.
     */
    limit?: number
  }

  /**
   * DataTable updateManyAndReturn
   */
  export type DataTableUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataTable
     */
    select?: DataTableSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DataTable
     */
    omit?: DataTableOmit<ExtArgs> | null
    /**
     * The data used to update DataTables.
     */
    data: XOR<DataTableUpdateManyMutationInput, DataTableUncheckedUpdateManyInput>
    /**
     * Filter which DataTables to update
     */
    where?: DataTableWhereInput
    /**
     * Limit how many DataTables to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DataTableIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * DataTable upsert
   */
  export type DataTableUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataTable
     */
    select?: DataTableSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataTable
     */
    omit?: DataTableOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DataTableInclude<ExtArgs> | null
    /**
     * The filter to search for the DataTable to update in case it exists.
     */
    where: DataTableWhereUniqueInput
    /**
     * In case the DataTable found by the `where` argument doesn't exist, create a new DataTable with this data.
     */
    create: XOR<DataTableCreateInput, DataTableUncheckedCreateInput>
    /**
     * In case the DataTable was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DataTableUpdateInput, DataTableUncheckedUpdateInput>
  }

  /**
   * DataTable delete
   */
  export type DataTableDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataTable
     */
    select?: DataTableSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataTable
     */
    omit?: DataTableOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DataTableInclude<ExtArgs> | null
    /**
     * Filter which DataTable to delete.
     */
    where: DataTableWhereUniqueInput
  }

  /**
   * DataTable deleteMany
   */
  export type DataTableDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DataTables to delete
     */
    where?: DataTableWhereInput
    /**
     * Limit how many DataTables to delete.
     */
    limit?: number
  }

  /**
   * DataTable without action
   */
  export type DataTableDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataTable
     */
    select?: DataTableSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataTable
     */
    omit?: DataTableOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DataTableInclude<ExtArgs> | null
  }


  /**
   * Model Formula
   */

  export type AggregateFormula = {
    _count: FormulaCountAggregateOutputType | null
    _min: FormulaMinAggregateOutputType | null
    _max: FormulaMaxAggregateOutputType | null
  }

  export type FormulaMinAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    formula: string | null
    workspaceId: string | null
    tableId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    color: string | null
  }

  export type FormulaMaxAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    formula: string | null
    workspaceId: string | null
    tableId: string | null
    createdAt: Date | null
    updatedAt: Date | null
    color: string | null
  }

  export type FormulaCountAggregateOutputType = {
    id: number
    name: number
    description: number
    formula: number
    workspaceId: number
    tableId: number
    createdAt: number
    updatedAt: number
    color: number
    _all: number
  }


  export type FormulaMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    formula?: true
    workspaceId?: true
    tableId?: true
    createdAt?: true
    updatedAt?: true
    color?: true
  }

  export type FormulaMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    formula?: true
    workspaceId?: true
    tableId?: true
    createdAt?: true
    updatedAt?: true
    color?: true
  }

  export type FormulaCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    formula?: true
    workspaceId?: true
    tableId?: true
    createdAt?: true
    updatedAt?: true
    color?: true
    _all?: true
  }

  export type FormulaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Formula to aggregate.
     */
    where?: FormulaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Formulas to fetch.
     */
    orderBy?: FormulaOrderByWithRelationInput | FormulaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FormulaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Formulas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Formulas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Formulas
    **/
    _count?: true | FormulaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FormulaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FormulaMaxAggregateInputType
  }

  export type GetFormulaAggregateType<T extends FormulaAggregateArgs> = {
        [P in keyof T & keyof AggregateFormula]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFormula[P]>
      : GetScalarType<T[P], AggregateFormula[P]>
  }




  export type FormulaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FormulaWhereInput
    orderBy?: FormulaOrderByWithAggregationInput | FormulaOrderByWithAggregationInput[]
    by: FormulaScalarFieldEnum[] | FormulaScalarFieldEnum
    having?: FormulaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FormulaCountAggregateInputType | true
    _min?: FormulaMinAggregateInputType
    _max?: FormulaMaxAggregateInputType
  }

  export type FormulaGroupByOutputType = {
    id: string
    name: string
    description: string | null
    formula: string
    workspaceId: string
    tableId: string | null
    createdAt: Date
    updatedAt: Date
    color: string | null
    _count: FormulaCountAggregateOutputType | null
    _min: FormulaMinAggregateOutputType | null
    _max: FormulaMaxAggregateOutputType | null
  }

  type GetFormulaGroupByPayload<T extends FormulaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FormulaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FormulaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FormulaGroupByOutputType[P]>
            : GetScalarType<T[P], FormulaGroupByOutputType[P]>
        }
      >
    >


  export type FormulaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    formula?: boolean
    workspaceId?: boolean
    tableId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    color?: boolean
    workspace?: boolean | WorkspaceDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["formula"]>

  export type FormulaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    formula?: boolean
    workspaceId?: boolean
    tableId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    color?: boolean
    workspace?: boolean | WorkspaceDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["formula"]>

  export type FormulaSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    formula?: boolean
    workspaceId?: boolean
    tableId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    color?: boolean
    workspace?: boolean | WorkspaceDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["formula"]>

  export type FormulaSelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    formula?: boolean
    workspaceId?: boolean
    tableId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    color?: boolean
  }

  export type FormulaOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "description" | "formula" | "workspaceId" | "tableId" | "createdAt" | "updatedAt" | "color", ExtArgs["result"]["formula"]>
  export type FormulaInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    workspace?: boolean | WorkspaceDefaultArgs<ExtArgs>
  }
  export type FormulaIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    workspace?: boolean | WorkspaceDefaultArgs<ExtArgs>
  }
  export type FormulaIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    workspace?: boolean | WorkspaceDefaultArgs<ExtArgs>
  }

  export type $FormulaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Formula"
    objects: {
      workspace: Prisma.$WorkspacePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      description: string | null
      formula: string
      workspaceId: string
      tableId: string | null
      createdAt: Date
      updatedAt: Date
      color: string | null
    }, ExtArgs["result"]["formula"]>
    composites: {}
  }

  type FormulaGetPayload<S extends boolean | null | undefined | FormulaDefaultArgs> = $Result.GetResult<Prisma.$FormulaPayload, S>

  type FormulaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<FormulaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: FormulaCountAggregateInputType | true
    }

  export interface FormulaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Formula'], meta: { name: 'Formula' } }
    /**
     * Find zero or one Formula that matches the filter.
     * @param {FormulaFindUniqueArgs} args - Arguments to find a Formula
     * @example
     * // Get one Formula
     * const formula = await prisma.formula.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FormulaFindUniqueArgs>(args: SelectSubset<T, FormulaFindUniqueArgs<ExtArgs>>): Prisma__FormulaClient<$Result.GetResult<Prisma.$FormulaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Formula that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FormulaFindUniqueOrThrowArgs} args - Arguments to find a Formula
     * @example
     * // Get one Formula
     * const formula = await prisma.formula.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FormulaFindUniqueOrThrowArgs>(args: SelectSubset<T, FormulaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FormulaClient<$Result.GetResult<Prisma.$FormulaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Formula that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormulaFindFirstArgs} args - Arguments to find a Formula
     * @example
     * // Get one Formula
     * const formula = await prisma.formula.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FormulaFindFirstArgs>(args?: SelectSubset<T, FormulaFindFirstArgs<ExtArgs>>): Prisma__FormulaClient<$Result.GetResult<Prisma.$FormulaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Formula that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormulaFindFirstOrThrowArgs} args - Arguments to find a Formula
     * @example
     * // Get one Formula
     * const formula = await prisma.formula.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FormulaFindFirstOrThrowArgs>(args?: SelectSubset<T, FormulaFindFirstOrThrowArgs<ExtArgs>>): Prisma__FormulaClient<$Result.GetResult<Prisma.$FormulaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Formulas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormulaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Formulas
     * const formulas = await prisma.formula.findMany()
     * 
     * // Get first 10 Formulas
     * const formulas = await prisma.formula.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const formulaWithIdOnly = await prisma.formula.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FormulaFindManyArgs>(args?: SelectSubset<T, FormulaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FormulaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Formula.
     * @param {FormulaCreateArgs} args - Arguments to create a Formula.
     * @example
     * // Create one Formula
     * const Formula = await prisma.formula.create({
     *   data: {
     *     // ... data to create a Formula
     *   }
     * })
     * 
     */
    create<T extends FormulaCreateArgs>(args: SelectSubset<T, FormulaCreateArgs<ExtArgs>>): Prisma__FormulaClient<$Result.GetResult<Prisma.$FormulaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Formulas.
     * @param {FormulaCreateManyArgs} args - Arguments to create many Formulas.
     * @example
     * // Create many Formulas
     * const formula = await prisma.formula.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FormulaCreateManyArgs>(args?: SelectSubset<T, FormulaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Formulas and returns the data saved in the database.
     * @param {FormulaCreateManyAndReturnArgs} args - Arguments to create many Formulas.
     * @example
     * // Create many Formulas
     * const formula = await prisma.formula.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Formulas and only return the `id`
     * const formulaWithIdOnly = await prisma.formula.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FormulaCreateManyAndReturnArgs>(args?: SelectSubset<T, FormulaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FormulaPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Formula.
     * @param {FormulaDeleteArgs} args - Arguments to delete one Formula.
     * @example
     * // Delete one Formula
     * const Formula = await prisma.formula.delete({
     *   where: {
     *     // ... filter to delete one Formula
     *   }
     * })
     * 
     */
    delete<T extends FormulaDeleteArgs>(args: SelectSubset<T, FormulaDeleteArgs<ExtArgs>>): Prisma__FormulaClient<$Result.GetResult<Prisma.$FormulaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Formula.
     * @param {FormulaUpdateArgs} args - Arguments to update one Formula.
     * @example
     * // Update one Formula
     * const formula = await prisma.formula.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FormulaUpdateArgs>(args: SelectSubset<T, FormulaUpdateArgs<ExtArgs>>): Prisma__FormulaClient<$Result.GetResult<Prisma.$FormulaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Formulas.
     * @param {FormulaDeleteManyArgs} args - Arguments to filter Formulas to delete.
     * @example
     * // Delete a few Formulas
     * const { count } = await prisma.formula.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FormulaDeleteManyArgs>(args?: SelectSubset<T, FormulaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Formulas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormulaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Formulas
     * const formula = await prisma.formula.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FormulaUpdateManyArgs>(args: SelectSubset<T, FormulaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Formulas and returns the data updated in the database.
     * @param {FormulaUpdateManyAndReturnArgs} args - Arguments to update many Formulas.
     * @example
     * // Update many Formulas
     * const formula = await prisma.formula.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Formulas and only return the `id`
     * const formulaWithIdOnly = await prisma.formula.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends FormulaUpdateManyAndReturnArgs>(args: SelectSubset<T, FormulaUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FormulaPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Formula.
     * @param {FormulaUpsertArgs} args - Arguments to update or create a Formula.
     * @example
     * // Update or create a Formula
     * const formula = await prisma.formula.upsert({
     *   create: {
     *     // ... data to create a Formula
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Formula we want to update
     *   }
     * })
     */
    upsert<T extends FormulaUpsertArgs>(args: SelectSubset<T, FormulaUpsertArgs<ExtArgs>>): Prisma__FormulaClient<$Result.GetResult<Prisma.$FormulaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Formulas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormulaCountArgs} args - Arguments to filter Formulas to count.
     * @example
     * // Count the number of Formulas
     * const count = await prisma.formula.count({
     *   where: {
     *     // ... the filter for the Formulas we want to count
     *   }
     * })
    **/
    count<T extends FormulaCountArgs>(
      args?: Subset<T, FormulaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FormulaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Formula.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormulaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FormulaAggregateArgs>(args: Subset<T, FormulaAggregateArgs>): Prisma.PrismaPromise<GetFormulaAggregateType<T>>

    /**
     * Group by Formula.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FormulaGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FormulaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FormulaGroupByArgs['orderBy'] }
        : { orderBy?: FormulaGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FormulaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFormulaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Formula model
   */
  readonly fields: FormulaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Formula.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FormulaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    workspace<T extends WorkspaceDefaultArgs<ExtArgs> = {}>(args?: Subset<T, WorkspaceDefaultArgs<ExtArgs>>): Prisma__WorkspaceClient<$Result.GetResult<Prisma.$WorkspacePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Formula model
   */
  interface FormulaFieldRefs {
    readonly id: FieldRef<"Formula", 'String'>
    readonly name: FieldRef<"Formula", 'String'>
    readonly description: FieldRef<"Formula", 'String'>
    readonly formula: FieldRef<"Formula", 'String'>
    readonly workspaceId: FieldRef<"Formula", 'String'>
    readonly tableId: FieldRef<"Formula", 'String'>
    readonly createdAt: FieldRef<"Formula", 'DateTime'>
    readonly updatedAt: FieldRef<"Formula", 'DateTime'>
    readonly color: FieldRef<"Formula", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Formula findUnique
   */
  export type FormulaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formula
     */
    select?: FormulaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Formula
     */
    omit?: FormulaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaInclude<ExtArgs> | null
    /**
     * Filter, which Formula to fetch.
     */
    where: FormulaWhereUniqueInput
  }

  /**
   * Formula findUniqueOrThrow
   */
  export type FormulaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formula
     */
    select?: FormulaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Formula
     */
    omit?: FormulaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaInclude<ExtArgs> | null
    /**
     * Filter, which Formula to fetch.
     */
    where: FormulaWhereUniqueInput
  }

  /**
   * Formula findFirst
   */
  export type FormulaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formula
     */
    select?: FormulaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Formula
     */
    omit?: FormulaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaInclude<ExtArgs> | null
    /**
     * Filter, which Formula to fetch.
     */
    where?: FormulaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Formulas to fetch.
     */
    orderBy?: FormulaOrderByWithRelationInput | FormulaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Formulas.
     */
    cursor?: FormulaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Formulas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Formulas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Formulas.
     */
    distinct?: FormulaScalarFieldEnum | FormulaScalarFieldEnum[]
  }

  /**
   * Formula findFirstOrThrow
   */
  export type FormulaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formula
     */
    select?: FormulaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Formula
     */
    omit?: FormulaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaInclude<ExtArgs> | null
    /**
     * Filter, which Formula to fetch.
     */
    where?: FormulaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Formulas to fetch.
     */
    orderBy?: FormulaOrderByWithRelationInput | FormulaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Formulas.
     */
    cursor?: FormulaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Formulas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Formulas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Formulas.
     */
    distinct?: FormulaScalarFieldEnum | FormulaScalarFieldEnum[]
  }

  /**
   * Formula findMany
   */
  export type FormulaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formula
     */
    select?: FormulaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Formula
     */
    omit?: FormulaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaInclude<ExtArgs> | null
    /**
     * Filter, which Formulas to fetch.
     */
    where?: FormulaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Formulas to fetch.
     */
    orderBy?: FormulaOrderByWithRelationInput | FormulaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Formulas.
     */
    cursor?: FormulaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Formulas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Formulas.
     */
    skip?: number
    distinct?: FormulaScalarFieldEnum | FormulaScalarFieldEnum[]
  }

  /**
   * Formula create
   */
  export type FormulaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formula
     */
    select?: FormulaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Formula
     */
    omit?: FormulaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaInclude<ExtArgs> | null
    /**
     * The data needed to create a Formula.
     */
    data: XOR<FormulaCreateInput, FormulaUncheckedCreateInput>
  }

  /**
   * Formula createMany
   */
  export type FormulaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Formulas.
     */
    data: FormulaCreateManyInput | FormulaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Formula createManyAndReturn
   */
  export type FormulaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formula
     */
    select?: FormulaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Formula
     */
    omit?: FormulaOmit<ExtArgs> | null
    /**
     * The data used to create many Formulas.
     */
    data: FormulaCreateManyInput | FormulaCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Formula update
   */
  export type FormulaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formula
     */
    select?: FormulaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Formula
     */
    omit?: FormulaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaInclude<ExtArgs> | null
    /**
     * The data needed to update a Formula.
     */
    data: XOR<FormulaUpdateInput, FormulaUncheckedUpdateInput>
    /**
     * Choose, which Formula to update.
     */
    where: FormulaWhereUniqueInput
  }

  /**
   * Formula updateMany
   */
  export type FormulaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Formulas.
     */
    data: XOR<FormulaUpdateManyMutationInput, FormulaUncheckedUpdateManyInput>
    /**
     * Filter which Formulas to update
     */
    where?: FormulaWhereInput
    /**
     * Limit how many Formulas to update.
     */
    limit?: number
  }

  /**
   * Formula updateManyAndReturn
   */
  export type FormulaUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formula
     */
    select?: FormulaSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Formula
     */
    omit?: FormulaOmit<ExtArgs> | null
    /**
     * The data used to update Formulas.
     */
    data: XOR<FormulaUpdateManyMutationInput, FormulaUncheckedUpdateManyInput>
    /**
     * Filter which Formulas to update
     */
    where?: FormulaWhereInput
    /**
     * Limit how many Formulas to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Formula upsert
   */
  export type FormulaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formula
     */
    select?: FormulaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Formula
     */
    omit?: FormulaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaInclude<ExtArgs> | null
    /**
     * The filter to search for the Formula to update in case it exists.
     */
    where: FormulaWhereUniqueInput
    /**
     * In case the Formula found by the `where` argument doesn't exist, create a new Formula with this data.
     */
    create: XOR<FormulaCreateInput, FormulaUncheckedCreateInput>
    /**
     * In case the Formula was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FormulaUpdateInput, FormulaUncheckedUpdateInput>
  }

  /**
   * Formula delete
   */
  export type FormulaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formula
     */
    select?: FormulaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Formula
     */
    omit?: FormulaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaInclude<ExtArgs> | null
    /**
     * Filter which Formula to delete.
     */
    where: FormulaWhereUniqueInput
  }

  /**
   * Formula deleteMany
   */
  export type FormulaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Formulas to delete
     */
    where?: FormulaWhereInput
    /**
     * Limit how many Formulas to delete.
     */
    limit?: number
  }

  /**
   * Formula without action
   */
  export type FormulaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Formula
     */
    select?: FormulaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Formula
     */
    omit?: FormulaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FormulaInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    name: 'name',
    password: 'password',
    role: 'role',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const WorkspaceScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    createdBy: 'createdBy'
  };

  export type WorkspaceScalarFieldEnum = (typeof WorkspaceScalarFieldEnum)[keyof typeof WorkspaceScalarFieldEnum]


  export const WorkspaceUserScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    workspaceId: 'workspaceId',
    addedAt: 'addedAt'
  };

  export type WorkspaceUserScalarFieldEnum = (typeof WorkspaceUserScalarFieldEnum)[keyof typeof WorkspaceUserScalarFieldEnum]


  export const DataTableScalarFieldEnum: {
    id: 'id',
    name: 'name',
    sheetName: 'sheetName',
    workspaceId: 'workspaceId',
    uploadedAt: 'uploadedAt',
    updatedAt: 'updatedAt',
    columns: 'columns',
    data: 'data'
  };

  export type DataTableScalarFieldEnum = (typeof DataTableScalarFieldEnum)[keyof typeof DataTableScalarFieldEnum]


  export const FormulaScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    formula: 'formula',
    workspaceId: 'workspaceId',
    tableId: 'tableId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    color: 'color'
  };

  export type FormulaScalarFieldEnum = (typeof FormulaScalarFieldEnum)[keyof typeof FormulaScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'UserRole'
   */
  export type EnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole'>
    


  /**
   * Reference to a field of type 'UserRole[]'
   */
  export type ListEnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    name?: StringNullableFilter<"User"> | string | null
    password?: StringFilter<"User"> | string
    role?: EnumUserRoleFilter<"User"> | $Enums.UserRole
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    workspaces?: WorkspaceUserListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrderInput | SortOrder
    password?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    workspaces?: WorkspaceUserOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringNullableFilter<"User"> | string | null
    password?: StringFilter<"User"> | string
    role?: EnumUserRoleFilter<"User"> | $Enums.UserRole
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    workspaces?: WorkspaceUserListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrderInput | SortOrder
    password?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    name?: StringNullableWithAggregatesFilter<"User"> | string | null
    password?: StringWithAggregatesFilter<"User"> | string
    role?: EnumUserRoleWithAggregatesFilter<"User"> | $Enums.UserRole
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type WorkspaceWhereInput = {
    AND?: WorkspaceWhereInput | WorkspaceWhereInput[]
    OR?: WorkspaceWhereInput[]
    NOT?: WorkspaceWhereInput | WorkspaceWhereInput[]
    id?: StringFilter<"Workspace"> | string
    name?: StringFilter<"Workspace"> | string
    description?: StringNullableFilter<"Workspace"> | string | null
    createdAt?: DateTimeFilter<"Workspace"> | Date | string
    updatedAt?: DateTimeFilter<"Workspace"> | Date | string
    createdBy?: StringFilter<"Workspace"> | string
    users?: WorkspaceUserListRelationFilter
    tables?: DataTableListRelationFilter
    formulas?: FormulaListRelationFilter
  }

  export type WorkspaceOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
    users?: WorkspaceUserOrderByRelationAggregateInput
    tables?: DataTableOrderByRelationAggregateInput
    formulas?: FormulaOrderByRelationAggregateInput
  }

  export type WorkspaceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: WorkspaceWhereInput | WorkspaceWhereInput[]
    OR?: WorkspaceWhereInput[]
    NOT?: WorkspaceWhereInput | WorkspaceWhereInput[]
    name?: StringFilter<"Workspace"> | string
    description?: StringNullableFilter<"Workspace"> | string | null
    createdAt?: DateTimeFilter<"Workspace"> | Date | string
    updatedAt?: DateTimeFilter<"Workspace"> | Date | string
    createdBy?: StringFilter<"Workspace"> | string
    users?: WorkspaceUserListRelationFilter
    tables?: DataTableListRelationFilter
    formulas?: FormulaListRelationFilter
  }, "id">

  export type WorkspaceOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
    _count?: WorkspaceCountOrderByAggregateInput
    _max?: WorkspaceMaxOrderByAggregateInput
    _min?: WorkspaceMinOrderByAggregateInput
  }

  export type WorkspaceScalarWhereWithAggregatesInput = {
    AND?: WorkspaceScalarWhereWithAggregatesInput | WorkspaceScalarWhereWithAggregatesInput[]
    OR?: WorkspaceScalarWhereWithAggregatesInput[]
    NOT?: WorkspaceScalarWhereWithAggregatesInput | WorkspaceScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Workspace"> | string
    name?: StringWithAggregatesFilter<"Workspace"> | string
    description?: StringNullableWithAggregatesFilter<"Workspace"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Workspace"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Workspace"> | Date | string
    createdBy?: StringWithAggregatesFilter<"Workspace"> | string
  }

  export type WorkspaceUserWhereInput = {
    AND?: WorkspaceUserWhereInput | WorkspaceUserWhereInput[]
    OR?: WorkspaceUserWhereInput[]
    NOT?: WorkspaceUserWhereInput | WorkspaceUserWhereInput[]
    id?: StringFilter<"WorkspaceUser"> | string
    userId?: StringFilter<"WorkspaceUser"> | string
    workspaceId?: StringFilter<"WorkspaceUser"> | string
    addedAt?: DateTimeFilter<"WorkspaceUser"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    workspace?: XOR<WorkspaceScalarRelationFilter, WorkspaceWhereInput>
  }

  export type WorkspaceUserOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    workspaceId?: SortOrder
    addedAt?: SortOrder
    user?: UserOrderByWithRelationInput
    workspace?: WorkspaceOrderByWithRelationInput
  }

  export type WorkspaceUserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId_workspaceId?: WorkspaceUserUserIdWorkspaceIdCompoundUniqueInput
    AND?: WorkspaceUserWhereInput | WorkspaceUserWhereInput[]
    OR?: WorkspaceUserWhereInput[]
    NOT?: WorkspaceUserWhereInput | WorkspaceUserWhereInput[]
    userId?: StringFilter<"WorkspaceUser"> | string
    workspaceId?: StringFilter<"WorkspaceUser"> | string
    addedAt?: DateTimeFilter<"WorkspaceUser"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    workspace?: XOR<WorkspaceScalarRelationFilter, WorkspaceWhereInput>
  }, "id" | "userId_workspaceId">

  export type WorkspaceUserOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    workspaceId?: SortOrder
    addedAt?: SortOrder
    _count?: WorkspaceUserCountOrderByAggregateInput
    _max?: WorkspaceUserMaxOrderByAggregateInput
    _min?: WorkspaceUserMinOrderByAggregateInput
  }

  export type WorkspaceUserScalarWhereWithAggregatesInput = {
    AND?: WorkspaceUserScalarWhereWithAggregatesInput | WorkspaceUserScalarWhereWithAggregatesInput[]
    OR?: WorkspaceUserScalarWhereWithAggregatesInput[]
    NOT?: WorkspaceUserScalarWhereWithAggregatesInput | WorkspaceUserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"WorkspaceUser"> | string
    userId?: StringWithAggregatesFilter<"WorkspaceUser"> | string
    workspaceId?: StringWithAggregatesFilter<"WorkspaceUser"> | string
    addedAt?: DateTimeWithAggregatesFilter<"WorkspaceUser"> | Date | string
  }

  export type DataTableWhereInput = {
    AND?: DataTableWhereInput | DataTableWhereInput[]
    OR?: DataTableWhereInput[]
    NOT?: DataTableWhereInput | DataTableWhereInput[]
    id?: StringFilter<"DataTable"> | string
    name?: StringFilter<"DataTable"> | string
    sheetName?: StringFilter<"DataTable"> | string
    workspaceId?: StringFilter<"DataTable"> | string
    uploadedAt?: DateTimeFilter<"DataTable"> | Date | string
    updatedAt?: DateTimeFilter<"DataTable"> | Date | string
    columns?: JsonFilter<"DataTable">
    data?: JsonFilter<"DataTable">
    workspace?: XOR<WorkspaceScalarRelationFilter, WorkspaceWhereInput>
  }

  export type DataTableOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    sheetName?: SortOrder
    workspaceId?: SortOrder
    uploadedAt?: SortOrder
    updatedAt?: SortOrder
    columns?: SortOrder
    data?: SortOrder
    workspace?: WorkspaceOrderByWithRelationInput
  }

  export type DataTableWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DataTableWhereInput | DataTableWhereInput[]
    OR?: DataTableWhereInput[]
    NOT?: DataTableWhereInput | DataTableWhereInput[]
    name?: StringFilter<"DataTable"> | string
    sheetName?: StringFilter<"DataTable"> | string
    workspaceId?: StringFilter<"DataTable"> | string
    uploadedAt?: DateTimeFilter<"DataTable"> | Date | string
    updatedAt?: DateTimeFilter<"DataTable"> | Date | string
    columns?: JsonFilter<"DataTable">
    data?: JsonFilter<"DataTable">
    workspace?: XOR<WorkspaceScalarRelationFilter, WorkspaceWhereInput>
  }, "id">

  export type DataTableOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    sheetName?: SortOrder
    workspaceId?: SortOrder
    uploadedAt?: SortOrder
    updatedAt?: SortOrder
    columns?: SortOrder
    data?: SortOrder
    _count?: DataTableCountOrderByAggregateInput
    _max?: DataTableMaxOrderByAggregateInput
    _min?: DataTableMinOrderByAggregateInput
  }

  export type DataTableScalarWhereWithAggregatesInput = {
    AND?: DataTableScalarWhereWithAggregatesInput | DataTableScalarWhereWithAggregatesInput[]
    OR?: DataTableScalarWhereWithAggregatesInput[]
    NOT?: DataTableScalarWhereWithAggregatesInput | DataTableScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DataTable"> | string
    name?: StringWithAggregatesFilter<"DataTable"> | string
    sheetName?: StringWithAggregatesFilter<"DataTable"> | string
    workspaceId?: StringWithAggregatesFilter<"DataTable"> | string
    uploadedAt?: DateTimeWithAggregatesFilter<"DataTable"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"DataTable"> | Date | string
    columns?: JsonWithAggregatesFilter<"DataTable">
    data?: JsonWithAggregatesFilter<"DataTable">
  }

  export type FormulaWhereInput = {
    AND?: FormulaWhereInput | FormulaWhereInput[]
    OR?: FormulaWhereInput[]
    NOT?: FormulaWhereInput | FormulaWhereInput[]
    id?: StringFilter<"Formula"> | string
    name?: StringFilter<"Formula"> | string
    description?: StringNullableFilter<"Formula"> | string | null
    formula?: StringFilter<"Formula"> | string
    workspaceId?: StringFilter<"Formula"> | string
    tableId?: StringNullableFilter<"Formula"> | string | null
    createdAt?: DateTimeFilter<"Formula"> | Date | string
    updatedAt?: DateTimeFilter<"Formula"> | Date | string
    color?: StringNullableFilter<"Formula"> | string | null
    workspace?: XOR<WorkspaceScalarRelationFilter, WorkspaceWhereInput>
  }

  export type FormulaOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    formula?: SortOrder
    workspaceId?: SortOrder
    tableId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    color?: SortOrderInput | SortOrder
    workspace?: WorkspaceOrderByWithRelationInput
  }

  export type FormulaWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: FormulaWhereInput | FormulaWhereInput[]
    OR?: FormulaWhereInput[]
    NOT?: FormulaWhereInput | FormulaWhereInput[]
    name?: StringFilter<"Formula"> | string
    description?: StringNullableFilter<"Formula"> | string | null
    formula?: StringFilter<"Formula"> | string
    workspaceId?: StringFilter<"Formula"> | string
    tableId?: StringNullableFilter<"Formula"> | string | null
    createdAt?: DateTimeFilter<"Formula"> | Date | string
    updatedAt?: DateTimeFilter<"Formula"> | Date | string
    color?: StringNullableFilter<"Formula"> | string | null
    workspace?: XOR<WorkspaceScalarRelationFilter, WorkspaceWhereInput>
  }, "id">

  export type FormulaOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    formula?: SortOrder
    workspaceId?: SortOrder
    tableId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    color?: SortOrderInput | SortOrder
    _count?: FormulaCountOrderByAggregateInput
    _max?: FormulaMaxOrderByAggregateInput
    _min?: FormulaMinOrderByAggregateInput
  }

  export type FormulaScalarWhereWithAggregatesInput = {
    AND?: FormulaScalarWhereWithAggregatesInput | FormulaScalarWhereWithAggregatesInput[]
    OR?: FormulaScalarWhereWithAggregatesInput[]
    NOT?: FormulaScalarWhereWithAggregatesInput | FormulaScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Formula"> | string
    name?: StringWithAggregatesFilter<"Formula"> | string
    description?: StringNullableWithAggregatesFilter<"Formula"> | string | null
    formula?: StringWithAggregatesFilter<"Formula"> | string
    workspaceId?: StringWithAggregatesFilter<"Formula"> | string
    tableId?: StringNullableWithAggregatesFilter<"Formula"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Formula"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Formula"> | Date | string
    color?: StringNullableWithAggregatesFilter<"Formula"> | string | null
  }

  export type UserCreateInput = {
    id?: string
    email: string
    name?: string | null
    password: string
    role?: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
    workspaces?: WorkspaceUserCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    name?: string | null
    password: string
    role?: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
    workspaces?: WorkspaceUserUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    workspaces?: WorkspaceUserUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    workspaces?: WorkspaceUserUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    name?: string | null
    password: string
    role?: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WorkspaceCreateInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: string
    users?: WorkspaceUserCreateNestedManyWithoutWorkspaceInput
    tables?: DataTableCreateNestedManyWithoutWorkspaceInput
    formulas?: FormulaCreateNestedManyWithoutWorkspaceInput
  }

  export type WorkspaceUncheckedCreateInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: string
    users?: WorkspaceUserUncheckedCreateNestedManyWithoutWorkspaceInput
    tables?: DataTableUncheckedCreateNestedManyWithoutWorkspaceInput
    formulas?: FormulaUncheckedCreateNestedManyWithoutWorkspaceInput
  }

  export type WorkspaceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
    users?: WorkspaceUserUpdateManyWithoutWorkspaceNestedInput
    tables?: DataTableUpdateManyWithoutWorkspaceNestedInput
    formulas?: FormulaUpdateManyWithoutWorkspaceNestedInput
  }

  export type WorkspaceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
    users?: WorkspaceUserUncheckedUpdateManyWithoutWorkspaceNestedInput
    tables?: DataTableUncheckedUpdateManyWithoutWorkspaceNestedInput
    formulas?: FormulaUncheckedUpdateManyWithoutWorkspaceNestedInput
  }

  export type WorkspaceCreateManyInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: string
  }

  export type WorkspaceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
  }

  export type WorkspaceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
  }

  export type WorkspaceUserCreateInput = {
    id?: string
    addedAt?: Date | string
    user: UserCreateNestedOneWithoutWorkspacesInput
    workspace: WorkspaceCreateNestedOneWithoutUsersInput
  }

  export type WorkspaceUserUncheckedCreateInput = {
    id?: string
    userId: string
    workspaceId: string
    addedAt?: Date | string
  }

  export type WorkspaceUserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    addedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutWorkspacesNestedInput
    workspace?: WorkspaceUpdateOneRequiredWithoutUsersNestedInput
  }

  export type WorkspaceUserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    workspaceId?: StringFieldUpdateOperationsInput | string
    addedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WorkspaceUserCreateManyInput = {
    id?: string
    userId: string
    workspaceId: string
    addedAt?: Date | string
  }

  export type WorkspaceUserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    addedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WorkspaceUserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    workspaceId?: StringFieldUpdateOperationsInput | string
    addedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DataTableCreateInput = {
    id?: string
    name: string
    sheetName: string
    uploadedAt?: Date | string
    updatedAt?: Date | string
    columns: JsonNullValueInput | InputJsonValue
    data: JsonNullValueInput | InputJsonValue
    workspace: WorkspaceCreateNestedOneWithoutTablesInput
  }

  export type DataTableUncheckedCreateInput = {
    id?: string
    name: string
    sheetName: string
    workspaceId: string
    uploadedAt?: Date | string
    updatedAt?: Date | string
    columns: JsonNullValueInput | InputJsonValue
    data: JsonNullValueInput | InputJsonValue
  }

  export type DataTableUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    sheetName?: StringFieldUpdateOperationsInput | string
    uploadedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    columns?: JsonNullValueInput | InputJsonValue
    data?: JsonNullValueInput | InputJsonValue
    workspace?: WorkspaceUpdateOneRequiredWithoutTablesNestedInput
  }

  export type DataTableUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    sheetName?: StringFieldUpdateOperationsInput | string
    workspaceId?: StringFieldUpdateOperationsInput | string
    uploadedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    columns?: JsonNullValueInput | InputJsonValue
    data?: JsonNullValueInput | InputJsonValue
  }

  export type DataTableCreateManyInput = {
    id?: string
    name: string
    sheetName: string
    workspaceId: string
    uploadedAt?: Date | string
    updatedAt?: Date | string
    columns: JsonNullValueInput | InputJsonValue
    data: JsonNullValueInput | InputJsonValue
  }

  export type DataTableUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    sheetName?: StringFieldUpdateOperationsInput | string
    uploadedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    columns?: JsonNullValueInput | InputJsonValue
    data?: JsonNullValueInput | InputJsonValue
  }

  export type DataTableUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    sheetName?: StringFieldUpdateOperationsInput | string
    workspaceId?: StringFieldUpdateOperationsInput | string
    uploadedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    columns?: JsonNullValueInput | InputJsonValue
    data?: JsonNullValueInput | InputJsonValue
  }

  export type FormulaCreateInput = {
    id?: string
    name: string
    description?: string | null
    formula: string
    tableId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    color?: string | null
    workspace: WorkspaceCreateNestedOneWithoutFormulasInput
  }

  export type FormulaUncheckedCreateInput = {
    id?: string
    name: string
    description?: string | null
    formula: string
    workspaceId: string
    tableId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    color?: string | null
  }

  export type FormulaUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    formula?: StringFieldUpdateOperationsInput | string
    tableId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    workspace?: WorkspaceUpdateOneRequiredWithoutFormulasNestedInput
  }

  export type FormulaUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    formula?: StringFieldUpdateOperationsInput | string
    workspaceId?: StringFieldUpdateOperationsInput | string
    tableId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type FormulaCreateManyInput = {
    id?: string
    name: string
    description?: string | null
    formula: string
    workspaceId: string
    tableId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    color?: string | null
  }

  export type FormulaUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    formula?: StringFieldUpdateOperationsInput | string
    tableId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type FormulaUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    formula?: StringFieldUpdateOperationsInput | string
    workspaceId?: StringFieldUpdateOperationsInput | string
    tableId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type EnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type WorkspaceUserListRelationFilter = {
    every?: WorkspaceUserWhereInput
    some?: WorkspaceUserWhereInput
    none?: WorkspaceUserWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type WorkspaceUserOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type EnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserRoleFilter<$PrismaModel>
    _max?: NestedEnumUserRoleFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DataTableListRelationFilter = {
    every?: DataTableWhereInput
    some?: DataTableWhereInput
    none?: DataTableWhereInput
  }

  export type FormulaListRelationFilter = {
    every?: FormulaWhereInput
    some?: FormulaWhereInput
    none?: FormulaWhereInput
  }

  export type DataTableOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type FormulaOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type WorkspaceCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
  }

  export type WorkspaceMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
  }

  export type WorkspaceMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type WorkspaceScalarRelationFilter = {
    is?: WorkspaceWhereInput
    isNot?: WorkspaceWhereInput
  }

  export type WorkspaceUserUserIdWorkspaceIdCompoundUniqueInput = {
    userId: string
    workspaceId: string
  }

  export type WorkspaceUserCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    workspaceId?: SortOrder
    addedAt?: SortOrder
  }

  export type WorkspaceUserMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    workspaceId?: SortOrder
    addedAt?: SortOrder
  }

  export type WorkspaceUserMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    workspaceId?: SortOrder
    addedAt?: SortOrder
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type DataTableCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    sheetName?: SortOrder
    workspaceId?: SortOrder
    uploadedAt?: SortOrder
    updatedAt?: SortOrder
    columns?: SortOrder
    data?: SortOrder
  }

  export type DataTableMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    sheetName?: SortOrder
    workspaceId?: SortOrder
    uploadedAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DataTableMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    sheetName?: SortOrder
    workspaceId?: SortOrder
    uploadedAt?: SortOrder
    updatedAt?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type FormulaCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    formula?: SortOrder
    workspaceId?: SortOrder
    tableId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    color?: SortOrder
  }

  export type FormulaMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    formula?: SortOrder
    workspaceId?: SortOrder
    tableId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    color?: SortOrder
  }

  export type FormulaMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    formula?: SortOrder
    workspaceId?: SortOrder
    tableId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    color?: SortOrder
  }

  export type WorkspaceUserCreateNestedManyWithoutUserInput = {
    create?: XOR<WorkspaceUserCreateWithoutUserInput, WorkspaceUserUncheckedCreateWithoutUserInput> | WorkspaceUserCreateWithoutUserInput[] | WorkspaceUserUncheckedCreateWithoutUserInput[]
    connectOrCreate?: WorkspaceUserCreateOrConnectWithoutUserInput | WorkspaceUserCreateOrConnectWithoutUserInput[]
    createMany?: WorkspaceUserCreateManyUserInputEnvelope
    connect?: WorkspaceUserWhereUniqueInput | WorkspaceUserWhereUniqueInput[]
  }

  export type WorkspaceUserUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<WorkspaceUserCreateWithoutUserInput, WorkspaceUserUncheckedCreateWithoutUserInput> | WorkspaceUserCreateWithoutUserInput[] | WorkspaceUserUncheckedCreateWithoutUserInput[]
    connectOrCreate?: WorkspaceUserCreateOrConnectWithoutUserInput | WorkspaceUserCreateOrConnectWithoutUserInput[]
    createMany?: WorkspaceUserCreateManyUserInputEnvelope
    connect?: WorkspaceUserWhereUniqueInput | WorkspaceUserWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type EnumUserRoleFieldUpdateOperationsInput = {
    set?: $Enums.UserRole
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type WorkspaceUserUpdateManyWithoutUserNestedInput = {
    create?: XOR<WorkspaceUserCreateWithoutUserInput, WorkspaceUserUncheckedCreateWithoutUserInput> | WorkspaceUserCreateWithoutUserInput[] | WorkspaceUserUncheckedCreateWithoutUserInput[]
    connectOrCreate?: WorkspaceUserCreateOrConnectWithoutUserInput | WorkspaceUserCreateOrConnectWithoutUserInput[]
    upsert?: WorkspaceUserUpsertWithWhereUniqueWithoutUserInput | WorkspaceUserUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: WorkspaceUserCreateManyUserInputEnvelope
    set?: WorkspaceUserWhereUniqueInput | WorkspaceUserWhereUniqueInput[]
    disconnect?: WorkspaceUserWhereUniqueInput | WorkspaceUserWhereUniqueInput[]
    delete?: WorkspaceUserWhereUniqueInput | WorkspaceUserWhereUniqueInput[]
    connect?: WorkspaceUserWhereUniqueInput | WorkspaceUserWhereUniqueInput[]
    update?: WorkspaceUserUpdateWithWhereUniqueWithoutUserInput | WorkspaceUserUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: WorkspaceUserUpdateManyWithWhereWithoutUserInput | WorkspaceUserUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: WorkspaceUserScalarWhereInput | WorkspaceUserScalarWhereInput[]
  }

  export type WorkspaceUserUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<WorkspaceUserCreateWithoutUserInput, WorkspaceUserUncheckedCreateWithoutUserInput> | WorkspaceUserCreateWithoutUserInput[] | WorkspaceUserUncheckedCreateWithoutUserInput[]
    connectOrCreate?: WorkspaceUserCreateOrConnectWithoutUserInput | WorkspaceUserCreateOrConnectWithoutUserInput[]
    upsert?: WorkspaceUserUpsertWithWhereUniqueWithoutUserInput | WorkspaceUserUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: WorkspaceUserCreateManyUserInputEnvelope
    set?: WorkspaceUserWhereUniqueInput | WorkspaceUserWhereUniqueInput[]
    disconnect?: WorkspaceUserWhereUniqueInput | WorkspaceUserWhereUniqueInput[]
    delete?: WorkspaceUserWhereUniqueInput | WorkspaceUserWhereUniqueInput[]
    connect?: WorkspaceUserWhereUniqueInput | WorkspaceUserWhereUniqueInput[]
    update?: WorkspaceUserUpdateWithWhereUniqueWithoutUserInput | WorkspaceUserUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: WorkspaceUserUpdateManyWithWhereWithoutUserInput | WorkspaceUserUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: WorkspaceUserScalarWhereInput | WorkspaceUserScalarWhereInput[]
  }

  export type WorkspaceUserCreateNestedManyWithoutWorkspaceInput = {
    create?: XOR<WorkspaceUserCreateWithoutWorkspaceInput, WorkspaceUserUncheckedCreateWithoutWorkspaceInput> | WorkspaceUserCreateWithoutWorkspaceInput[] | WorkspaceUserUncheckedCreateWithoutWorkspaceInput[]
    connectOrCreate?: WorkspaceUserCreateOrConnectWithoutWorkspaceInput | WorkspaceUserCreateOrConnectWithoutWorkspaceInput[]
    createMany?: WorkspaceUserCreateManyWorkspaceInputEnvelope
    connect?: WorkspaceUserWhereUniqueInput | WorkspaceUserWhereUniqueInput[]
  }

  export type DataTableCreateNestedManyWithoutWorkspaceInput = {
    create?: XOR<DataTableCreateWithoutWorkspaceInput, DataTableUncheckedCreateWithoutWorkspaceInput> | DataTableCreateWithoutWorkspaceInput[] | DataTableUncheckedCreateWithoutWorkspaceInput[]
    connectOrCreate?: DataTableCreateOrConnectWithoutWorkspaceInput | DataTableCreateOrConnectWithoutWorkspaceInput[]
    createMany?: DataTableCreateManyWorkspaceInputEnvelope
    connect?: DataTableWhereUniqueInput | DataTableWhereUniqueInput[]
  }

  export type FormulaCreateNestedManyWithoutWorkspaceInput = {
    create?: XOR<FormulaCreateWithoutWorkspaceInput, FormulaUncheckedCreateWithoutWorkspaceInput> | FormulaCreateWithoutWorkspaceInput[] | FormulaUncheckedCreateWithoutWorkspaceInput[]
    connectOrCreate?: FormulaCreateOrConnectWithoutWorkspaceInput | FormulaCreateOrConnectWithoutWorkspaceInput[]
    createMany?: FormulaCreateManyWorkspaceInputEnvelope
    connect?: FormulaWhereUniqueInput | FormulaWhereUniqueInput[]
  }

  export type WorkspaceUserUncheckedCreateNestedManyWithoutWorkspaceInput = {
    create?: XOR<WorkspaceUserCreateWithoutWorkspaceInput, WorkspaceUserUncheckedCreateWithoutWorkspaceInput> | WorkspaceUserCreateWithoutWorkspaceInput[] | WorkspaceUserUncheckedCreateWithoutWorkspaceInput[]
    connectOrCreate?: WorkspaceUserCreateOrConnectWithoutWorkspaceInput | WorkspaceUserCreateOrConnectWithoutWorkspaceInput[]
    createMany?: WorkspaceUserCreateManyWorkspaceInputEnvelope
    connect?: WorkspaceUserWhereUniqueInput | WorkspaceUserWhereUniqueInput[]
  }

  export type DataTableUncheckedCreateNestedManyWithoutWorkspaceInput = {
    create?: XOR<DataTableCreateWithoutWorkspaceInput, DataTableUncheckedCreateWithoutWorkspaceInput> | DataTableCreateWithoutWorkspaceInput[] | DataTableUncheckedCreateWithoutWorkspaceInput[]
    connectOrCreate?: DataTableCreateOrConnectWithoutWorkspaceInput | DataTableCreateOrConnectWithoutWorkspaceInput[]
    createMany?: DataTableCreateManyWorkspaceInputEnvelope
    connect?: DataTableWhereUniqueInput | DataTableWhereUniqueInput[]
  }

  export type FormulaUncheckedCreateNestedManyWithoutWorkspaceInput = {
    create?: XOR<FormulaCreateWithoutWorkspaceInput, FormulaUncheckedCreateWithoutWorkspaceInput> | FormulaCreateWithoutWorkspaceInput[] | FormulaUncheckedCreateWithoutWorkspaceInput[]
    connectOrCreate?: FormulaCreateOrConnectWithoutWorkspaceInput | FormulaCreateOrConnectWithoutWorkspaceInput[]
    createMany?: FormulaCreateManyWorkspaceInputEnvelope
    connect?: FormulaWhereUniqueInput | FormulaWhereUniqueInput[]
  }

  export type WorkspaceUserUpdateManyWithoutWorkspaceNestedInput = {
    create?: XOR<WorkspaceUserCreateWithoutWorkspaceInput, WorkspaceUserUncheckedCreateWithoutWorkspaceInput> | WorkspaceUserCreateWithoutWorkspaceInput[] | WorkspaceUserUncheckedCreateWithoutWorkspaceInput[]
    connectOrCreate?: WorkspaceUserCreateOrConnectWithoutWorkspaceInput | WorkspaceUserCreateOrConnectWithoutWorkspaceInput[]
    upsert?: WorkspaceUserUpsertWithWhereUniqueWithoutWorkspaceInput | WorkspaceUserUpsertWithWhereUniqueWithoutWorkspaceInput[]
    createMany?: WorkspaceUserCreateManyWorkspaceInputEnvelope
    set?: WorkspaceUserWhereUniqueInput | WorkspaceUserWhereUniqueInput[]
    disconnect?: WorkspaceUserWhereUniqueInput | WorkspaceUserWhereUniqueInput[]
    delete?: WorkspaceUserWhereUniqueInput | WorkspaceUserWhereUniqueInput[]
    connect?: WorkspaceUserWhereUniqueInput | WorkspaceUserWhereUniqueInput[]
    update?: WorkspaceUserUpdateWithWhereUniqueWithoutWorkspaceInput | WorkspaceUserUpdateWithWhereUniqueWithoutWorkspaceInput[]
    updateMany?: WorkspaceUserUpdateManyWithWhereWithoutWorkspaceInput | WorkspaceUserUpdateManyWithWhereWithoutWorkspaceInput[]
    deleteMany?: WorkspaceUserScalarWhereInput | WorkspaceUserScalarWhereInput[]
  }

  export type DataTableUpdateManyWithoutWorkspaceNestedInput = {
    create?: XOR<DataTableCreateWithoutWorkspaceInput, DataTableUncheckedCreateWithoutWorkspaceInput> | DataTableCreateWithoutWorkspaceInput[] | DataTableUncheckedCreateWithoutWorkspaceInput[]
    connectOrCreate?: DataTableCreateOrConnectWithoutWorkspaceInput | DataTableCreateOrConnectWithoutWorkspaceInput[]
    upsert?: DataTableUpsertWithWhereUniqueWithoutWorkspaceInput | DataTableUpsertWithWhereUniqueWithoutWorkspaceInput[]
    createMany?: DataTableCreateManyWorkspaceInputEnvelope
    set?: DataTableWhereUniqueInput | DataTableWhereUniqueInput[]
    disconnect?: DataTableWhereUniqueInput | DataTableWhereUniqueInput[]
    delete?: DataTableWhereUniqueInput | DataTableWhereUniqueInput[]
    connect?: DataTableWhereUniqueInput | DataTableWhereUniqueInput[]
    update?: DataTableUpdateWithWhereUniqueWithoutWorkspaceInput | DataTableUpdateWithWhereUniqueWithoutWorkspaceInput[]
    updateMany?: DataTableUpdateManyWithWhereWithoutWorkspaceInput | DataTableUpdateManyWithWhereWithoutWorkspaceInput[]
    deleteMany?: DataTableScalarWhereInput | DataTableScalarWhereInput[]
  }

  export type FormulaUpdateManyWithoutWorkspaceNestedInput = {
    create?: XOR<FormulaCreateWithoutWorkspaceInput, FormulaUncheckedCreateWithoutWorkspaceInput> | FormulaCreateWithoutWorkspaceInput[] | FormulaUncheckedCreateWithoutWorkspaceInput[]
    connectOrCreate?: FormulaCreateOrConnectWithoutWorkspaceInput | FormulaCreateOrConnectWithoutWorkspaceInput[]
    upsert?: FormulaUpsertWithWhereUniqueWithoutWorkspaceInput | FormulaUpsertWithWhereUniqueWithoutWorkspaceInput[]
    createMany?: FormulaCreateManyWorkspaceInputEnvelope
    set?: FormulaWhereUniqueInput | FormulaWhereUniqueInput[]
    disconnect?: FormulaWhereUniqueInput | FormulaWhereUniqueInput[]
    delete?: FormulaWhereUniqueInput | FormulaWhereUniqueInput[]
    connect?: FormulaWhereUniqueInput | FormulaWhereUniqueInput[]
    update?: FormulaUpdateWithWhereUniqueWithoutWorkspaceInput | FormulaUpdateWithWhereUniqueWithoutWorkspaceInput[]
    updateMany?: FormulaUpdateManyWithWhereWithoutWorkspaceInput | FormulaUpdateManyWithWhereWithoutWorkspaceInput[]
    deleteMany?: FormulaScalarWhereInput | FormulaScalarWhereInput[]
  }

  export type WorkspaceUserUncheckedUpdateManyWithoutWorkspaceNestedInput = {
    create?: XOR<WorkspaceUserCreateWithoutWorkspaceInput, WorkspaceUserUncheckedCreateWithoutWorkspaceInput> | WorkspaceUserCreateWithoutWorkspaceInput[] | WorkspaceUserUncheckedCreateWithoutWorkspaceInput[]
    connectOrCreate?: WorkspaceUserCreateOrConnectWithoutWorkspaceInput | WorkspaceUserCreateOrConnectWithoutWorkspaceInput[]
    upsert?: WorkspaceUserUpsertWithWhereUniqueWithoutWorkspaceInput | WorkspaceUserUpsertWithWhereUniqueWithoutWorkspaceInput[]
    createMany?: WorkspaceUserCreateManyWorkspaceInputEnvelope
    set?: WorkspaceUserWhereUniqueInput | WorkspaceUserWhereUniqueInput[]
    disconnect?: WorkspaceUserWhereUniqueInput | WorkspaceUserWhereUniqueInput[]
    delete?: WorkspaceUserWhereUniqueInput | WorkspaceUserWhereUniqueInput[]
    connect?: WorkspaceUserWhereUniqueInput | WorkspaceUserWhereUniqueInput[]
    update?: WorkspaceUserUpdateWithWhereUniqueWithoutWorkspaceInput | WorkspaceUserUpdateWithWhereUniqueWithoutWorkspaceInput[]
    updateMany?: WorkspaceUserUpdateManyWithWhereWithoutWorkspaceInput | WorkspaceUserUpdateManyWithWhereWithoutWorkspaceInput[]
    deleteMany?: WorkspaceUserScalarWhereInput | WorkspaceUserScalarWhereInput[]
  }

  export type DataTableUncheckedUpdateManyWithoutWorkspaceNestedInput = {
    create?: XOR<DataTableCreateWithoutWorkspaceInput, DataTableUncheckedCreateWithoutWorkspaceInput> | DataTableCreateWithoutWorkspaceInput[] | DataTableUncheckedCreateWithoutWorkspaceInput[]
    connectOrCreate?: DataTableCreateOrConnectWithoutWorkspaceInput | DataTableCreateOrConnectWithoutWorkspaceInput[]
    upsert?: DataTableUpsertWithWhereUniqueWithoutWorkspaceInput | DataTableUpsertWithWhereUniqueWithoutWorkspaceInput[]
    createMany?: DataTableCreateManyWorkspaceInputEnvelope
    set?: DataTableWhereUniqueInput | DataTableWhereUniqueInput[]
    disconnect?: DataTableWhereUniqueInput | DataTableWhereUniqueInput[]
    delete?: DataTableWhereUniqueInput | DataTableWhereUniqueInput[]
    connect?: DataTableWhereUniqueInput | DataTableWhereUniqueInput[]
    update?: DataTableUpdateWithWhereUniqueWithoutWorkspaceInput | DataTableUpdateWithWhereUniqueWithoutWorkspaceInput[]
    updateMany?: DataTableUpdateManyWithWhereWithoutWorkspaceInput | DataTableUpdateManyWithWhereWithoutWorkspaceInput[]
    deleteMany?: DataTableScalarWhereInput | DataTableScalarWhereInput[]
  }

  export type FormulaUncheckedUpdateManyWithoutWorkspaceNestedInput = {
    create?: XOR<FormulaCreateWithoutWorkspaceInput, FormulaUncheckedCreateWithoutWorkspaceInput> | FormulaCreateWithoutWorkspaceInput[] | FormulaUncheckedCreateWithoutWorkspaceInput[]
    connectOrCreate?: FormulaCreateOrConnectWithoutWorkspaceInput | FormulaCreateOrConnectWithoutWorkspaceInput[]
    upsert?: FormulaUpsertWithWhereUniqueWithoutWorkspaceInput | FormulaUpsertWithWhereUniqueWithoutWorkspaceInput[]
    createMany?: FormulaCreateManyWorkspaceInputEnvelope
    set?: FormulaWhereUniqueInput | FormulaWhereUniqueInput[]
    disconnect?: FormulaWhereUniqueInput | FormulaWhereUniqueInput[]
    delete?: FormulaWhereUniqueInput | FormulaWhereUniqueInput[]
    connect?: FormulaWhereUniqueInput | FormulaWhereUniqueInput[]
    update?: FormulaUpdateWithWhereUniqueWithoutWorkspaceInput | FormulaUpdateWithWhereUniqueWithoutWorkspaceInput[]
    updateMany?: FormulaUpdateManyWithWhereWithoutWorkspaceInput | FormulaUpdateManyWithWhereWithoutWorkspaceInput[]
    deleteMany?: FormulaScalarWhereInput | FormulaScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutWorkspacesInput = {
    create?: XOR<UserCreateWithoutWorkspacesInput, UserUncheckedCreateWithoutWorkspacesInput>
    connectOrCreate?: UserCreateOrConnectWithoutWorkspacesInput
    connect?: UserWhereUniqueInput
  }

  export type WorkspaceCreateNestedOneWithoutUsersInput = {
    create?: XOR<WorkspaceCreateWithoutUsersInput, WorkspaceUncheckedCreateWithoutUsersInput>
    connectOrCreate?: WorkspaceCreateOrConnectWithoutUsersInput
    connect?: WorkspaceWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutWorkspacesNestedInput = {
    create?: XOR<UserCreateWithoutWorkspacesInput, UserUncheckedCreateWithoutWorkspacesInput>
    connectOrCreate?: UserCreateOrConnectWithoutWorkspacesInput
    upsert?: UserUpsertWithoutWorkspacesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutWorkspacesInput, UserUpdateWithoutWorkspacesInput>, UserUncheckedUpdateWithoutWorkspacesInput>
  }

  export type WorkspaceUpdateOneRequiredWithoutUsersNestedInput = {
    create?: XOR<WorkspaceCreateWithoutUsersInput, WorkspaceUncheckedCreateWithoutUsersInput>
    connectOrCreate?: WorkspaceCreateOrConnectWithoutUsersInput
    upsert?: WorkspaceUpsertWithoutUsersInput
    connect?: WorkspaceWhereUniqueInput
    update?: XOR<XOR<WorkspaceUpdateToOneWithWhereWithoutUsersInput, WorkspaceUpdateWithoutUsersInput>, WorkspaceUncheckedUpdateWithoutUsersInput>
  }

  export type WorkspaceCreateNestedOneWithoutTablesInput = {
    create?: XOR<WorkspaceCreateWithoutTablesInput, WorkspaceUncheckedCreateWithoutTablesInput>
    connectOrCreate?: WorkspaceCreateOrConnectWithoutTablesInput
    connect?: WorkspaceWhereUniqueInput
  }

  export type WorkspaceUpdateOneRequiredWithoutTablesNestedInput = {
    create?: XOR<WorkspaceCreateWithoutTablesInput, WorkspaceUncheckedCreateWithoutTablesInput>
    connectOrCreate?: WorkspaceCreateOrConnectWithoutTablesInput
    upsert?: WorkspaceUpsertWithoutTablesInput
    connect?: WorkspaceWhereUniqueInput
    update?: XOR<XOR<WorkspaceUpdateToOneWithWhereWithoutTablesInput, WorkspaceUpdateWithoutTablesInput>, WorkspaceUncheckedUpdateWithoutTablesInput>
  }

  export type WorkspaceCreateNestedOneWithoutFormulasInput = {
    create?: XOR<WorkspaceCreateWithoutFormulasInput, WorkspaceUncheckedCreateWithoutFormulasInput>
    connectOrCreate?: WorkspaceCreateOrConnectWithoutFormulasInput
    connect?: WorkspaceWhereUniqueInput
  }

  export type WorkspaceUpdateOneRequiredWithoutFormulasNestedInput = {
    create?: XOR<WorkspaceCreateWithoutFormulasInput, WorkspaceUncheckedCreateWithoutFormulasInput>
    connectOrCreate?: WorkspaceCreateOrConnectWithoutFormulasInput
    upsert?: WorkspaceUpsertWithoutFormulasInput
    connect?: WorkspaceWhereUniqueInput
    update?: XOR<XOR<WorkspaceUpdateToOneWithWhereWithoutFormulasInput, WorkspaceUpdateWithoutFormulasInput>, WorkspaceUncheckedUpdateWithoutFormulasInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserRoleFilter<$PrismaModel>
    _max?: NestedEnumUserRoleFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type WorkspaceUserCreateWithoutUserInput = {
    id?: string
    addedAt?: Date | string
    workspace: WorkspaceCreateNestedOneWithoutUsersInput
  }

  export type WorkspaceUserUncheckedCreateWithoutUserInput = {
    id?: string
    workspaceId: string
    addedAt?: Date | string
  }

  export type WorkspaceUserCreateOrConnectWithoutUserInput = {
    where: WorkspaceUserWhereUniqueInput
    create: XOR<WorkspaceUserCreateWithoutUserInput, WorkspaceUserUncheckedCreateWithoutUserInput>
  }

  export type WorkspaceUserCreateManyUserInputEnvelope = {
    data: WorkspaceUserCreateManyUserInput | WorkspaceUserCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type WorkspaceUserUpsertWithWhereUniqueWithoutUserInput = {
    where: WorkspaceUserWhereUniqueInput
    update: XOR<WorkspaceUserUpdateWithoutUserInput, WorkspaceUserUncheckedUpdateWithoutUserInput>
    create: XOR<WorkspaceUserCreateWithoutUserInput, WorkspaceUserUncheckedCreateWithoutUserInput>
  }

  export type WorkspaceUserUpdateWithWhereUniqueWithoutUserInput = {
    where: WorkspaceUserWhereUniqueInput
    data: XOR<WorkspaceUserUpdateWithoutUserInput, WorkspaceUserUncheckedUpdateWithoutUserInput>
  }

  export type WorkspaceUserUpdateManyWithWhereWithoutUserInput = {
    where: WorkspaceUserScalarWhereInput
    data: XOR<WorkspaceUserUpdateManyMutationInput, WorkspaceUserUncheckedUpdateManyWithoutUserInput>
  }

  export type WorkspaceUserScalarWhereInput = {
    AND?: WorkspaceUserScalarWhereInput | WorkspaceUserScalarWhereInput[]
    OR?: WorkspaceUserScalarWhereInput[]
    NOT?: WorkspaceUserScalarWhereInput | WorkspaceUserScalarWhereInput[]
    id?: StringFilter<"WorkspaceUser"> | string
    userId?: StringFilter<"WorkspaceUser"> | string
    workspaceId?: StringFilter<"WorkspaceUser"> | string
    addedAt?: DateTimeFilter<"WorkspaceUser"> | Date | string
  }

  export type WorkspaceUserCreateWithoutWorkspaceInput = {
    id?: string
    addedAt?: Date | string
    user: UserCreateNestedOneWithoutWorkspacesInput
  }

  export type WorkspaceUserUncheckedCreateWithoutWorkspaceInput = {
    id?: string
    userId: string
    addedAt?: Date | string
  }

  export type WorkspaceUserCreateOrConnectWithoutWorkspaceInput = {
    where: WorkspaceUserWhereUniqueInput
    create: XOR<WorkspaceUserCreateWithoutWorkspaceInput, WorkspaceUserUncheckedCreateWithoutWorkspaceInput>
  }

  export type WorkspaceUserCreateManyWorkspaceInputEnvelope = {
    data: WorkspaceUserCreateManyWorkspaceInput | WorkspaceUserCreateManyWorkspaceInput[]
    skipDuplicates?: boolean
  }

  export type DataTableCreateWithoutWorkspaceInput = {
    id?: string
    name: string
    sheetName: string
    uploadedAt?: Date | string
    updatedAt?: Date | string
    columns: JsonNullValueInput | InputJsonValue
    data: JsonNullValueInput | InputJsonValue
  }

  export type DataTableUncheckedCreateWithoutWorkspaceInput = {
    id?: string
    name: string
    sheetName: string
    uploadedAt?: Date | string
    updatedAt?: Date | string
    columns: JsonNullValueInput | InputJsonValue
    data: JsonNullValueInput | InputJsonValue
  }

  export type DataTableCreateOrConnectWithoutWorkspaceInput = {
    where: DataTableWhereUniqueInput
    create: XOR<DataTableCreateWithoutWorkspaceInput, DataTableUncheckedCreateWithoutWorkspaceInput>
  }

  export type DataTableCreateManyWorkspaceInputEnvelope = {
    data: DataTableCreateManyWorkspaceInput | DataTableCreateManyWorkspaceInput[]
    skipDuplicates?: boolean
  }

  export type FormulaCreateWithoutWorkspaceInput = {
    id?: string
    name: string
    description?: string | null
    formula: string
    tableId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    color?: string | null
  }

  export type FormulaUncheckedCreateWithoutWorkspaceInput = {
    id?: string
    name: string
    description?: string | null
    formula: string
    tableId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    color?: string | null
  }

  export type FormulaCreateOrConnectWithoutWorkspaceInput = {
    where: FormulaWhereUniqueInput
    create: XOR<FormulaCreateWithoutWorkspaceInput, FormulaUncheckedCreateWithoutWorkspaceInput>
  }

  export type FormulaCreateManyWorkspaceInputEnvelope = {
    data: FormulaCreateManyWorkspaceInput | FormulaCreateManyWorkspaceInput[]
    skipDuplicates?: boolean
  }

  export type WorkspaceUserUpsertWithWhereUniqueWithoutWorkspaceInput = {
    where: WorkspaceUserWhereUniqueInput
    update: XOR<WorkspaceUserUpdateWithoutWorkspaceInput, WorkspaceUserUncheckedUpdateWithoutWorkspaceInput>
    create: XOR<WorkspaceUserCreateWithoutWorkspaceInput, WorkspaceUserUncheckedCreateWithoutWorkspaceInput>
  }

  export type WorkspaceUserUpdateWithWhereUniqueWithoutWorkspaceInput = {
    where: WorkspaceUserWhereUniqueInput
    data: XOR<WorkspaceUserUpdateWithoutWorkspaceInput, WorkspaceUserUncheckedUpdateWithoutWorkspaceInput>
  }

  export type WorkspaceUserUpdateManyWithWhereWithoutWorkspaceInput = {
    where: WorkspaceUserScalarWhereInput
    data: XOR<WorkspaceUserUpdateManyMutationInput, WorkspaceUserUncheckedUpdateManyWithoutWorkspaceInput>
  }

  export type DataTableUpsertWithWhereUniqueWithoutWorkspaceInput = {
    where: DataTableWhereUniqueInput
    update: XOR<DataTableUpdateWithoutWorkspaceInput, DataTableUncheckedUpdateWithoutWorkspaceInput>
    create: XOR<DataTableCreateWithoutWorkspaceInput, DataTableUncheckedCreateWithoutWorkspaceInput>
  }

  export type DataTableUpdateWithWhereUniqueWithoutWorkspaceInput = {
    where: DataTableWhereUniqueInput
    data: XOR<DataTableUpdateWithoutWorkspaceInput, DataTableUncheckedUpdateWithoutWorkspaceInput>
  }

  export type DataTableUpdateManyWithWhereWithoutWorkspaceInput = {
    where: DataTableScalarWhereInput
    data: XOR<DataTableUpdateManyMutationInput, DataTableUncheckedUpdateManyWithoutWorkspaceInput>
  }

  export type DataTableScalarWhereInput = {
    AND?: DataTableScalarWhereInput | DataTableScalarWhereInput[]
    OR?: DataTableScalarWhereInput[]
    NOT?: DataTableScalarWhereInput | DataTableScalarWhereInput[]
    id?: StringFilter<"DataTable"> | string
    name?: StringFilter<"DataTable"> | string
    sheetName?: StringFilter<"DataTable"> | string
    workspaceId?: StringFilter<"DataTable"> | string
    uploadedAt?: DateTimeFilter<"DataTable"> | Date | string
    updatedAt?: DateTimeFilter<"DataTable"> | Date | string
    columns?: JsonFilter<"DataTable">
    data?: JsonFilter<"DataTable">
  }

  export type FormulaUpsertWithWhereUniqueWithoutWorkspaceInput = {
    where: FormulaWhereUniqueInput
    update: XOR<FormulaUpdateWithoutWorkspaceInput, FormulaUncheckedUpdateWithoutWorkspaceInput>
    create: XOR<FormulaCreateWithoutWorkspaceInput, FormulaUncheckedCreateWithoutWorkspaceInput>
  }

  export type FormulaUpdateWithWhereUniqueWithoutWorkspaceInput = {
    where: FormulaWhereUniqueInput
    data: XOR<FormulaUpdateWithoutWorkspaceInput, FormulaUncheckedUpdateWithoutWorkspaceInput>
  }

  export type FormulaUpdateManyWithWhereWithoutWorkspaceInput = {
    where: FormulaScalarWhereInput
    data: XOR<FormulaUpdateManyMutationInput, FormulaUncheckedUpdateManyWithoutWorkspaceInput>
  }

  export type FormulaScalarWhereInput = {
    AND?: FormulaScalarWhereInput | FormulaScalarWhereInput[]
    OR?: FormulaScalarWhereInput[]
    NOT?: FormulaScalarWhereInput | FormulaScalarWhereInput[]
    id?: StringFilter<"Formula"> | string
    name?: StringFilter<"Formula"> | string
    description?: StringNullableFilter<"Formula"> | string | null
    formula?: StringFilter<"Formula"> | string
    workspaceId?: StringFilter<"Formula"> | string
    tableId?: StringNullableFilter<"Formula"> | string | null
    createdAt?: DateTimeFilter<"Formula"> | Date | string
    updatedAt?: DateTimeFilter<"Formula"> | Date | string
    color?: StringNullableFilter<"Formula"> | string | null
  }

  export type UserCreateWithoutWorkspacesInput = {
    id?: string
    email: string
    name?: string | null
    password: string
    role?: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUncheckedCreateWithoutWorkspacesInput = {
    id?: string
    email: string
    name?: string | null
    password: string
    role?: $Enums.UserRole
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserCreateOrConnectWithoutWorkspacesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutWorkspacesInput, UserUncheckedCreateWithoutWorkspacesInput>
  }

  export type WorkspaceCreateWithoutUsersInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: string
    tables?: DataTableCreateNestedManyWithoutWorkspaceInput
    formulas?: FormulaCreateNestedManyWithoutWorkspaceInput
  }

  export type WorkspaceUncheckedCreateWithoutUsersInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: string
    tables?: DataTableUncheckedCreateNestedManyWithoutWorkspaceInput
    formulas?: FormulaUncheckedCreateNestedManyWithoutWorkspaceInput
  }

  export type WorkspaceCreateOrConnectWithoutUsersInput = {
    where: WorkspaceWhereUniqueInput
    create: XOR<WorkspaceCreateWithoutUsersInput, WorkspaceUncheckedCreateWithoutUsersInput>
  }

  export type UserUpsertWithoutWorkspacesInput = {
    update: XOR<UserUpdateWithoutWorkspacesInput, UserUncheckedUpdateWithoutWorkspacesInput>
    create: XOR<UserCreateWithoutWorkspacesInput, UserUncheckedCreateWithoutWorkspacesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutWorkspacesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutWorkspacesInput, UserUncheckedUpdateWithoutWorkspacesInput>
  }

  export type UserUpdateWithoutWorkspacesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateWithoutWorkspacesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WorkspaceUpsertWithoutUsersInput = {
    update: XOR<WorkspaceUpdateWithoutUsersInput, WorkspaceUncheckedUpdateWithoutUsersInput>
    create: XOR<WorkspaceCreateWithoutUsersInput, WorkspaceUncheckedCreateWithoutUsersInput>
    where?: WorkspaceWhereInput
  }

  export type WorkspaceUpdateToOneWithWhereWithoutUsersInput = {
    where?: WorkspaceWhereInput
    data: XOR<WorkspaceUpdateWithoutUsersInput, WorkspaceUncheckedUpdateWithoutUsersInput>
  }

  export type WorkspaceUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
    tables?: DataTableUpdateManyWithoutWorkspaceNestedInput
    formulas?: FormulaUpdateManyWithoutWorkspaceNestedInput
  }

  export type WorkspaceUncheckedUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
    tables?: DataTableUncheckedUpdateManyWithoutWorkspaceNestedInput
    formulas?: FormulaUncheckedUpdateManyWithoutWorkspaceNestedInput
  }

  export type WorkspaceCreateWithoutTablesInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: string
    users?: WorkspaceUserCreateNestedManyWithoutWorkspaceInput
    formulas?: FormulaCreateNestedManyWithoutWorkspaceInput
  }

  export type WorkspaceUncheckedCreateWithoutTablesInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: string
    users?: WorkspaceUserUncheckedCreateNestedManyWithoutWorkspaceInput
    formulas?: FormulaUncheckedCreateNestedManyWithoutWorkspaceInput
  }

  export type WorkspaceCreateOrConnectWithoutTablesInput = {
    where: WorkspaceWhereUniqueInput
    create: XOR<WorkspaceCreateWithoutTablesInput, WorkspaceUncheckedCreateWithoutTablesInput>
  }

  export type WorkspaceUpsertWithoutTablesInput = {
    update: XOR<WorkspaceUpdateWithoutTablesInput, WorkspaceUncheckedUpdateWithoutTablesInput>
    create: XOR<WorkspaceCreateWithoutTablesInput, WorkspaceUncheckedCreateWithoutTablesInput>
    where?: WorkspaceWhereInput
  }

  export type WorkspaceUpdateToOneWithWhereWithoutTablesInput = {
    where?: WorkspaceWhereInput
    data: XOR<WorkspaceUpdateWithoutTablesInput, WorkspaceUncheckedUpdateWithoutTablesInput>
  }

  export type WorkspaceUpdateWithoutTablesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
    users?: WorkspaceUserUpdateManyWithoutWorkspaceNestedInput
    formulas?: FormulaUpdateManyWithoutWorkspaceNestedInput
  }

  export type WorkspaceUncheckedUpdateWithoutTablesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
    users?: WorkspaceUserUncheckedUpdateManyWithoutWorkspaceNestedInput
    formulas?: FormulaUncheckedUpdateManyWithoutWorkspaceNestedInput
  }

  export type WorkspaceCreateWithoutFormulasInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: string
    users?: WorkspaceUserCreateNestedManyWithoutWorkspaceInput
    tables?: DataTableCreateNestedManyWithoutWorkspaceInput
  }

  export type WorkspaceUncheckedCreateWithoutFormulasInput = {
    id?: string
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy: string
    users?: WorkspaceUserUncheckedCreateNestedManyWithoutWorkspaceInput
    tables?: DataTableUncheckedCreateNestedManyWithoutWorkspaceInput
  }

  export type WorkspaceCreateOrConnectWithoutFormulasInput = {
    where: WorkspaceWhereUniqueInput
    create: XOR<WorkspaceCreateWithoutFormulasInput, WorkspaceUncheckedCreateWithoutFormulasInput>
  }

  export type WorkspaceUpsertWithoutFormulasInput = {
    update: XOR<WorkspaceUpdateWithoutFormulasInput, WorkspaceUncheckedUpdateWithoutFormulasInput>
    create: XOR<WorkspaceCreateWithoutFormulasInput, WorkspaceUncheckedCreateWithoutFormulasInput>
    where?: WorkspaceWhereInput
  }

  export type WorkspaceUpdateToOneWithWhereWithoutFormulasInput = {
    where?: WorkspaceWhereInput
    data: XOR<WorkspaceUpdateWithoutFormulasInput, WorkspaceUncheckedUpdateWithoutFormulasInput>
  }

  export type WorkspaceUpdateWithoutFormulasInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
    users?: WorkspaceUserUpdateManyWithoutWorkspaceNestedInput
    tables?: DataTableUpdateManyWithoutWorkspaceNestedInput
  }

  export type WorkspaceUncheckedUpdateWithoutFormulasInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
    users?: WorkspaceUserUncheckedUpdateManyWithoutWorkspaceNestedInput
    tables?: DataTableUncheckedUpdateManyWithoutWorkspaceNestedInput
  }

  export type WorkspaceUserCreateManyUserInput = {
    id?: string
    workspaceId: string
    addedAt?: Date | string
  }

  export type WorkspaceUserUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    addedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    workspace?: WorkspaceUpdateOneRequiredWithoutUsersNestedInput
  }

  export type WorkspaceUserUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    workspaceId?: StringFieldUpdateOperationsInput | string
    addedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WorkspaceUserUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    workspaceId?: StringFieldUpdateOperationsInput | string
    addedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WorkspaceUserCreateManyWorkspaceInput = {
    id?: string
    userId: string
    addedAt?: Date | string
  }

  export type DataTableCreateManyWorkspaceInput = {
    id?: string
    name: string
    sheetName: string
    uploadedAt?: Date | string
    updatedAt?: Date | string
    columns: JsonNullValueInput | InputJsonValue
    data: JsonNullValueInput | InputJsonValue
  }

  export type FormulaCreateManyWorkspaceInput = {
    id?: string
    name: string
    description?: string | null
    formula: string
    tableId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    color?: string | null
  }

  export type WorkspaceUserUpdateWithoutWorkspaceInput = {
    id?: StringFieldUpdateOperationsInput | string
    addedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutWorkspacesNestedInput
  }

  export type WorkspaceUserUncheckedUpdateWithoutWorkspaceInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    addedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WorkspaceUserUncheckedUpdateManyWithoutWorkspaceInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    addedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DataTableUpdateWithoutWorkspaceInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    sheetName?: StringFieldUpdateOperationsInput | string
    uploadedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    columns?: JsonNullValueInput | InputJsonValue
    data?: JsonNullValueInput | InputJsonValue
  }

  export type DataTableUncheckedUpdateWithoutWorkspaceInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    sheetName?: StringFieldUpdateOperationsInput | string
    uploadedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    columns?: JsonNullValueInput | InputJsonValue
    data?: JsonNullValueInput | InputJsonValue
  }

  export type DataTableUncheckedUpdateManyWithoutWorkspaceInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    sheetName?: StringFieldUpdateOperationsInput | string
    uploadedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    columns?: JsonNullValueInput | InputJsonValue
    data?: JsonNullValueInput | InputJsonValue
  }

  export type FormulaUpdateWithoutWorkspaceInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    formula?: StringFieldUpdateOperationsInput | string
    tableId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type FormulaUncheckedUpdateWithoutWorkspaceInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    formula?: StringFieldUpdateOperationsInput | string
    tableId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type FormulaUncheckedUpdateManyWithoutWorkspaceInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    formula?: StringFieldUpdateOperationsInput | string
    tableId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}
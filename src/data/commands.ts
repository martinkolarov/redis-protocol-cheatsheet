export type Command = {
  name: string;
  category: string;
  signature: string;
  params: string[];
  resp2: string;
  resp3: string;
  notes: string[];
  tags: string[];
};

const same = (reply: string) => ({ resp2: reply, resp3: reply });

export const commands: Command[] = [
  {
    name: "PING",
    category: "Connection / Server",
    signature: "PING [message]",
    params: ["message: optional bulk string echoed back instead of PONG."],
    ...same("Simple string PONG, or bulk string containing message."),
    notes: ["Allowed in Pub/Sub mode; with a message it is useful as an echo/latency probe."],
    tags: ["connection", "simple-string", "bulk-string"]
  },
  {
    name: "HELLO",
    category: "Connection / Server",
    signature: "HELLO protover [AUTH username password] [SETNAME clientname]",
    params: ["protover: 2 or 3.", "AUTH: authenticate during handshake.", "SETNAME: assign client name."],
    resp2: "Array of alternating bulk-string field names and RESP values.",
    resp3: "Map with server, version, proto, id, mode, role, and module metadata.",
    notes: ["Switches the connection protocol version. Invalid protover is an error.", "RESP3 clients should be ready for push messages outside direct request/reply flow."],
    tags: ["connection", "resp3", "map", "auth"]
  },
  {
    name: "AUTH",
    category: "Connection / Server",
    signature: "AUTH [username] password",
    params: ["username: ACL user, defaults to default user when omitted.", "password: secret."],
    ...same("Simple string OK on success; error on bad credentials."),
    notes: ["After an auth error, the connection remains open but unauthenticated."],
    tags: ["connection", "auth", "error"]
  },
  {
    name: "SELECT",
    category: "Connection / Server",
    signature: "SELECT index",
    params: ["index: zero-based logical database number."],
    ...same("Simple string OK."),
    notes: ["Database selection is per connection. Redis Cluster only supports database 0."],
    tags: ["connection", "db"]
  },
  {
    name: "CLIENT",
    category: "Connection / Server",
    signature: "CLIENT subcommand [arg ...]",
    params: ["subcommand: SETNAME, GETNAME, ID, INFO, LIST, KILL, PAUSE, REPLY, TRACKING, etc."],
    resp2: "Depends on subcommand: simple string, integer, bulk string, or array.",
    resp3: "Depends on subcommand; some structured replies may be maps or push-related behavior.",
    notes: ["CLIENT REPLY can suppress replies; client implementations must not assume every command yields a response after it is changed."],
    tags: ["connection", "admin", "push"]
  },
  {
    name: "QUIT",
    category: "Connection / Server",
    signature: "QUIT",
    params: ["No arguments."],
    ...same("Simple string OK, then server closes the connection."),
    notes: ["Modern clients can close the socket directly; still useful for protocol compatibility."],
    tags: ["connection"]
  },
  {
    name: "INFO",
    category: "Connection / Server",
    signature: "INFO [section]",
    params: ["section: optional section name such as server, clients, memory, stats, replication, commandstats, cluster."],
    ...same("Bulk string containing line-oriented key:value sections."),
    notes: ["Treat as textual diagnostics, not a stable machine schema."],
    tags: ["server", "bulk-string"]
  },
  {
    name: "COMMAND",
    category: "Connection / Server",
    signature: "COMMAND [subcommand [arg ...]]",
    params: ["subcommand: optional DOCS, INFO, COUNT, GETKEYS, GETKEYSANDFLAGS, LIST."],
    resp2: "Nested arrays containing bulk strings, integers, and sub-arrays for arity, flags, key specs, and metadata.",
    resp3: "Nested maps/arrays containing strings, integers, and sub-aggregates for richer command metadata where applicable.",
    notes: ["Use for capability discovery instead of hard-coding server command tables."],
    tags: ["server", "array", "map", "metadata"]
  },
  {
    name: "EXISTS",
    category: "Generic Keys",
    signature: "EXISTS key [key ...]",
    params: ["key: one or more keys; duplicates are counted independently."],
    ...same("Integer count of existing keys."),
    notes: ["A repeated existing key increments the count each time it appears."],
    tags: ["keys", "integer"]
  },
  {
    name: "DEL",
    category: "Generic Keys",
    signature: "DEL key [key ...]",
    params: ["key: one or more keys."],
    ...same("Integer count of keys removed."),
    notes: ["Synchronous deletion; large values can block the server briefly."],
    tags: ["keys", "integer"]
  },
  {
    name: "UNLINK",
    category: "Generic Keys",
    signature: "UNLINK key [key ...]",
    params: ["key: one or more keys."],
    ...same("Integer count of keys unlinked."),
    notes: ["Removes names from keyspace immediately and frees memory asynchronously."],
    tags: ["keys", "integer"]
  },
  {
    name: "TYPE",
    category: "Generic Keys",
    signature: "TYPE key",
    params: ["key: key to inspect."],
    ...same("Simple string: none, string, list, set, zset, hash, stream, etc."),
    notes: ["Returns none for missing keys; not an error."],
    tags: ["keys", "simple-string"]
  },
  {
    name: "EXPIRE",
    category: "Generic Keys",
    signature: "EXPIRE key seconds [NX | XX | GT | LT]",
    params: ["seconds: TTL in seconds.", "NX/XX/GT/LT: optional condition."],
    ...same("Integer 1 if timeout was set or key was deleted immediately; 0 if key is missing or NX/XX/GT/LT condition fails."),
    notes: ["Missing keys return 0. Condition failures also return 0. Non-positive expiry deletes immediately and returns 1 if the key existed."],
    tags: ["keys", "ttl", "integer"]
  },
  {
    name: "PEXPIRE",
    category: "Generic Keys",
    signature: "PEXPIRE key milliseconds [NX | XX | GT | LT]",
    params: ["milliseconds: TTL in ms.", "NX/XX/GT/LT: optional condition."],
    ...same("Integer 1 if timeout was set or key was deleted immediately; 0 if key is missing or NX/XX/GT/LT condition fails."),
    notes: ["Same semantics as EXPIRE but millisecond precision: missing key and condition miss both return 0."],
    tags: ["keys", "ttl", "integer"]
  },
  {
    name: "TTL",
    category: "Generic Keys",
    signature: "TTL key",
    params: ["key: key to inspect."],
    ...same("Integer seconds remaining; -1 no expiry; -2 missing key."),
    notes: ["Do not confuse -1 with a missing key."],
    tags: ["keys", "ttl", "integer", "nil"]
  },
  {
    name: "PTTL",
    category: "Generic Keys",
    signature: "PTTL key",
    params: ["key: key to inspect."],
    ...same("Integer milliseconds remaining; -1 no expiry; -2 missing key."),
    notes: ["Millisecond variant of TTL."],
    tags: ["keys", "ttl", "integer", "nil"]
  },
  {
    name: "SCAN",
    category: "Generic Keys",
    signature: "SCAN cursor [MATCH pattern] [COUNT count] [TYPE type]",
    params: ["cursor: cursor from previous call; start with 0.", "MATCH/COUNT/TYPE: optional filters/hints."],
    resp2: "Two-element array: bulk string next cursor, then array of bulk-string key names.",
    resp3: "Two-element array: blob string next cursor, then array of blob-string key names.",
    notes: ["Cursor 0 means iteration complete. COUNT is a hint; duplicates can appear."],
    tags: ["keys", "array", "cursor"]
  },
  {
    name: "KEYS",
    category: "Generic Keys",
    signature: "KEYS pattern",
    params: ["pattern: glob-style pattern."],
    resp2: "Array of bulk-string key names.",
    resp3: "Array of blob-string key names.",
    notes: ["Blocking O(N) operation; avoid on production hot paths."],
    tags: ["keys", "array", "blocking"]
  },
  {
    name: "RENAME",
    category: "Generic Keys",
    signature: "RENAME key newkey",
    params: ["key: existing key.", "newkey: destination name."],
    ...same("Simple string OK."),
    notes: ["Errors if source is missing. Overwrites destination if it exists."],
    tags: ["keys", "error"]
  },
  {
    name: "GET",
    category: "Strings",
    signature: "GET key",
    params: ["key: string key."],
    resp2: "Bulk string value, or null bulk string $-1 when missing.",
    resp3: "Blob string value, or null _ when missing.",
    notes: ["Wrong type returns WRONGTYPE error."],
    tags: ["string", "bulk-string", "nil", "error"]
  },
  {
    name: "SET",
    category: "Strings",
    signature: "SET key value [NX | XX] [GET] [EX seconds | PX ms | EXAT unix | PXAT ms-unix | KEEPTTL]",
    params: ["value: binary-safe bulk string.", "NX/XX: conditional set.", "GET: return previous value.", "expiry option: optional TTL behavior."],
    resp2: "Simple string OK; with GET, old bulk string or null bulk when previous value is missing; with NX/XX miss, null bulk and no write.",
    resp3: "Simple string OK; with GET, old blob string or null when previous value is missing; with NX/XX miss, null and no write.",
    notes: ["SET replaces older SETNX/SETEX/PSETEX patterns. GET changes the reply type. Null can mean either previous value missing or conditional write skipped."],
    tags: ["string", "nil", "ttl"]
  },
  {
    name: "MGET",
    category: "Strings",
    signature: "MGET key [key ...]",
    params: ["key: one or more keys."],
    resp2: "Array of bulk strings; missing or non-string keys are null bulk strings.",
    resp3: "Array of blob strings/null values.",
    notes: ["Array length always matches requested key count."],
    tags: ["string", "array", "nil"]
  },
  {
    name: "MSET",
    category: "Strings",
    signature: "MSET key value [key value ...]",
    params: ["key value: one or more pairs."],
    ...same("Simple string OK."),
    notes: ["Atomic across all specified keys."],
    tags: ["string"]
  },
  {
    name: "INCR",
    category: "Strings",
    signature: "INCR key",
    params: ["key: integer-encoded string or missing key."],
    ...same("Integer new value."),
    notes: ["Missing key is initialized to 0 before increment. Errors on non-integer or overflow."],
    tags: ["string", "integer", "error"]
  },
  {
    name: "DECR",
    category: "Strings",
    signature: "DECR key",
    params: ["key: integer-encoded string or missing key."],
    ...same("Integer new value."),
    notes: ["Missing key is initialized to 0 before decrement. Errors on non-integer or overflow."],
    tags: ["string", "integer", "error"]
  },
  {
    name: "APPEND",
    category: "Strings",
    signature: "APPEND key value",
    params: ["value: bytes appended to current string."],
    ...same("Integer length of string after append."),
    notes: ["Missing key is treated as empty string. Wrong type errors."],
    tags: ["string", "integer"]
  },
  {
    name: "STRLEN",
    category: "Strings",
    signature: "STRLEN key",
    params: ["key: string key."],
    ...same("Integer byte length; 0 for missing key."),
    notes: ["Length is bytes, not characters."],
    tags: ["string", "integer"]
  },
  {
    name: "GETRANGE",
    category: "Strings",
    signature: "GETRANGE key start end",
    params: ["start/end: inclusive byte offsets; negative indexes count from end."],
    ...same("Bulk/blob string slice; empty string when range misses or key is missing."),
    notes: ["Offsets are byte-based and inclusive."],
    tags: ["string", "bulk-string"]
  },
  {
    name: "HGET",
    category: "Hashes",
    signature: "HGET key field",
    params: ["field: hash field name."],
    resp2: "Bulk string value or null bulk string if key/field is missing.",
    resp3: "Blob string value or null if key/field is missing.",
    notes: ["Wrong type errors if key exists and is not a hash."],
    tags: ["hash", "nil", "bulk-string"]
  },
  {
    name: "HSET",
    category: "Hashes",
    signature: "HSET key field value [field value ...]",
    params: ["field value: one or more field/value pairs."],
    ...same("Integer count of newly added fields."),
    notes: ["Existing fields are overwritten but not counted as new."],
    tags: ["hash", "integer"]
  },
  {
    name: "HMGET",
    category: "Hashes",
    signature: "HMGET key field [field ...]",
    params: ["field: one or more fields."],
    resp2: "Array of bulk strings/null bulk strings.",
    resp3: "Array of blob strings/null values.",
    notes: ["Array length matches requested fields, even when key is missing."],
    tags: ["hash", "array", "nil"]
  },
  {
    name: "HGETALL",
    category: "Hashes",
    signature: "HGETALL key",
    params: ["key: hash key."],
    resp2: "Flat array of alternating bulk strings: [field, value, field, value, ...].",
    resp3: "Map of blob-string field => blob-string value.",
    notes: ["Missing key returns empty array/map. Field order is not stable."],
    tags: ["hash", "array", "map"]
  },
  {
    name: "HDEL",
    category: "Hashes",
    signature: "HDEL key field [field ...]",
    params: ["field: one or more fields."],
    ...same("Integer count of fields removed."),
    notes: ["Missing fields and missing keys are ignored."],
    tags: ["hash", "integer"]
  },
  {
    name: "HEXISTS",
    category: "Hashes",
    signature: "HEXISTS key field",
    params: ["field: field to test."],
    ...same("Integer 1 if field exists, 0 otherwise."),
    notes: ["RESP2 and RESP3 still use integer truth here."],
    tags: ["hash", "integer"]
  },
  {
    name: "HSCAN",
    category: "Hashes",
    signature: "HSCAN key cursor [MATCH pattern] [COUNT count] [NOVALUES]",
    params: ["cursor: hash iterator cursor.", "NOVALUES: return fields only when supported."],
    resp2: "Two-element array: bulk string next cursor, then flat array of bulk-string field/value pairs, or fields only with NOVALUES.",
    resp3: "Two-element array: blob string next cursor, then array of blob-string field/value pairs, or fields only with NOVALUES.",
    notes: ["Cursor semantics match SCAN; COUNT is a hint and duplicates can appear."],
    tags: ["hash", "array", "cursor"]
  },
  {
    name: "LPUSH",
    category: "Lists",
    signature: "LPUSH key element [element ...]",
    params: ["element: one or more values inserted at head."],
    ...same("Integer list length after push."),
    notes: ["Multiple elements are inserted left-to-right at the head; final order is reversed relative to argument order."],
    tags: ["list", "integer"]
  },
  {
    name: "RPUSH",
    category: "Lists",
    signature: "RPUSH key element [element ...]",
    params: ["element: one or more values inserted at tail."],
    ...same("Integer list length after push."),
    notes: ["Creates list when key is missing; wrong type errors."],
    tags: ["list", "integer"]
  },
  {
    name: "LPOP",
    category: "Lists",
    signature: "LPOP key [count]",
    params: ["count: optional number of elements."],
    resp2: "Without count: bulk string element or null bulk string. With count: array of bulk-string elements, or null bulk string when missing.",
    resp3: "Without count: blob string element or null. With count: array of blob-string elements, or null when missing.",
    notes: ["Reply shape changes when count is present."],
    tags: ["list", "array", "nil"]
  },
  {
    name: "RPOP",
    category: "Lists",
    signature: "RPOP key [count]",
    params: ["count: optional number of elements."],
    resp2: "Without count: bulk string element or null bulk string. With count: array of bulk-string elements, or null bulk string when missing.",
    resp3: "Without count: blob string element or null. With count: array of blob-string elements, or null when missing.",
    notes: ["Reply shape changes when count is present."],
    tags: ["list", "array", "nil"]
  },
  {
    name: "LRANGE",
    category: "Lists",
    signature: "LRANGE key start stop",
    params: ["start/stop: inclusive indexes; negative indexes count from tail."],
    resp2: "Array of bulk-string elements; empty array for missing key or empty range.",
    resp3: "Array of blob-string elements; empty array for missing key or empty range.",
    notes: ["stop is inclusive, unlike many programming-language slices."],
    tags: ["list", "array"]
  },
  {
    name: "LLEN",
    category: "Lists",
    signature: "LLEN key",
    params: ["key: list key."],
    ...same("Integer list length; 0 for missing key."),
    notes: ["Wrong type errors."],
    tags: ["list", "integer"]
  },
  {
    name: "BLPOP",
    category: "Lists",
    signature: "BLPOP key [key ...] timeout",
    params: ["key: one or more lists in priority order.", "timeout: seconds; 0 blocks indefinitely."],
    resp2: "Two-element array: bulk string key name, bulk string popped element; null array *-1 on timeout.",
    resp3: "Two-element array: blob string key name, blob string popped element; null _ on timeout.",
    notes: ["Connection blocks until data, timeout, or disconnect. First non-empty key wins by argument order."],
    tags: ["list", "blocking", "array", "nil"]
  },
  {
    name: "BRPOP",
    category: "Lists",
    signature: "BRPOP key [key ...] timeout",
    params: ["key: one or more lists in priority order.", "timeout: seconds; 0 blocks indefinitely."],
    resp2: "Two-element array: bulk string key name, bulk string popped element; null array *-1 on timeout.",
    resp3: "Two-element array: blob string key name, blob string popped element; null _ on timeout.",
    notes: ["Blocking tail pop. Same timeout/null semantics as BLPOP."],
    tags: ["list", "blocking", "array", "nil"]
  },
  {
    name: "SADD",
    category: "Sets",
    signature: "SADD key member [member ...]",
    params: ["member: one or more set members."],
    ...same("Integer count of members newly added."),
    notes: ["Existing members are ignored and not counted."],
    tags: ["set", "integer"]
  },
  {
    name: "SREM",
    category: "Sets",
    signature: "SREM key member [member ...]",
    params: ["member: one or more set members."],
    ...same("Integer count of members removed."),
    notes: ["Missing members and missing keys are ignored."],
    tags: ["set", "integer"]
  },
  {
    name: "SMEMBERS",
    category: "Sets",
    signature: "SMEMBERS key",
    params: ["key: set key."],
    resp2: "Array of bulk-string members.",
    resp3: "Set aggregate of blob-string members.",
    notes: ["Ordering is unspecified. Missing key returns empty collection."],
    tags: ["set", "array", "resp3-set"]
  },
  {
    name: "SISMEMBER",
    category: "Sets",
    signature: "SISMEMBER key member",
    params: ["member: value to test."],
    ...same("Integer 1 if member exists, 0 otherwise."),
    notes: ["Missing key returns 0."],
    tags: ["set", "integer"]
  },
  {
    name: "SCARD",
    category: "Sets",
    signature: "SCARD key",
    params: ["key: set key."],
    ...same("Integer cardinality; 0 for missing key."),
    notes: ["Wrong type errors."],
    tags: ["set", "integer"]
  },
  {
    name: "SSCAN",
    category: "Sets",
    signature: "SSCAN key cursor [MATCH pattern] [COUNT count]",
    params: ["cursor: set iterator cursor."],
    resp2: "Two-element array: bulk string next cursor, then array of bulk-string members.",
    resp3: "Two-element array: blob string next cursor, then array of blob-string members.",
    notes: ["Cursor semantics match SCAN; duplicates can appear."],
    tags: ["set", "array", "cursor"]
  },
  {
    name: "ZADD",
    category: "Sorted Sets",
    signature: "ZADD key [NX | XX] [GT | LT] [CH] [INCR] score member [score member ...]",
    params: ["score member: one or more pairs.", "CH: count changed members.", "INCR: increment score of a single member."],
    resp2: "Integer added count, bulk string new score with INCR, or null bulk when INCR is skipped by NX/XX/GT/LT.",
    resp3: "Integer added count, double/blob new score with INCR, or null when INCR is skipped by NX/XX/GT/LT.",
    notes: ["Scores parse as doubles. NaN is rejected. INCR accepts only one pair. With INCR, a failed condition returns null instead of an integer count."],
    tags: ["zset", "integer", "double"]
  },
  {
    name: "ZRANGE",
    category: "Sorted Sets",
    signature: "ZRANGE key start stop [BYSCORE | BYLEX] [REV] [LIMIT offset count] [WITHSCORES]",
    params: ["start/stop: index, score, or lex bounds depending on mode.", "WITHSCORES: include score after each member."],
    resp2: "Array of bulk-string members, or flat array of bulk-string member/score pairs with WITHSCORES.",
    resp3: "Array of blob-string members, or flat array of blob-string member/score pairs with WITHSCORES.",
    notes: ["WITHSCORES returns scores as strings; clients usually parse to double by choice."],
    tags: ["zset", "array"]
  },
  {
    name: "ZREM",
    category: "Sorted Sets",
    signature: "ZREM key member [member ...]",
    params: ["member: one or more members."],
    ...same("Integer count of removed members."),
    notes: ["Missing members and missing keys are ignored."],
    tags: ["zset", "integer"]
  },
  {
    name: "ZSCORE",
    category: "Sorted Sets",
    signature: "ZSCORE key member",
    params: ["member: sorted-set member."],
    resp2: "Bulk string score, or null bulk string when missing.",
    resp3: "Double or blob string score depending on server version, or null when missing.",
    notes: ["Clients should preserve exact text if they do not want floating-point round-trip changes."],
    tags: ["zset", "double", "nil"]
  },
  {
    name: "ZRANK",
    category: "Sorted Sets",
    signature: "ZRANK key member [WITHSCORE]",
    params: ["WITHSCORE: optionally include score."],
    resp2: "Integer rank, null bulk string when missing; with WITHSCORE: two-element array [integer rank, bulk string score].",
    resp3: "Integer rank or null; with WITHSCORE: two-element array [integer rank, blob string or double score].",
    notes: ["Rank is zero-based and ascending by score."],
    tags: ["zset", "integer", "nil", "array"]
  },
  {
    name: "ZCARD",
    category: "Sorted Sets",
    signature: "ZCARD key",
    params: ["key: sorted set key."],
    ...same("Integer cardinality; 0 for missing key."),
    notes: ["Wrong type errors."],
    tags: ["zset", "integer"]
  },
  {
    name: "ZSCAN",
    category: "Sorted Sets",
    signature: "ZSCAN key cursor [MATCH pattern] [COUNT count]",
    params: ["cursor: sorted-set iterator cursor."],
    resp2: "Two-element array: bulk string next cursor, then flat array of bulk-string member/score pairs.",
    resp3: "Two-element array: blob string next cursor, then flat array of blob-string member/score pairs.",
    notes: ["Cursor semantics match SCAN; scores are returned as bulk/blob strings."],
    tags: ["zset", "array", "cursor"]
  },
  {
    name: "XADD",
    category: "Streams",
    signature: "XADD key [NOMKSTREAM] [KEEPREF | DELREF | ACKED] [MAXLEN | MINID [= | ~] threshold [LIMIT count]] id field value [field value ...]",
    params: ["id: * for server-generated ID, or explicit ms-seq ID.", "field value: one or more pairs."],
    resp2: "Bulk string entry ID, or null bulk string if NOMKSTREAM prevents creating a missing stream.",
    resp3: "Blob string entry ID, or null if NOMKSTREAM prevents creating a missing stream.",
    notes: ["IDs must be greater than the stream top ID except special forms. Field/value arity must be even. NOMKSTREAM turns missing-stream creation into a null reply, not an error."],
    tags: ["stream", "bulk-string", "nil"]
  },
  {
    name: "XRANGE",
    category: "Streams",
    signature: "XRANGE key start end [COUNT count]",
    params: ["start/end: IDs or -/+ bounds.", "COUNT: optional max entries."],
    resp2: "Array of entries; each entry is [bulk string id, flat array of bulk-string field/value pairs].",
    resp3: "Array of entries; each entry is [blob string id, map of blob-string field => blob-string value].",
    notes: ["Inclusive range. Missing stream returns empty array."],
    tags: ["stream", "array", "map"]
  },
  {
    name: "XREAD",
    category: "Streams",
    signature: "XREAD [COUNT count] [BLOCK milliseconds] STREAMS key [key ...] id [id ...]",
    params: ["STREAMS: keys followed by matching last-seen IDs.", "BLOCK: optional blocking wait."],
    resp2: "Success is a stream result array; after a blocked wait it often contains only the stream/entry that satisfied the wait. Null array means no stream can be served immediately without BLOCK, or BLOCK timed out.",
    resp3: "Success is a stream result map; after a blocked wait it often contains only the stream/entry that satisfied the wait. Null _ means no stream can be served immediately without BLOCK, or BLOCK timed out.",
    notes: ["With BLOCK, Redis returns synchronously if data is already available. If it waits, the success reply keeps the same schema but commonly has a much smaller payload. BLOCK 0 waits indefinitely."],
    tags: ["stream", "blocking", "array", "map", "nil"]
  },
  {
    name: "XGROUP",
    category: "Streams",
    signature: "XGROUP subcommand key group [arg ...]",
    params: ["subcommand: CREATE, SETID, DESTROY, CREATECONSUMER, DELCONSUMER, etc."],
    ...same("Usually simple string OK or integer count, depending on subcommand."),
    notes: ["CREATE with MKSTREAM can create an empty stream. Duplicate group is BUSYGROUP error."],
    tags: ["stream", "group", "integer"]
  },
  {
    name: "XREADGROUP",
    category: "Streams",
    signature: "XREADGROUP GROUP group consumer [COUNT count] [BLOCK ms] [NOACK] STREAMS key [key ...] id [id ...]",
    params: ["group/consumer: consumer group identity.", "id: > for new messages or explicit pending IDs."],
    resp2: "Success is a stream result array; after a blocked wait it often contains only the stream/entry that satisfied the wait. Null array means no entries can be served immediately without BLOCK, or BLOCK timed out.",
    resp3: "Success is a stream result map; after a blocked wait it often contains only the stream/entry that satisfied the wait. Null _ means no entries can be served immediately without BLOCK, or BLOCK timed out.",
    notes: ["Using > reads never-delivered entries. With BLOCK, Redis returns synchronously if data is already available; after waiting, the success reply keeps the same schema but commonly has a smaller payload."],
    tags: ["stream", "blocking", "group", "map", "nil"]
  },
  {
    name: "XACK",
    category: "Streams",
    signature: "XACK key group id [id ...]",
    params: ["id: one or more stream entry IDs."],
    ...same("Integer count of acknowledged entries."),
    notes: ["Only pending entries in the group are counted."],
    tags: ["stream", "group", "integer"]
  },
  {
    name: "SUBSCRIBE",
    category: "Pub/Sub",
    signature: "SUBSCRIBE channel [channel ...]",
    params: ["channel: one or more channels."],
    resp2: "Connection enters subscribed mode; arrays like [bulk string subscribe, bulk string channel, integer count] and [bulk string message, bulk string channel, bulk string payload].",
    resp3: "Push messages containing event name strings plus blob-string channel/payload values; connection can also issue other commands.",
    notes: ["RESP2 subscribed mode restricts allowed commands. RESP3 models Pub/Sub as push data."],
    tags: ["pubsub", "push", "array"]
  },
  {
    name: "PSUBSCRIBE",
    category: "Pub/Sub",
    signature: "PSUBSCRIBE pattern [pattern ...]",
    params: ["pattern: glob-style channel pattern."],
    resp2: "Arrays like [bulk string psubscribe, bulk string pattern, integer count] and [bulk string pmessage, bulk string pattern, bulk string channel, bulk string payload].",
    resp3: "Push messages containing event name strings plus blob-string pattern/channel/payload values.",
    notes: ["Pattern matching happens server-side against published channel names."],
    tags: ["pubsub", "push", "array"]
  },
  {
    name: "PUBLISH",
    category: "Pub/Sub",
    signature: "PUBLISH channel message",
    params: ["channel: destination channel.", "message: payload bytes."],
    ...same("Integer number of clients that received the message."),
    notes: ["Delivery is fire-and-forget; messages are not persisted."],
    tags: ["pubsub", "integer"]
  },
  {
    name: "UNSUBSCRIBE",
    category: "Pub/Sub",
    signature: "UNSUBSCRIBE [channel [channel ...]]",
    params: ["channel: optional channels; omitted means all."],
    resp2: "Array acknowledgement: [bulk string unsubscribe, bulk string channel, integer remaining-count].",
    resp3: "Push acknowledgement containing event name, blob-string channel, and integer remaining-count.",
    notes: ["When subscription count reaches zero, RESP2 connection returns to normal command mode."],
    tags: ["pubsub", "push", "array"]
  },
  {
    name: "MULTI",
    category: "Transactions",
    signature: "MULTI",
    params: ["No arguments."],
    ...same("Simple string OK."),
    notes: ["Subsequent commands are queued until EXEC/DISCARD, except immediate syntax/queueing errors."],
    tags: ["transaction"]
  },
  {
    name: "EXEC",
    category: "Transactions",
    signature: "EXEC",
    params: ["No arguments."],
    resp2: "Array whose elements are the queued commands' native RESP replies, or null array *-1 if WATCH invalidated the transaction.",
    resp3: "Array whose elements are the queued commands' native RESP replies, or null _ if WATCH invalidated the transaction.",
    notes: ["Runtime command errors appear as error elements inside the EXEC reply array."],
    tags: ["transaction", "array", "nil", "error"]
  },
  {
    name: "DISCARD",
    category: "Transactions",
    signature: "DISCARD",
    params: ["No arguments."],
    ...same("Simple string OK."),
    notes: ["Clears queued transaction and unwatches keys for the connection."],
    tags: ["transaction"]
  },
  {
    name: "WATCH",
    category: "Transactions",
    signature: "WATCH key [key ...]",
    params: ["key: one or more keys to monitor."],
    ...same("Simple string OK."),
    notes: ["If any watched key changes before EXEC, EXEC returns null."],
    tags: ["transaction", "watch"]
  },
  {
    name: "UNWATCH",
    category: "Transactions",
    signature: "UNWATCH",
    params: ["No arguments."],
    ...same("Simple string OK."),
    notes: ["Clears all watched keys for the connection."],
    tags: ["transaction", "watch"]
  },
  {
    name: "EVAL",
    category: "Scripting",
    signature: "EVAL script numkeys [key [key ...]] [arg [arg ...]]",
    params: ["script: Lua source.", "numkeys: number of following key arguments.", "arg: remaining script arguments."],
    resp2: "Lua conversion result: bulk string, integer, array, null, status, or error.",
    resp3: "Lua conversion result using RESP3-capable mappings where applicable.",
    notes: ["Scripts are atomic. Keys must be declared via numkeys for cluster/key tracking correctness."],
    tags: ["scripting", "array", "error"]
  },
  {
    name: "EVALSHA",
    category: "Scripting",
    signature: "EVALSHA sha1 numkeys [key [key ...]] [arg [arg ...]]",
    params: ["sha1: cached script digest.", "numkeys/key/arg: same as EVAL."],
    resp2: "Same as EVAL, or NOSCRIPT error when digest is unknown.",
    resp3: "Same as EVAL, or NOSCRIPT error when digest is unknown.",
    notes: ["Clients commonly fall back to EVAL after NOSCRIPT."],
    tags: ["scripting", "error"]
  },
  {
    name: "SCRIPT LOAD",
    category: "Scripting",
    signature: "SCRIPT LOAD script",
    params: ["script: Lua source to cache."],
    ...same("Bulk/blob string SHA1 digest."),
    notes: ["Loads but does not execute the script."],
    tags: ["scripting", "bulk-string"]
  },
  {
    name: "SCRIPT EXISTS",
    category: "Scripting",
    signature: "SCRIPT EXISTS sha1 [sha1 ...]",
    params: ["sha1: one or more script digests."],
    ...same("Array of integers, one per SHA1: 1 exists, 0 missing."),
    notes: ["Array order matches requested digests."],
    tags: ["scripting", "array", "integer"]
  },
  {
    name: "CLUSTER SLOTS",
    category: "Cluster Basics",
    signature: "CLUSTER SLOTS",
    params: ["No arguments."],
    resp2: "Nested arrays: [integer start-slot, integer end-slot, master node array, replica node arrays...]; node arrays contain host bulk string, port integer, node ID bulk string, and optional metadata.",
    resp3: "Nested arrays/maps depending on Redis version; includes integer slot ranges and node endpoint strings/metadata.",
    notes: ["Prefer CLUSTER SHARDS for newer clients when available, but SLOTS is widely implemented."],
    tags: ["cluster", "array", "map"]
  },
  {
    name: "CLUSTER NODES",
    category: "Cluster Basics",
    signature: "CLUSTER NODES",
    params: ["No arguments."],
    ...same("Bulk/blob string with one line per node."),
    notes: ["Textual format; robust parsers must handle flags and optional endpoint metadata."],
    tags: ["cluster", "bulk-string"]
  },
  {
    name: "ASKING",
    category: "Cluster Basics",
    signature: "ASKING",
    params: ["No arguments."],
    ...same("Simple string OK."),
    notes: ["Send before the redirected command after an ASK redirect, on the target connection."],
    tags: ["cluster", "redirect"]
  },
  {
    name: "READONLY",
    category: "Cluster Basics",
    signature: "READONLY",
    params: ["No arguments."],
    ...same("Simple string OK."),
    notes: ["Allows readonly commands against cluster replicas when the key slot is served by the replica's master."],
    tags: ["cluster", "replica"]
  }
];

export const categories = Array.from(new Set(commands.map((command) => command.category)));

export const concernFilters = [
  { label: "nil / null", tag: "nil" },
  { label: "errors", tag: "error" },
  { label: "blocking", tag: "blocking" },
  { label: "push", tag: "push" },
  { label: "cursor", tag: "cursor" },
  { label: "expiry", tag: "ttl" },
  { label: "transactions", tag: "transaction" },
  { label: "cluster", tag: "cluster" },
  { label: "auth", tag: "auth" },
  { label: "scripting", tag: "scripting" }
];
